export enum ContactType {
  customer = "customer",
  vendor = "vendor",
}

export interface Contact {
  contact_name: string;
  company_name: string;
  payment_terms?: number;
  currency_id: string;
  website?: string;
  contact_type: ContactType;
  billing_address: {
    attention: string;
    address: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shipping_address?: {
    attention: string;
    address: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  contact_persons?: {
    salutation: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    mobile: string;
    is_primary_contact?: boolean;
  }[];
  //   default_templates?: {}
  language_code?: string;
  notes?: string;
  vat_reg_no?: string;
  tax_reg_no?: string;
  country_code?: string;
  vat_treatment?: string;
  tax_treatment?:
    | "vat_registered"
    | "vat_not_registered"
    | "gcc_vat_not_registered"
    | "gcc_vat_registered"
    | "non_gcc"
    | "dz_vat_registered"
    | "dz_vat_not_registered";
  tax_regime?: string;
  legal_name?: string;
  is_tds_registered?: boolean;
  avatax_exempt_no?: string;
  avatax_use_code?: string;
  tax_exemption_id?: string;
  tax_authority_id?: string;
  tax_id?: string;
  is_taxable?: boolean;
  facebook?: string;
  twitter?: string;
  place_of_contact?: string;
  gst_no?: string;
  gst_treatment?: "business_gst" | "business_gst" | "business_gst" | "consumer";
  tax_authority_name?: string;
  tax_exemption_code?: string;
}

export interface Currency {
  currency_id: string;
  currency_code: string;
  currency_name: string;
  currency_symbol: string;
  price_precision: number;
  is_base_currency: boolean;
}

export interface ZohoApiResponse<T> {
  code: number;
  message: string;
  [key: string]: T | any;
}
