CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS seller_store_settings (
  seller_store_settings_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  store_type VARCHAR(50) NOT NULL DEFAULT 'product_seller',
  onboarding_status VARCHAR(30) NOT NULL DEFAULT 'not_started',
  default_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  stock_hold_minutes INTEGER NOT NULL DEFAULT 15,
  payment_modes TEXT[] NOT NULL DEFAULT ARRAY['cash', 'upi', 'cod']::TEXT[],
  delivery_modes TEXT[] NOT NULL DEFAULT ARRAY['pickup', 'local_delivery']::TEXT[],
  delivery_areas JSONB,
  credit_defaults JSONB,
  ai_guardrails JSONB,
  setup_checklist JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_owner_approvals (
  approval_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requested_action VARCHAR(100),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  risk_level VARCHAR(20) NOT NULL DEFAULT 'low',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  source VARCHAR(30) NOT NULL DEFAULT 'ai',
  ai_employee_key VARCHAR(80),
  customer_phone VARCHAR(20),
  metadata JSONB,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_stock_reservations (
  seller_reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(variant_id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(lead_id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(customer_id) ON DELETE SET NULL,
  customer_phone VARCHAR(20),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason VARCHAR(255),
  source VARCHAR(30) NOT NULL DEFAULT 'manual',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  released_at TIMESTAMPTZ,
  converted_order_id UUID REFERENCES orders(order_id) ON DELETE SET NULL,
  created_by UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_return_cases (
  return_case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  order_id UUID REFERENCES orders(order_id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(customer_id) ON DELETE SET NULL,
  customer_phone VARCHAR(20),
  product_id UUID REFERENCES products(product_id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  reason VARCHAR(255),
  resolution VARCHAR(50),
  refund_amount NUMERIC(10, 2),
  exchange_product_id UUID REFERENCES products(product_id) ON DELETE SET NULL,
  source VARCHAR(30) NOT NULL DEFAULT 'manual',
  owner_approval_id UUID REFERENCES seller_owner_approvals(approval_id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS seller_deliveries (
  delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  order_id UUID REFERENCES orders(order_id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(customer_id) ON DELETE SET NULL,
  customer_phone VARCHAR(20),
  delivery_mode VARCHAR(40) NOT NULL DEFAULT 'local_delivery',
  address TEXT,
  area VARCHAR(100),
  assigned_to UUID,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  collect_payment BOOLEAN NOT NULL DEFAULT FALSE,
  payment_amount NUMERIC(10, 2),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_customer_credit_accounts (
  credit_account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  customer_id UUID REFERENCES customers(customer_id) ON DELETE SET NULL,
  phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  credit_limit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  due_days INTEGER NOT NULL DEFAULT 30,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_seller_credit_phone_per_business UNIQUE (business_id, phone)
);

CREATE TABLE IF NOT EXISTS seller_customer_credit_transactions (
  credit_transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  credit_account_id UUID NOT NULL REFERENCES seller_customer_credit_accounts(credit_account_id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(order_id) ON DELETE SET NULL,
  transaction_type VARCHAR(30) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_ai_audit_logs (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  ai_employee_key VARCHAR(80) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(100),
  customer_phone VARCHAR(20),
  risk_level VARCHAR(20) NOT NULL DEFAULT 'low',
  confidence NUMERIC(3, 2),
  decision VARCHAR(50),
  input_summary TEXT,
  output_summary TEXT,
  guardrail_result JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_product_profit_snapshots (
  profit_snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  cost_price NUMERIC(10, 2),
  selling_price NUMERIC(10, 2),
  margin_percent NUMERIC(5, 2),
  last_sale_at TIMESTAMPTZ,
  dead_stock_score INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_seller_profit_product_per_business UNIQUE (business_id, product_id)
);

CREATE TABLE IF NOT EXISTS seller_demand_signals (
  demand_signal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  product_id UUID REFERENCES products(product_id) ON DELETE SET NULL,
  category VARCHAR(100),
  customer_phone VARCHAR(20),
  signal_type VARCHAR(40) NOT NULL,
  channel VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
  quantity INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_store_settings_tenant_id ON seller_store_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seller_owner_approvals_business_status ON seller_owner_approvals(business_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_owner_approvals_business_created ON seller_owner_approvals(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_owner_approvals_tenant_id ON seller_owner_approvals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seller_stock_res_business_status_expiry ON seller_stock_reservations(business_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_seller_stock_res_product_status ON seller_stock_reservations(product_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_stock_res_tenant_id ON seller_stock_reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seller_return_cases_business_status ON seller_return_cases(business_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_return_cases_order_id ON seller_return_cases(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_return_cases_tenant_id ON seller_return_cases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seller_deliveries_business_status ON seller_deliveries(business_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_deliveries_order_id ON seller_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_deliveries_tenant_id ON seller_deliveries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seller_credit_accounts_business_status ON seller_customer_credit_accounts(business_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_credit_accounts_tenant_id ON seller_customer_credit_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seller_credit_tx_account_created ON seller_customer_credit_transactions(credit_account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_credit_tx_business_type ON seller_customer_credit_transactions(business_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_seller_credit_tx_tenant_id ON seller_customer_credit_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seller_ai_audit_business_created ON seller_ai_audit_logs(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_ai_audit_business_employee ON seller_ai_audit_logs(business_id, ai_employee_key);
CREATE INDEX IF NOT EXISTS idx_seller_ai_audit_tenant_id ON seller_ai_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seller_profit_business_dead_stock ON seller_product_profit_snapshots(business_id, dead_stock_score);
CREATE INDEX IF NOT EXISTS idx_seller_profit_tenant_id ON seller_product_profit_snapshots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seller_demand_business_created ON seller_demand_signals(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_demand_business_category ON seller_demand_signals(business_id, category);
CREATE INDEX IF NOT EXISTS idx_seller_demand_product_id ON seller_demand_signals(product_id);
CREATE INDEX IF NOT EXISTS idx_seller_demand_tenant_id ON seller_demand_signals(tenant_id);
