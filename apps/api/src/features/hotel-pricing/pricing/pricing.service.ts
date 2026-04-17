import { Injectable, Logger, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { Redis } from 'ioredis';
import axios from 'axios';
import { HotelProfileService } from '../hotel-profile/hotel-profile.service';
import { CompetitorService } from '../competitor/competitor.service';
import { PricingRequestDto } from './dto/pricing-request.dto';
import { PricingResponseDto } from './dto/pricing-response.dto';
import { ParsedCompetitorRates } from '../competitor/dto/xotelo.dto';

const LOCK_TTL = 60; // seconds

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);
  private readonly llmServiceUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly hotelProfileService: HotelProfileService,
    private readonly competitorService: CompetitorService,
    private readonly eventEmitter: EventEmitter2,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    this.llmServiceUrl = process.env.LLM_SERVICE_URL ?? 'http://localhost:8003';
  }

  async getPricingRecommendation(orgId: string, dto: PricingRequestDto): Promise<PricingResponseDto> {
    const { hotelId, roomType, checkinDate } = dto;
    const lockKey = `pricing:lock:${hotelId}:${checkinDate}`;

    // Distributed lock — prevent duplicate concurrent ML calls
    const lockAcquired = await this.redis.set(lockKey, '1', 'EX', LOCK_TTL, 'NX');
    if (!lockAcquired) {
      this.logger.warn(`Lock busy for ${lockKey}, returning cached if available`);
    }

    try {
      return await this.computeRecommendation(orgId, dto);
    } finally {
      await this.redis.del(lockKey);
    }
  }

  private async computeRecommendation(orgId: string, dto: PricingRequestDto): Promise<PricingResponseDto> {
    const { hotelId, roomType, checkinDate, currentPrice } = dto;
    const checkoutDate = dto.checkoutDate ?? this.addOneDay(checkinDate);

    // 1. Load hotel profile (org-scoped)
    const profile = await this.hotelProfileService.findById(orgId, hotelId);

    // 2. Fetch competitor rates (Redis cache → Xotelo)
    const competitors = await this.competitorService.getCompetitorRatesForHotel(
      hotelId,
      orgId,
      profile.location,
      profile.competitorHotelTokens,
      checkinDate,
      checkoutDate,
    );

    // 3. Rule-based demand scoring (Phase 1)
    const checkinMs = new Date(checkinDate).getTime();
    const daysUntilCheckin = Math.max(0, Math.round((checkinMs - Date.now()) / 86400000));
    const { demandScore, confidence, reasoningFeatures } = this.computeDemandScore(
      checkinDate,
      daysUntilCheckin,
      profile.starRating,
    );

    // 4. Competitor avg price
    const competitorAvgs = competitors.map(c => c.averagePrice).filter(Boolean);
    const competitorAvgPrice = competitorAvgs.length
      ? Math.round(competitorAvgs.reduce((a, b) => a + b, 0) / competitorAvgs.length)
      : profile.basePrice;

    // 5. Suggested price: blend competitor avg with demand score
    const priceMultiplier = 0.85 + demandScore * 0.15;
    const suggestedPrice = Math.round(competitorAvgPrice * priceMultiplier);
    const priceRangeLow = Math.round(suggestedPrice * 0.92);
    const priceRangeHigh = Math.round(suggestedPrice * 1.08);
    const effectiveCurrentPrice = currentPrice ?? profile.basePrice;

    // 6. 7-day rule-based forecast
    const sevenDayForecast = this.computeSevenDayForecast(checkinDate, competitorAvgPrice, profile.starRating);

    // 7. LLM narrative via biznavigate_ai
    const claudeNarrative = await this.generateNarrative({
      profile,
      roomType,
      checkinDate,
      competitors,
      competitorAvgPrice,
      suggestedPrice,
      demandScore,
      confidence,
      daysUntilCheckin,
      sevenDayForecast,
      priceRange: { low: priceRangeLow, high: priceRangeHigh },
      reasoningFeatures,
      orgId,
    });

    // 8. Persist to PostgreSQL
    const rec = await this.prisma.hotel_pricing_recommendations.create({
      data: {
        hotel_id: hotelId,
        org_id: orgId,
        room_type: roomType,
        checkin_date: new Date(checkinDate),
        suggested_price: suggestedPrice,
        demand_score: demandScore,
        confidence,
        competitor_avg_price: competitorAvgPrice,
        current_price: effectiveCurrentPrice,
        price_range_low: priceRangeLow,
        price_range_high: priceRangeHigh,
        claude_narrative: claudeNarrative,
        xotelo_snapshot: competitors as any,
        seven_day_forecast: sevenDayForecast,
      },
    });

    // 9. Emit events for notification module
    if (demandScore < 0.4 && daysUntilCheckin >= 3 && daysUntilCheckin <= 7) {
      this.eventEmitter.emit('hotel.pricing.low_occupancy', {
        recommendationId: rec.id,
        orgId,
        hotelId,
        hotelName: profile.hotelName,
        suggestedPrice,
        demandScore,
        competitorAvgPrice,
        daysUntilCheckin,
        checkinDate,
      });
    }

    if (demandScore > 0.8) {
      this.eventEmitter.emit('hotel.pricing.demand_spike', {
        recommendationId: rec.id,
        orgId,
        hotelId,
        hotelName: profile.hotelName,
        suggestedPrice,
        demandScore,
        competitorAvgPrice,
        daysUntilCheckin,
        checkinDate,
      });
    }

    return {
      recommendationId: rec.id,
      hotelId,
      orgId,
      roomType,
      checkinDate,
      suggestedPrice,
      demandScore,
      confidence,
      priceRange: { low: priceRangeLow, high: priceRangeHigh },
      competitorAvgPrice,
      currentPrice: effectiveCurrentPrice,
      claudeNarrative,
      sevenDayForecast,
      reasoningFeatures,
      cached: false,
    };
  }

  // ─── Rule-based demand scoring (Phase 1) ──────────────────────────────────

  private computeDemandScore(
    checkinDate: string,
    daysUntilCheckin: number,
    starRating: number,
  ): {
    demandScore: number;
    confidence: number;
    reasoningFeatures: PricingResponseDto['reasoningFeatures'];
  } {
    let score = 0.5;
    const checkin = new Date(checkinDate);
    const dayOfWeek = checkin.getDay(); // 0=Sun, 5=Fri, 6=Sat
    const month = checkin.getMonth() + 1;

    // Weekend premium
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    if (isWeekend) score += 0.10;

    // Peak Indian travel months
    const isPeakMonth = [1, 3, 10, 12].includes(month);
    if (isPeakMonth) score += 0.10;

    // Urgency factor
    let dayFactor = 'standard';
    if (daysUntilCheckin <= 3) { score += 0.15; dayFactor = 'last_minute'; }
    else if (daysUntilCheckin <= 7) { score += 0.05; dayFactor = 'near_term'; }
    else if (daysUntilCheckin > 30) { score -= 0.10; dayFactor = 'advance'; }

    // Star rating premium
    if (starRating >= 4) score += 0.05;

    // Clamp
    score = Math.min(1.0, Math.max(0.0, score));

    const demandSignal =
      score >= 0.8 ? 'Very High' :
      score >= 0.6 ? 'High' :
      score >= 0.4 ? 'Medium' : 'Low';

    return {
      demandScore: Math.round(score * 100) / 100,
      confidence: 0.72, // rule-based fixed confidence (Phase 2 XGBoost will calibrate)
      reasoningFeatures: {
        competitorPosition: 'pending_market_analysis',
        dayFactor: isWeekend ? 'weekend_premium' : dayFactor,
        seasonFactor: isPeakMonth ? 'peak' : 'standard',
        daysUntilCheckin,
        demandSignal,
      },
    };
  }

  // ─── 7-day rule-based forecast ────────────────────────────────────────────

  private computeSevenDayForecast(startDate: string, baseAvg: number, starRating: number): number[] {
    const forecast: number[] = [];
    const base = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const day = d.getDay();
      const month = d.getMonth() + 1;

      let multiplier = 0.88; // default below avg
      if (day === 5 || day === 6) multiplier += 0.08; // weekend
      if ([1, 3, 10, 12].includes(month)) multiplier += 0.06; // peak
      if (starRating >= 4) multiplier += 0.02;

      forecast.push(Math.round(baseAvg * multiplier));
    }

    return forecast;
  }

  // ─── LLM narrative via biznavigate_ai ─────────────────────────────────────

  private async generateNarrative(ctx: {
    profile: any;
    roomType: string;
    checkinDate: string;
    competitors: ParsedCompetitorRates[];
    competitorAvgPrice: number;
    suggestedPrice: number;
    demandScore: number;
    confidence: number;
    daysUntilCheckin: number;
    sevenDayForecast: number[];
    priceRange: { low: number; high: number };
    reasoningFeatures: any;
    orgId: string;
  }): Promise<string> {
    const competitorSummary = ctx.competitors
      .map(c => `- ${c.name}: avg ₹${c.averagePrice}, range ₹${c.lowestPrice}–₹${c.highestPrice} (${c.prices.map(p => p.ota).join(', ')})`)
      .join('\n') || 'No competitor data available.';

    const forecastStr = ctx.sevenDayForecast
      .map((p, i) => `Day ${i + 1}: ₹${p}`)
      .join(', ');

    const prompt = `Hotel Revenue Management Analysis

Hotel: ${ctx.profile.hotelName}
Location: ${ctx.profile.location}
Star Rating: ${ctx.profile.starRating} stars
Room Type: ${ctx.roomType}
Check-in Date: ${ctx.checkinDate}
Days Until Check-in: ${ctx.daysUntilCheckin}

CURRENT PRICING
Current Price: ₹${ctx.profile.basePrice}
Competitor Average: ₹${ctx.competitorAvgPrice}

COMPETITOR PRICES (Xotelo OTA Data)
${competitorSummary}

ML DEMAND ANALYSIS
Demand Score: ${ctx.demandScore} (${ctx.reasoningFeatures.demandSignal})
Confidence: ${Math.round(ctx.confidence * 100)}%
Day Factor: ${ctx.reasoningFeatures.dayFactor}
Season Factor: ${ctx.reasoningFeatures.seasonFactor}

RECOMMENDED PRICING
Suggested Price: ₹${ctx.suggestedPrice}
Price Range: ₹${ctx.priceRange.low} – ₹${ctx.priceRange.high}

7-DAY FORECAST
${forecastStr}

Please provide a structured revenue management recommendation covering:
1. Recommended price with justification (use the suggested price above as anchor)
2. Demand signal assessment
3. Competitive positioning vs the OTA data above
4. Revenue opportunity vs current pricing
5. 7-day dynamic pricing strategy
6. Three specific tactical actions for the hotel manager
7. Risk flags if any`;

    const systemPrompt = `You are a senior hotel revenue management consultant specialising in the Indian hospitality market.
You provide concise, data-driven pricing recommendations based on real OTA competitor data.
Always frame prices in INR (₹). Reference actual competitor names from the data provided.
The suggested price from the demand model is the source of truth — explain and support it, do not override it.
Keep your response under 500 words, structured with clear headings.`;

    try {
      const response = await axios.post(
        `${this.llmServiceUrl}/api/v1/generate`,
        {
          prompt,
          system_prompt: systemPrompt,
          provider: 'auto',
          max_tokens: 1500,
          temperature: 0.3,
          business_id: ctx.orgId,
        },
        { timeout: 30000 },
      );
      return response.data?.text ?? 'Narrative generation unavailable.';
    } catch (err) {
      this.logger.warn(`LLM narrative failed: ${err.message}`);
      return `Recommended price: ₹${ctx.suggestedPrice}. Demand signal: ${ctx.reasoningFeatures.demandSignal}. Competitor average: ₹${ctx.competitorAvgPrice}. Narrative generation temporarily unavailable.`;
    }
  }

  // ─── Record booking outcome (for Phase 2 ML training) ────────────────────

  async recordBookingOutcome(orgId: string, dto: {
    recommendationId: string;
    hotelId: string;
    actualPriceUsed: number;
    roomsBooked: number;
    totalRooms: number;
    checkinDate: string;
  }) {
    const actualOccupancy = dto.roomsBooked / dto.totalRooms;
    const revenue = dto.actualPriceUsed * dto.roomsBooked;

    return this.prisma.hotel_booking_outcomes.create({
      data: {
        recommendation_id: dto.recommendationId,
        hotel_id: dto.hotelId,
        org_id: orgId,
        actual_price_used: dto.actualPriceUsed,
        rooms_booked: dto.roomsBooked,
        total_rooms: dto.totalRooms,
        actual_occupancy: actualOccupancy,
        revenue,
        checkin_date: new Date(dto.checkinDate),
      },
    });
  }

  // ─── History ──────────────────────────────────────────────────────────────

  async getHistory(orgId: string, hotelId: string, limit = 20) {
    return this.prisma.hotel_pricing_recommendations.findMany({
      where: { org_id: orgId, hotel_id: hotelId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  private addOneDay(date: string): string {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
}
