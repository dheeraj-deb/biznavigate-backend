import { IsNotEmpty, IsOptional, IsString, IsUUID, IsIn } from "class-validator";

export class CreateBusinessDto {
  @IsNotEmpty()
  @IsUUID()
  tenant_id: string;

  @IsNotEmpty()
  @IsString()
  business_name: string;

  @IsOptional()
  @IsString()
  @IsIn(["Retail", "Beauty", "Restaurant", "Service"]) // <-- update with your allowed types
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
