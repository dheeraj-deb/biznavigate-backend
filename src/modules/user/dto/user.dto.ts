import { IsNotEmpty, IsString } from "class-validator";

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

class CreateContact {
  @IsNotEmpty()
  contact_name: string;

  @IsNotEmpty()
  contact_email: string;

  billing_address: Address;

  shipping_address?: Address;

  
}
