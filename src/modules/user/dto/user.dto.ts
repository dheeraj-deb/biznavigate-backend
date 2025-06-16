import {
  IsNotEmpty,
  IsString,
  IsEmail,
  ValidateNested,
  IsOptional,
  MaxLength,
  isNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";

class Address {
  @IsString()
  attention: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  street2: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  zip: string;
}

export class CreateContact {
  // @IsNotEmpty()
  @IsString()
  // @MaxLength(200, { message: "Contact name must be less than 200 characters" })
  contact_name: string;

  // @IsNotEmpty()
  @IsString()
  // @MaxLength(200, { message: "Company name must be less than 200 characters" })
  company_name: string;

  // @IsNotEmpty()
  // @IsEmail()
  // contact_email: string;

  // @IsNotEmpty()
  @ValidateNested()
  @Type(() => Address)
  billing_address: Address;

  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  shipping_address?: Address;

  @IsOptional()
  @IsString()
  vat_reg_number: string;

  @IsOptional()
  @IsString()
  tax_reg_number: string;

  // @IsNotEmpty()
  // @IsString()
  gst_number: string;
}
