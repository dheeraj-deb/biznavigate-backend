import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HotelProfileDocument = HotelProfile & Document;

@Schema({ timestamps: true, collection: 'hotel_profiles' })
export class HotelProfile {
  @Prop({ required: true, index: true })
  organizationId: string;

  @Prop({ required: true })
  hotelName: string;

  @Prop({ required: true })
  location: string; // Xotelo location string e.g. "Mumbai"

  @Prop({ required: true })
  locationCityId: string; // alias for location, used in Xotelo list calls

  @Prop({ required: true, min: 1, max: 5 })
  starRating: number;

  @Prop({ type: [String], default: [] })
  roomTypes: string[];

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ required: true })
  basePrice: number;

  @Prop({ type: [String], default: [] })
  competitorHotelTokens: string[]; // Xotelo hotel_token values of nearby competitors

  // Geo fields — used for radius-based competitor discovery
  @Prop({ type: Number, default: null })
  latitude: number | null;

  @Prop({ type: Number, default: null })
  longitude: number | null;

  @Prop({ type: Number, default: 5 })
  searchRadiusKm: number; // radius for auto competitor discovery

  @Prop({ default: true })
  isActive: boolean;
}

export const HotelProfileSchema = SchemaFactory.createForClass(HotelProfile);
HotelProfileSchema.index({ organizationId: 1, isActive: 1 });
