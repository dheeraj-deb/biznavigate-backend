interface InventoryLocation {
  location_id: string;
  location_name: string;
  status: string;
  is_primary: boolean;
  location_stock_on_hand: string | number | null;
  location_available_stock: string | number | null;
  location_actual_available_stock: string | number | null;
}

interface CustomField {
  customfield_id: string;
  value: string | number | boolean | null;
}

export interface ZohoItem {
  group_id: number;
  group_name: string;
  item_id: string;
  name: string;
  status: string;
  source: string;
  is_linked_with_zohocrm: boolean;
  item_type: string;
  description: string;
  rate: number;
  is_taxable: boolean;
  tax_id: number;
  tax_name: string;
  tax_percentage: number;
  purchase_description: string;
  purchase_rate: number;
  is_combo_product: boolean;
  product_type: string;
  attribute_id1?: number;
  attribute_name1?: string;
  reorder_level: number;
  locations: InventoryLocation[];
  sku: string;
  upc?: number | string;
  ean?: number | string;
  isbn?: number | string;
  part_number?: number | string;
  attribute_option_id1?: number;
  attribute_option_name1?: string;
  image_name?: string;
  image_type?: string;
  created_time: string;          // ISO date string
  last_modified_time: string;    // ISO date string
  hsn_or_sac?: number | string;
  sat_item_key_code?: string;
  unitkey_code?: string;
  custom_fields?: CustomField[];
}
