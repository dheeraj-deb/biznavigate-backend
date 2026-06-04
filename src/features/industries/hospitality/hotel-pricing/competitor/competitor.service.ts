import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import axios from 'axios';
import { Redis } from 'ioredis';
import { CompetitorSnapshot, CompetitorSnapshotDocument } from './schemas/competitor-snapshot.schema';
import { HotelProfileService } from '../hotel-profile/hotel-profile.service';
import { BookingComService, BOOKING_PREFIX } from './booking-com.service';
import {
  XoteloSearchResponse,
  XoteloSearchResult,
  XoteloRatesResponse,
  GeoFilteredHotel,
  NominatimResponse,
  ParsedCompetitorRates,
} from './dto/xotelo.dto';

const XOTELO_BASE = 'https://xotelo-hotel-prices.p.rapidapi.com';
const XOTELO_KEY = '4291d48cd1msh2e2aa9c66729698p14db22jsn68cb1df54f10';
const XOTELO_HOST = 'xotelo-hotel-prices.p.rapidapi.com';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const CACHE_TTL = 1800; // 30 min

const XOTELO_HEADERS = {
  'X-RapidAPI-Key': XOTELO_KEY,
  'X-RapidAPI-Host': XOTELO_HOST,
};

@Injectable()
export class CompetitorService {
  private readonly logger = new Logger(CompetitorService.name);

  constructor(
    @InjectModel(CompetitorSnapshot.name)
    private readonly snapshotModel: Model<CompetitorSnapshotDocument>,
    private readonly hotelProfileService: HotelProfileService,
    private readonly bookingComService: BookingComService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  // ─── Xotelo API (kept as fallback) ────────────────────────────────────────

  async searchHotels(query: string): Promise<XoteloSearchResult[]> {
    const cacheKey = `xotelo:search:${query.toLowerCase()}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cached);
    }

    try {
      const response = await axios.get<XoteloSearchResponse>(`${XOTELO_BASE}/api/search`, {
        params: { query },
        headers: XOTELO_HEADERS,
        timeout: 10000,
      });

      const list = response.data?.result?.list ?? [];
      await this.redis.setex(cacheKey, CACHE_TTL, JSON.stringify(list));
      return list;
    } catch (err) {
      this.logger.warn(`Xotelo search failed for "${query}": ${err.response?.data?.error?.message ?? err.message}`);
      return [];
    }
  }

  async fetchHotelRates(hotelKey: string, checkin: string, checkout: string): Promise<ParsedCompetitorRates | null> {
    const cacheKey = `xotelo:rates:${hotelKey}:${checkin}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const response = await axios.get<XoteloRatesResponse>(`${XOTELO_BASE}/api/rates`, {
        params: { hotel_key: hotelKey, chk_in: checkin, chk_out: checkout, rooms: 1, adults: 2 },
        headers: XOTELO_HEADERS,
        timeout: 10000,
      });

      const rates = response.data?.result?.rates ?? [];
      const validRates = rates.filter(r => r.rate?.price);
      if (!validRates.length) return null;

      const prices = validRates.map(r => ({ ota: r.name, price: r.rate!.price }));
      const vals = prices.map(p => p.price);
      const parsed: ParsedCompetitorRates = {
        name: '',
        hotelKey,
        prices,
        lowestPrice: Math.min(...vals),
        highestPrice: Math.max(...vals),
        averagePrice: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      };

      await this.redis.setex(cacheKey, CACHE_TTL, JSON.stringify(parsed));
      return parsed;
    } catch (err) {
      this.logger.warn(`Xotelo rates fetch failed for ${hotelKey}: ${err.message}`);
      return null;
    }
  }

  // ─── Geo helpers ──────────────────────────────────────────────────────────

  haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number) {
    return (deg * Math.PI) / 180;
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    const cacheKey = `geocode:${lat.toFixed(4)}:${lng.toFixed(4)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get<NominatimResponse>(`${NOMINATIM_BASE}/reverse`, {
      params: { lat, lon: lng, format: 'json' },
      headers: { 'User-Agent': 'BizNavigate-HotelPricing/1.0' },
      timeout: 8000,
    });

    const addr = response.data?.address ?? {};
    const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? addr.state ?? 'Unknown';

    await this.redis.setex(cacheKey, 86400, city);
    this.logger.debug(`Reverse geocode (${lat},${lng}) → "${city}"`);
    return city;
  }

  /**
   * Build a list of geo fallback candidates from Nominatim reverse geocode.
   */
  private async getGeoCandidates(lat: number, lng: number): Promise<string[]> {
    const response = await axios.get<NominatimResponse>(`${NOMINATIM_BASE}/reverse`, {
      params: { lat, lon: lng, format: 'json' },
      headers: { 'User-Agent': 'BizNavigate-HotelPricing/1.0' },
      timeout: 8000,
    });

    const addr = (response.data?.address ?? {}) as Record<string, string | undefined>;
    return [
      addr['city'],
      addr['town'],
      addr['village'],
      addr['county'],
      addr['state_district'],
      addr['state'],
    ].filter(Boolean) as string[];
  }

  // ─── Primary: Booking.com nearby hotels ──────────────────────────────────

  /**
   * Find nearby hotels using Booking.com (primary) with Xotelo as fallback.
   * Booking.com has much better Indian city coverage than Xotelo.
   */
  async findNearbyHotels(
    lat: number,
    lng: number,
    _radiusKm: number,
    checkin: string,
    checkout: string,
  ): Promise<GeoFilteredHotel[]> {
    const candidates = await this.getGeoCandidates(lat, lng);

    // Try Booking.com first
    const { city, rates } = await this.bookingComService.searchWithFallback(
      candidates,
      checkin,
      checkout,
      20,
    );

    if (rates.length > 0) {
      this.logger.log(`Booking.com geo (${lat},${lng}) → city="${city}" ${rates.length} hotels`);
      return rates.map(r => ({
        hotel_key: r.hotelKey,
        location_key: city,
        name: r.name,
        distanceKm: -1,
      }));
    }

    // Fallback: Xotelo
    this.logger.debug(`Booking.com returned 0 results for (${lat},${lng}), trying Xotelo`);
    for (const name of candidates) {
      const results = await this.searchHotels(name);
      if (results.length > 0) {
        this.logger.log(`Xotelo fallback (${lat},${lng}) → city="${name}" ${results.length} hotels`);
        return results.map(h => ({ ...h, distanceKm: -1 }));
      }
    }

    this.logger.warn(`No results from any source for (${lat},${lng}). Candidates: ${candidates.join(', ')}`);
    return [];
  }

  // ─── Resolve by coordinates ───────────────────────────────────────────────

  async resolveByCoordinates(
    organizationId: string,
    hotelId: string,
    lat: number,
    lng: number,
    radiusKm: number,
    checkin: string,
    checkout: string,
    maxCompetitors = 10,
  ): Promise<{ found: GeoFilteredHotel[]; tokensAdded: number; city: string }> {
    const candidates = await this.getGeoCandidates(lat, lng);
    const city = candidates[0] ?? 'Unknown';
    const nearby = await this.findNearbyHotels(lat, lng, radiusKm, checkin, checkout);

    const selected = nearby.slice(0, maxCompetitors);
    const keys = selected.map(h => h.hotel_key);

    if (keys.length) {
      await this.hotelProfileService.addCompetitorTokens(organizationId, hotelId, keys);
    }

    return { found: selected, tokensAdded: keys.length, city };
  }

  // ─── Name-based resolution ────────────────────────────────────────────────

  async resolveCompetitorTokens(
    location: string,
    checkin: string,
    checkout: string,
    hotelNames: string[],
  ): Promise<Array<{ name: string; hotelKey: string }>> {
    // Try Booking.com first for each name
    const results: Array<{ name: string; hotelKey: string }> = [];

    for (const targetName of hotelNames) {
      // Try Booking.com: search destination then hotels
      const bookingRates = await this.bookingComService.getCompetitorRatesForCity(
        `${targetName} ${location}`,
        checkin,
        checkout,
        1,
      );

      if (bookingRates.length > 0) {
        results.push({ name: bookingRates[0].name, hotelKey: bookingRates[0].hotelKey });
        continue;
      }

      // Fallback: Xotelo search
      const hotels = await this.searchHotels(`${targetName} ${location}`);
      if (hotels.length > 0) {
        results.push({ name: hotels[0].name, hotelKey: hotels[0].hotel_key });
      }
    }

    return results;
  }

  // ─── Fetch rates for stored competitor keys ────────────────────────────────

  /**
   * Routes each key to the correct provider:
   * - "booking:<id>" → Booking.com rate fetch
   * - anything else  → Xotelo rate fetch
   */
  async getCompetitorRatesForHotel(
    _hotelProfileId: string,
    _organizationId: string,
    _location: string,
    competitorKeys: string[],
    checkin: string,
    checkout: string,
  ): Promise<ParsedCompetitorRates[]> {
    if (!competitorKeys.length) return [];

    const results: ParsedCompetitorRates[] = [];

    for (const key of competitorKeys) {
      if (key.startsWith(BOOKING_PREFIX)) {
        const hotelId = parseInt(key.slice(BOOKING_PREFIX.length), 10);
        if (!isNaN(hotelId)) {
          const rates = await this.bookingComService.fetchHotelRates(hotelId, checkin, checkout);
          if (rates) results.push(rates);
        }
      } else {
        // Xotelo key
        const rates = await this.fetchHotelRates(key, checkin, checkout);
        if (rates) {
          if (!rates.name) rates.name = key;
          results.push(rates);
        }
      }
    }

    return results;
  }

  // ─── 30-min cron ──────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_30_MINUTES)
  async refreshAllCompetitorPrices() {
    this.logger.log('Competitor refresh cron started');
    const profiles = await this.hotelProfileService.findAllActive();
    if (!profiles.length) return;

    const checkin = this.defaultCheckin();
    const checkout = this.defaultCheckout(checkin);

    for (const profile of profiles) {
      try {
        const hasCoords = profile.latitude != null && profile.longitude != null;
        const hasKeys = (profile.competitorHotelTokens?.length ?? 0) > 0;

        if (hasCoords && !hasKeys) {
          this.logger.log(`Auto geo-discovery for "${profile.hotelName}"`);
          const { tokensAdded } = await this.resolveByCoordinates(
            profile.organizationId,
            String((profile as any)._id),
            profile.latitude!,
            profile.longitude!,
            profile.searchRadiusKm ?? 5,
            checkin,
            checkout,
          );
          this.logger.log(`Auto-discovered ${tokensAdded} competitors for "${profile.hotelName}"`);
          const refreshed = await this.hotelProfileService.findById(
            profile.organizationId,
            String((profile as any)._id),
          );
          profile.competitorHotelTokens = refreshed.competitorHotelTokens;
        }

        if (!(profile.competitorHotelTokens?.length)) continue;

        const competitors = await this.getCompetitorRatesForHotel(
          String((profile as any)._id),
          profile.organizationId,
          profile.location,
          profile.competitorHotelTokens,
          checkin,
          checkout,
        );

        if (competitors.length) {
          await this.snapshotModel.create({
            hotelProfileId: String((profile as any)._id),
            organizationId: profile.organizationId,
            location: profile.location,
            checkinDate: checkin,
            fetchedAt: new Date(),
            competitors,
          });
          this.logger.debug(`Snapshot: ${profile.hotelName} — ${competitors.length} competitors`);
        }
      } catch (err) {
        this.logger.error(`Cron error for "${profile.hotelName}": ${err.message}`);
      }
    }

    this.logger.log(`Cron done — ${profiles.length} hotels processed`);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private defaultCheckin(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  private defaultCheckout(checkin: string): string {
    const d = new Date(checkin);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  formatCheckinDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
