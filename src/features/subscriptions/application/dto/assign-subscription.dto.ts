import { IsNotEmpty, IsUUID } from "class-validator";

export class AssignSubscriptionDto {
  @IsNotEmpty()
  @IsUUID()
  business_id: string;

  @IsNotEmpty()
  @IsUUID()
  subscription_plan_id: string;
}
