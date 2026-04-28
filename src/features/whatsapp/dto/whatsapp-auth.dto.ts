import { IsString, IsOptional } from 'class-validator';

export class ConnectWhatsAppAccountDto {
    @IsString()
  businessId: string;

    @IsString()
  whatsappBusinessAccountId: string;

    @IsString()
  phoneNumberId: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

    @IsString()
  @IsOptional()
  displayPhoneNumber?: string;
}

export class DisconnectWhatsAppAccountDto {
    @IsString()
  businessId: string;

    @IsString()
  @IsOptional()
  reason?: string;
}

export class GetAccountsDto {
    @IsString()
  businessId: string;
}
