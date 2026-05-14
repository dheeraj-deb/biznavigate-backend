import { IsString, IsEmail, IsOptional } from "class-validator";

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  tenant_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  gst_number?: string;

  @IsOptional()
  @IsString()
  pan_number?: string;

  @IsOptional()
  @IsString()
  registration_no?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
