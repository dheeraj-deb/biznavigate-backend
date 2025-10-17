export class Tenant {
  tenant_id: string;
  tenant_name: string;
  email: string;
  phone_number?: string;
  gst_number?: string;
  registration_number?: string;
  created_at: Date;
  updated_at: Date;
}
