import { IsString, IsEmail, IsOptional } from "class-validator";

export class CreateTenantDto {
  @IsString()
  tenant_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  gst_number?: string;

  @IsOptional()
  @IsString()
  registration_no?: string;
}
