CREATE TABLE IF NOT EXISTS seller_store_settings (
  seller_store_settings_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  store_type varchar(50) NOT NULL DEFAULT 'local_retail',
  onboarding_status varchar(30) NOT NULL DEFAULT 'draft',
  default_currency varchar(10) NOT NULL DEFAULT 'INR',
  low_stock_threshold integer NOT NULL DEFAULT 5,
  stock_hold_minutes integer NOT NULL DEFAULT 15,
  payment_modes text[] NOT NULL DEFAULT ARRAY['cash', 'upi', 'cod']::text[],
  delivery_modes text[] NOT NULL DEFAULT ARRAY['pickup', 'local_delivery']::text[],
  delivery_areas jsonb NULL,
  credit_defaults jsonb NULL,
  ai_guardrails jsonb NULL,
  setup_checklist jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_seller_store_settings_business UNIQUE (business_id)
);

CREATE INDEX IF NOT EXISTS idx_seller_store_settings_status
  ON seller_store_settings (business_id, onboarding_status);
