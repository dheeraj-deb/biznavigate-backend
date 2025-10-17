import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEmail,
} from "class-validator";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUUID()
  @IsOptional()
  role_id?: string; // ✅ if role needs to be changed

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
