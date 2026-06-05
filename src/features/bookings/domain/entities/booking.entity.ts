export class BookingEntity {
  booking_id: string;
  booking_reference: string;
  service_id: string;
  business_id: string;
  lead_id?: string;
  customer_name: string;
  customer_phone: string;
  check_in_date: Date;
  check_out_date: Date;
  slots_booked: number;
  total_price: number;
  status: string;
  special_requests?: string;
  created_at: Date;
  updated_at: Date;
}
