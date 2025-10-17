import { IsUUID, IsNotEmpty } from "class-validator";

export class AssignRoleDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  role_id: string;
}
