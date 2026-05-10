export interface RazorpaySubscriptionCreateParams {
  plan_id: string;
  customer_notify: 0 | 1;
  quantity?: number;
  total_count: number;
  notes?: Record<string, string>;
  start_at?: number;
}

export interface RazorpaySubscriptionEntity {
  id: string;
  status: string;
  short_url: string;
  current_start?: number;
  current_end?: number;
  plan_id: string;
}

export interface RazorpayOrderCreateParams {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string | number>;
}

export interface RazorpayOrderEntity {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
}

export interface RazorpaySubscriptions {
  create(params: RazorpaySubscriptionCreateParams): Promise<RazorpaySubscriptionEntity>;
  cancel(id: string, options: { cancel_at_cycle_end: 0 | 1 }): Promise<RazorpaySubscriptionEntity>;
  pause(id: string, options: { pause_at: 'now' | number }): Promise<RazorpaySubscriptionEntity>;
  resume(id: string, options: { resume_at: 'now' | number }): Promise<RazorpaySubscriptionEntity>;
  fetch(id: string): Promise<RazorpaySubscriptionEntity>;
}

export interface RazorpayOrders {
  create(params: RazorpayOrderCreateParams): Promise<RazorpayOrderEntity>;
}

export interface RazorpayClient {
  subscriptions: RazorpaySubscriptions;
  orders: RazorpayOrders;
}
