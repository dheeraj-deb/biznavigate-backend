import { IsUUID, IsString } from "class-validator";

export class NotifyUserDto {
  @IsString()
  intent_name: string;

  @IsUUID()
  business_id: string;

  @IsString()
  message: string;
}
