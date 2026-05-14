import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelProfileDto } from './create-hotel-profile.dto';

export class UpdateHotelProfileDto extends PartialType(CreateHotelProfileDto) {}
