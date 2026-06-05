export interface XoteloHotel {
  hotel_key: string;
  name: string;
  stars?: number;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  // search result extras
  location_key?: string;
  place_name?: string;
  short_place_name?: string;
  street_address?: string;
}

export interface XoteloSearchResult {
  hotel_key: string;
  location_key: string;
  name: string;
  location_id?: number;
  parent_id?: number;
  place_name?: string;
  street_address?: string;
  short_place_name?: string;
  url?: string;
  image?: string;
}

export interface XoteloSearchResponse {
  timestamp?: number;
  result: {
    query: string;
    list: XoteloSearchResult[];
  };
  error?: { status_code: number; message: string };
}

export interface XoteloOtaRate {
  name: string; // e.g. "booking.com", "expedia.com"
  rate?: {
    price: number;
    currency: string;
    exclusive?: boolean;
  };
}

export interface XoteloRatesResponse {
  timestamp?: number;
  result: {
    rates: XoteloOtaRate[];
  };
  error?: { status_code: number; message: string };
}

export interface ParsedCompetitorRates {
  name: string;
  hotelKey: string;
  prices: Array<{ ota: string; price: number }>;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
}

export interface GeoFilteredHotel extends XoteloSearchResult {
  distanceKm: number; // haversine distance from target hotel (-1 = unknown)
}

export interface NominatimResponse {
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  display_name: string;
}
