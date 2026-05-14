import { Injectable, Logger, Inject } from '@nestjs/common';
import axios from 'axios';
import { Redis } from 'ioredis';
import {
  BookingSearchDestinationResponse,
  BookingSearchHotelsResponse,
  BookingCompetitorRates,
  BookingHotel,
} from './dto/booking-com.dto';
import { ParsedCompetitorRates } from './dto/xotelo.dto';

const BOOKING_BASE = 'https://booking-com15.p.rapidapi.com';
const BOOKING_KEY = '4291d48cd1msh2e2aa9c66729698p14db22jsn68cb1df54f10';
const BOOKING_HOST = 'booking-com15.p.rapidapi.com';
const CACHE_TTL = 1800; // 30 min

const BOOKING_HEADERS = {
  'X-RapidAPI-Key': BOOKING_KEY,
  'X-RapidAPI-Host': BOOKING_HOST,
};

/** Booking.com hotel IDs are stored as "booking:<hotel_id>" in competitorHotelTokens */
export const BOOKING_PREFIX = 'booking:';

@Injectable()
export class BookingComService {
  private readonly logger = new Logger(BookingComService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  // ─── Destination search ───────────────────────────────────────────────────

  /**
   * Find dest_id for a city/location name.
   * Cached 24h since destination IDs are stable.
   */
  async searchDestination(query: string): Promise<string | null> {
    const cacheKey = `booking:dest:${query.toLowerCase()}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get<BookingSearchDestinationResponse>(
        `${BOOKING_BASE}/api/v1/hotels/searchDestination`,
        {
          params: { query },
          headers: BOOKING_HEADERS,
          timeout: 10000,
        },
      );

      const destinations = response.data?.data ?? [];
      if (!destinations.length) {
        this.logger.debug(`Booking.com: no destination found for "${query}"`);
        return null;
      }

      // Prefer CITY type, fallback to first result
      const city = destinations.find(d => d.dest_type === 'CITY') ?? destinations[0];
      const destId = city.dest_id;

      await this.redis.setex(cacheKey, 86400, destId);
      this.logger.debug(`Booking.com dest: "${query}" → ${destId} (${city.city_name ?? city.label})`);
      return destId;
    } catch (err) {
      this.logger.warn(
        `Booking.com searchDestination failed for "${query}": ${err.response?.data?.message ?? err.message}`,
      );
      return null;
    }
  }

  // ─── City-level hotel search ──────────────────────────────────────────────

  /**
   * Search hotels in a destination for given dates.
   * Returns up to maxResults hotels with their prices.
   */
  async searchHotels(
    destId: string,
    checkin: string,
    checkout: string,
    maxResults = 20,
  ): Promise<BookingCompetitorRates[]> {
    const cacheKey = `booking:hotels:${destId}:${checkin}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const response = await axios.get<BookingSearchHotelsResponse>(
        `${BOOKING_BASE}/api/v1/hotels/searchHotels`,
        {
          params: {
            dest_id: destId,
            search_type: 'CITY',
            arrival_date: checkin,
            departure_date: checkout,
            adults: '2',
            room_qty: '1',
            page_number: '1',
            languagecode: 'en-us',
            currency_code: 'INR',
          },
          headers: BOOKING_HEADERS,
          timeout: 15000,
        },
      );

      const hotels: BookingHotel[] = response.data?.data?.hotels ?? [];
      const results: BookingCompetitorRates[] = hotels
        .slice(0, maxResults)
        .map(h => {
          // New API format: data is nested under `property`
          const prop = h.property;
          const name = prop?.name ?? h.hotel_name ?? String(h.hotel_id);
          const price = Math.round(
            prop?.priceBreakdown?.grossPrice?.value ??
            prop?.priceBreakdown?.all_inclusive_amount?.value ??
            prop?.min_total_price ??
            h.composite_price_breakdown?.all_inclusive_amount?.value ??
            h.min_total_price ??
            h.gross_amount ??
            0,
          );

          return {
            hotelId: h.hotel_id,
            name,
            price,
            currency: prop?.currency ?? h.currency_code ?? 'INR',
            stars: prop?.propertyClass ?? prop?.accuratePropertyClass ?? h.stars,
            latitude: prop?.latitude ?? h.latitude,
            longitude: prop?.longitude ?? h.longitude,
          };
        })
        .filter(h => h.price > 0);

      await this.redis.setex(cacheKey, CACHE_TTL, JSON.stringify(results));
      this.logger.log(`Booking.com: ${results.length} hotels found in dest ${destId}`);
      return results;
    } catch (err) {
      this.logger.warn(
        `Booking.com searchHotels failed for dest ${destId}: ${err.response?.data?.message ?? err.message}`,
      );
      return [];
    }
  }

