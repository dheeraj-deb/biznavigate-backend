import { IsUUID, IsString } from "class-validator";

export class AssignIntentDto {
  @IsString()
  role_name: string;

  @IsUUID()
  intent_id: string;
}
