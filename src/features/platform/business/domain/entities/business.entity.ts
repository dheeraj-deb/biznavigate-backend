export class BusinessEmployee {
  employee_id: string;
  business_id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  created_at?: Date;
}

export class Business {
  business_id: string;
  tenant_id: string;
  business_name: string;
  business_type?: string;
  business_group?: string;
  communication_mode?: string;
  blueprint_seeded?: boolean;
  blueprint_seeded_at?: Date;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  address?: string;
  country?: string;
  gst_number?: string;
  pan_number?: string;
  whatsapp_number?: string;
  created_at?: Date;
  updated_at?: Date;
  business_employees?: BusinessEmployee[];
}
