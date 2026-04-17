import { IsString, IsOptional, IsObject } from "class-validator";

export class CreateRoleDto {
  @IsString()
  role_name: string;

  @IsObject()
  @IsOptional()
  permissions?: any;
}
