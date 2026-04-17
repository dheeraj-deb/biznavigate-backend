import { IsNotEmpty, IsUUID } from "class-validator";

export class CancelSubscriptionDto {
  @IsNotEmpty()
  @IsUUID()
  business_id: string;
}
