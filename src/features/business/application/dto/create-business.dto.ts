import { Type } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class CreateBusinessDto {
  @IsNotEmpty()
  @IsUUID()
  tenant_id: string;

  @IsNotEmpty()
  @IsString()
  business_name: string;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeeDto)
  employees?: CreateEmployeeDto[];
}
