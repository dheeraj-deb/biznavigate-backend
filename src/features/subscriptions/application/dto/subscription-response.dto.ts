export class SubscriptionResponseDto {
  business_id: string;
  subscription_plan_id: string | null;
  plan_name?: string;
  price?: number;
  duration_in_days?: number;
}
