// dto/business_user_onboard.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsObject, IsNumber } from "class-validator";




export class ZohoIntegrationDto {
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  clientSecret: string;

  @IsNotEmpty()
  @IsString()
  organizationId: string;
}

export class CreateBusinessUserDto {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @IsNotEmpty()
  @IsString()
  contactEmail: string;

  @IsNotEmpty()
  @IsString()
  gstin: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  notificationPreference?: string;

  @IsNotEmpty()
  @IsNumber()
  platformId: number;

  @IsNotEmpty()
  integrationConfig: ZohoIntegrationDto;


}
