import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsUUID,
  IsPhoneNumber,
  IsOptional,
} from "class-validator";
import { IsStrongPassword } from "../../../../common/validators/password.validator";

export class SignupDto {
    @IsString()
  @IsNotEmpty()
  tenant_name: string;

    @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

    @IsOptional()
  @IsString()
  name: string;

    // @IsPhoneNumber()
  @IsNotEmpty()
  phone_number: string;
}
