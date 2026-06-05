export interface BookingDestination {
  dest_id: string;
  dest_type: string;
  city_name?: string;
  label?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface BookingSearchDestinationResponse {
  status: boolean;
  message: string;
  data: BookingDestination[];
}

export interface BookingPriceBreakdown {
  grossPrice?: { value: number; currency: string };
  strikethroughPrice?: { value: number; currency: string };
  all_inclusive_amount?: { value: number; currency: string };
  net_amount?: { value: number; currency: string };
}

/** Shape returned by /api/v1/hotels/searchHotels — actual data is under `property` */
export interface BookingHotelProperty {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  propertyClass?: number;   // star rating
  accuratePropertyClass?: number;
  reviewScore?: number;
  currency?: string;
  priceBreakdown?: BookingPriceBreakdown;
  // fallback flat fields (some API versions)
  min_total_price?: number;
  gross_amount?: number;
  hotel_name?: string;
}

export interface BookingHotel {
  hotel_id: number;
  property?: BookingHotelProperty;
  // flat fields for older API versions
  hotel_name?: string;
  min_total_price?: number;
  gross_amount?: number;
  currency_code?: string;
  stars?: number;
  latitude?: number;
  longitude?: number;
  composite_price_breakdown?: {
    grossPrice?: { value: number; currency: string };
    all_inclusive_amount?: { value: number; currency: string };
  };
}

export interface BookingSearchHotelsResponse {
  status: boolean;
  message: string;
  data: {
    hotels: BookingHotel[];
    meta?: { total_count_with_filters?: number };
  };
}

/** Normalised competitor entry from Booking.com */
export interface BookingCompetitorRates {
  hotelId: number;
  name: string;
  price: number;
  currency: string;
  stars?: number;
  latitude?: number;
  longitude?: number;
}
