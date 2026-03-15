import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HotelProfile, HotelProfileDocument } from './schemas/hotel-profile.schema';
import { CreateHotelProfileDto } from './dto/create-hotel-profile.dto';
import { UpdateHotelProfileDto } from './dto/update-hotel-profile.dto';

@Injectable()
export class HotelProfileService {
  constructor(
    @InjectModel(HotelProfile.name)
    private readonly hotelProfileModel: Model<HotelProfileDocument>,
  ) {}

  async create(organizationId: string, dto: CreateHotelProfileDto): Promise<HotelProfileDocument> {
    const profile = new this.hotelProfileModel({
      ...dto,
      organizationId,
      locationCityId: dto.locationCityId ?? dto.location,
      amenities: dto.amenities ?? [],
      competitorHotelTokens: dto.competitorHotelTokens ?? [],
    });
    return profile.save();
  }

  async findAll(organizationId: string): Promise<HotelProfileDocument[]> {
    return this.hotelProfileModel.find({ organizationId }).lean().exec() as any;
  }

  async findById(organizationId: string, hotelId: string): Promise<HotelProfileDocument> {
    const profile = await this.hotelProfileModel.findById(hotelId).lean().exec() as HotelProfileDocument;
    if (!profile) throw new NotFoundException(`Hotel profile ${hotelId} not found`);
    if (profile.organizationId !== organizationId) throw new ForbiddenException();
    return profile;
  }

  async update(organizationId: string, hotelId: string, dto: UpdateHotelProfileDto): Promise<HotelProfileDocument> {
    await this.findById(organizationId, hotelId); // ownership check
    const updated = await this.hotelProfileModel
      .findByIdAndUpdate(hotelId, { $set: dto }, { new: true })
      .lean()
      .exec();
    return updated as HotelProfileDocument;
  }

  async addCompetitorTokens(organizationId: string, hotelId: string, tokens: string[]): Promise<HotelProfileDocument> {
    await this.findById(organizationId, hotelId);
    const updated = await this.hotelProfileModel
      .findByIdAndUpdate(hotelId, { $addToSet: { competitorHotelTokens: { $each: tokens } } }, { new: true })
      .lean()
      .exec();
    return updated as HotelProfileDocument;
  }

  async delete(organizationId: string, hotelId: string): Promise<void> {
    await this.findById(organizationId, hotelId);
    await this.hotelProfileModel.findByIdAndDelete(hotelId).exec();
  }

  async findAllActive(): Promise<HotelProfileDocument[]> {
    return this.hotelProfileModel.find({ isActive: true }).lean().exec() as any;
  }
}
