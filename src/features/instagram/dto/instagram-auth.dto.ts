import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class ExchangeCodeDto {
    @IsString()
  code: string;

    @IsString()
  @IsOptional()
  state?: string;
}

export class ConnectInstagramAccountDto {
    @IsString()
  facebookPageId: string;

    @IsString()
  instagramBusinessAccountId: string;

    @IsString()
  accessToken: string;

    @IsArray()
  @IsOptional()
  permissions?: string[];

    @IsString()
  businessId: string;
}

export class RefreshTokenDto {
    @IsString()
  accountId: string;
}

export class DisconnectAccountDto {
    @IsString()
  businessId: string;

    @IsString()
  @IsOptional()
  reason?: string;
}

export class GetOAuthUrlDto {
    @IsString()
  businessId: string;

    @IsString()
  @IsOptional()
  redirectUri?: string;
}
