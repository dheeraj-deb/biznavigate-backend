export class BusinessResponseDto {
  business_id: string;
  tenant_id: string;
  business_name: string;
  business_type?: string;
  whatsapp_number?: string;
  logo_url?: string;
  created_at?: Date;
  updated_at?: Date;
}
