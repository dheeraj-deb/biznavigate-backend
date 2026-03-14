import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  business_name?: string;

  @IsOptional()
  @IsString()
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
