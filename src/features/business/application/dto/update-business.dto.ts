import { IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  business_name?: string;

  @IsOptional()
  @IsString()
  business_type?: string;

  @IsOptional()
  @IsUUID()
  subscription_plan_id?: string;

  @IsOptional()
  @IsString()
  whatsapp_number?: string;

  @IsOptional()
  brand_colors?: any;

  @IsOptional()
  working_hours?: any;

  @IsOptional()
  @IsString()
  logo_url?: string;
}
