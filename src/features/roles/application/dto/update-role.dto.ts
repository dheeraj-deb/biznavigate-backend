import { IsString, IsOptional, IsObject } from "class-validator";

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  role_name?: string;

  @IsObject()
  @IsOptional()
  permissions?: any;
}
