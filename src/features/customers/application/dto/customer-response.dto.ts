import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Customer, CustomerAddress } from '../../domain/entities/customer.entity';

export class CustomerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  contactName: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty()
  contactType: string;

  @ApiPropertyOptional()
  currencyId?: string;

  @ApiPropertyOptional()
  billingAddress?: CustomerAddress;

  @ApiPropertyOptional()
  shippingAddress?: CustomerAddress;

  @ApiPropertyOptional()
  vatRegNo?: string;

  @ApiPropertyOptional()
  taxRegNo?: string;

  @ApiPropertyOptional()
  gstNo?: string;

  @ApiPropertyOptional()
  businessUserId?: string;

  @ApiPropertyOptional()
  externalId?: string;

  @ApiPropertyOptional()
  platform?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  zohoContactId?: string;

  @ApiPropertyOptional()
  zohoData?: any;

  static fromEntity(customer: Customer, additionalData?: any): CustomerResponseDto {
    return {
      id: customer.id,
      contactName: customer.contactName,
      companyName: customer.companyName,
      contactType: customer.contactType,
      currencyId: customer.currencyId,
      billingAddress: customer.billingAddress,
      shippingAddress: customer.shippingAddress,
      vatRegNo: customer.vatRegNo,
      taxRegNo: customer.taxRegNo,
      gstNo: customer.gstNo,
      businessUserId: customer.businessUserId,
      externalId: customer.externalId,
      platform: customer.platform,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      ...additionalData,
    };
  }
}
