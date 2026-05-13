import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompetitorSnapshotDocument = CompetitorSnapshot & Document;

class OtaPrice {
  ota: string;
  price: number;
}

class CompetitorEntry {
  name: string;
  hotelToken: string;
  prices: OtaPrice[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
}

@Schema({ timestamps: true, collection: 'competitor_snapshots' })
export class CompetitorSnapshot {
  @Prop({ required: true, index: true })
  hotelProfileId: string;

  @Prop({ required: true, index: true })
  organizationId: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  checkinDate: string; // YYYY-MM-DD

  @Prop({ required: true })
  fetchedAt: Date;

  @Prop({
    type: [
      {
        name: String,
        hotelToken: String,
        prices: [{ ota: String, price: Number }],
        lowestPrice: Number,
        highestPrice: Number,
        averagePrice: Number,
      },
    ],
    default: [],
  })
  competitors: CompetitorEntry[];
}

export const CompetitorSnapshotSchema = SchemaFactory.createForClass(CompetitorSnapshot);
CompetitorSnapshotSchema.index({ hotelProfileId: 1, checkinDate: 1 });
CompetitorSnapshotSchema.index({ location: 1, checkinDate: 1 });
