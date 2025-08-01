import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  contactPhone: string;

  @ApiProperty()
  contactEmail: string;

  @ApiPropertyOptional()
  gstin?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  notificationPreference?: string;

  @ApiPropertyOptional()
  platformId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      customerId: user.customerId,
      businessName: user.businessName,
      contactPhone: user.contactPhone,
      contactEmail: user.contactEmail,
      gstin: user.gstin,
      address: user.address,
      notificationPreference: user.notificationPreference,
      platformId: user.platformId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static fromEntities(users: User[]): UserResponseDto[] {
    return users.map(user => this.fromEntity(user));
  }
}

export class ZohoAuthResponseDto {
  @ApiProperty()
  authorizationUrl: string;

  @ApiProperty()
  message: string;
}

export class ZohoCredentialsSaveResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  status: number;
}
