import { IsEmail, IsIn, IsOptional, IsString } from "class-validator";
import { BUSINESS_TYPES } from "./create-business.dto";

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  business_name?: string;

  @IsOptional()
  @IsIn(BUSINESS_TYPES)
  business_type?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  gst_number?: string;

  @IsOptional()
  @IsString()
  pan_number?: string;

  @IsOptional()
  @IsString()
  whatsapp_number?: string;
}
