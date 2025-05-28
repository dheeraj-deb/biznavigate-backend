import {
  IsNotEmpty,
  IsString,
  IsEmail,
  ValidateNested,
  IsOptional,
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
  @IsNotEmpty()
  @IsString()
  contact_name: string;

  @IsNotEmpty()
  @IsEmail()
  contact_email: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Address)
  billing_address: Address;

  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  shipping_address?: Address;

  @IsNotEmpty()
  @IsString()
  tax_id: string;


}