  // ─── Per-hotel rate fetch (for cron refresh) ──────────────────────────────

  /**
   * Fetch current rates for a single Booking.com hotel_id.
   * Used by the 30-min cron to refresh stored competitor keys.
   */
  async fetchHotelRates(
    hotelId: number,
    checkin: string,
    checkout: string,
  ): Promise<ParsedCompetitorRates | null> {
    const cacheKey = `booking:rates:${hotelId}:${checkin}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const response = await axios.get(
        `${BOOKING_BASE}/api/v1/hotels/getHotelDetails`,
        {
          params: {
            hotel_id: hotelId,
            arrival_date: checkin,
            departure_date: checkout,
            adults: '2',
            room_qty: '1',
            languagecode: 'en-us',
            currency_code: 'INR',
          },
          headers: BOOKING_HEADERS,
          timeout: 12000,
        },
      );

      const data = response.data?.data;
      if (!data) return null;

      const name: string = data.hotel_name ?? String(hotelId);
      // gross_amount and all_inclusive_amount are in the requested currency (INR)
      // gross_amount_hotel_currency is the hotel's native currency — skip it
      const price: number = Math.round(
        data.product_price_breakdown?.all_inclusive_amount?.value ??
        data.product_price_breakdown?.gross_amount?.value ??
        data.min_total_price ??
        0,
      );

      if (!price) return null;

      const parsed: ParsedCompetitorRates = {
        name,
        hotelKey: `${BOOKING_PREFIX}${hotelId}`,
        prices: [{ ota: 'booking.com', price }],
        lowestPrice: price,
        highestPrice: price,
        averagePrice: price,
      };

      await this.redis.setex(cacheKey, CACHE_TTL, JSON.stringify(parsed));
      return parsed;
    } catch (err) {
      this.logger.warn(`Booking.com fetchHotelRates failed for hotel ${hotelId}: ${err.message}`);
      return null;
    }
  }

  // ─── High-level helpers ───────────────────────────────────────────────────

  /**
   * Full pipeline: city name → dest_id → hotel list → ParsedCompetitorRates[].
   */
  async getCompetitorRatesForCity(
    cityName: string,
    checkin: string,
    checkout: string,
    maxResults = 10,
  ): Promise<ParsedCompetitorRates[]> {
    const destId = await this.searchDestination(cityName);
    if (!destId) return [];

    const hotels = await this.searchHotels(destId, checkin, checkout, maxResults);
    return hotels.map(h => ({
      name: h.name,
      hotelKey: `${BOOKING_PREFIX}${h.hotelId}`,
      prices: [{ ota: 'booking.com', price: h.price }],
      lowestPrice: h.price,
      highestPrice: h.price,
      averagePrice: h.price,
    }));
  }

  /**
   * City search with Nominatim-style cascading fallback.
   */
  async searchWithFallback(
    candidates: string[],
    checkin: string,
    checkout: string,
    maxResults = 10,
  ): Promise<{ city: string; rates: ParsedCompetitorRates[] }> {
    for (const name of candidates) {
      const rates = await this.getCompetitorRatesForCity(name, checkin, checkout, maxResults);
      if (rates.length > 0) {
        this.logger.log(`Booking.com matched on "${name}" (${rates.length} hotels)`);
        return { city: name, rates };
      }
      this.logger.debug(`Booking.com: no results for "${name}", trying next`);
    }
    return { city: candidates[0] ?? 'Unknown', rates: [] };
  }
}
