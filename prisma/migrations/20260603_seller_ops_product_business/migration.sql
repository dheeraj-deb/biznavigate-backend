CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS seller_owner_approvals (
  approval_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  title varchar(255) NOT NULL,
  simple_summary text NULL,
  action_type varchar(60) NOT NULL,
  risk_level varchar(20) NOT NULL DEFAULT 'medium',
  status varchar(20) NOT NULL DEFAULT 'pending',
  source varchar(30) NOT NULL DEFAULT 'ai',
  entity_type varchar(60) NULL,
  entity_id varchar(100) NULL,
  requested_by uuid NULL REFERENCES users(user_id) ON DELETE SET NULL,
  decided_by uuid NULL REFERENCES users(user_id) ON DELETE SET NULL,
  payload jsonb NULL,
  guardrails jsonb NULL,
  due_at timestamptz NULL,
  decided_at timestamptz NULL,
  expires_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seller_owner_approvals_queue
  ON seller_owner_approvals (business_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_owner_approvals_action
  ON seller_owner_approvals (business_id, action_type, status);
CREATE INDEX IF NOT EXISTS idx_seller_owner_approvals_entity
  ON seller_owner_approvals (entity_type, entity_id);

CREATE TABLE IF NOT EXISTS seller_stock_reservations (
  reservation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  customer_id uuid NULL REFERENCES customers(customer_id) ON DELETE SET NULL,
  lead_id uuid NULL REFERENCES leads(lead_id) ON DELETE SET NULL,
  item_id uuid NOT NULL REFERENCES catalog_items(item_id) ON DELETE CASCADE,
  variant_id uuid NULL REFERENCES item_variants(variant_id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  status varchar(20) NOT NULL DEFAULT 'active',
  reason varchar(255) NULL,
  source varchar(30) NOT NULL DEFAULT 'manual',
  expires_at timestamptz NOT NULL,
  released_at timestamptz NULL,
  converted_at timestamptz NULL,
  created_by uuid NULL REFERENCES users(user_id) ON DELETE SET NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seller_stock_reservations_active
  ON seller_stock_reservations (business_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_seller_stock_reservations_item
  ON seller_stock_reservations (business_id, item_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_stock_reservations_customer
  ON seller_stock_reservations (customer_id);

CREATE TABLE IF NOT EXISTS seller_return_cases (
  return_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  order_id uuid NULL REFERENCES orders(order_id) ON DELETE SET NULL,
  product_order_id uuid NULL REFERENCES product_orders(product_order_id) ON DELETE SET NULL,
  customer_id uuid NULL REFERENCES customers(customer_id) ON DELETE SET NULL,
  return_type varchar(30) NOT NULL DEFAULT 'return',
  status varchar(30) NOT NULL DEFAULT 'requested',
  reason text NULL,
  requested_amount numeric(10, 2) NULL,
  approved_amount numeric(10, 2) NULL,
  items jsonb NULL,
  resolution jsonb NULL,
  handled_by uuid NULL REFERENCES users(user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_seller_return_cases_queue
  ON seller_return_cases (business_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_return_cases_order
  ON seller_return_cases (order_id);
CREATE INDEX IF NOT EXISTS idx_seller_return_cases_customer
  ON seller_return_cases (customer_id);

CREATE TABLE IF NOT EXISTS seller_deliveries (
  delivery_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  order_id uuid NULL REFERENCES orders(order_id) ON DELETE SET NULL,
  product_order_id uuid NULL REFERENCES product_orders(product_order_id) ON DELETE SET NULL,
  customer_id uuid NULL REFERENCES customers(customer_id) ON DELETE SET NULL,
  status varchar(30) NOT NULL DEFAULT 'waiting',
  delivery_mode varchar(30) NOT NULL DEFAULT 'local',
  delivery_person varchar(120) NULL,
  phone varchar(20) NULL,
  address text NULL,
  pincode varchar(20) NULL,
  scheduled_at timestamptz NULL,
  picked_at timestamptz NULL,
  delivered_at timestamptz NULL,
  notes text NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seller_deliveries_desk
  ON seller_deliveries (business_id, status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_seller_deliveries_order
  ON seller_deliveries (order_id);
CREATE INDEX IF NOT EXISTS idx_seller_deliveries_customer
  ON seller_deliveries (customer_id);

CREATE TABLE IF NOT EXISTS seller_customer_credit_accounts (
  credit_account_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  customer_id uuid NULL REFERENCES customers(customer_id) ON DELETE SET NULL,
  customer_name varchar(255) NULL,
  phone varchar(20) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  credit_limit numeric(10, 2) NOT NULL DEFAULT 0,
  current_balance numeric(10, 2) NOT NULL DEFAULT 0,
  due_days integer NOT NULL DEFAULT 30,
  approved_by uuid NULL REFERENCES users(user_id) ON DELETE SET NULL,
  approved_at timestamptz NULL,
  notes text NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_seller_credit_phone UNIQUE (business_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_seller_credit_accounts_status
  ON seller_customer_credit_accounts (business_id, status, current_balance);
CREATE INDEX IF NOT EXISTS idx_seller_credit_accounts_customer
  ON seller_customer_credit_accounts (customer_id);

CREATE TABLE IF NOT EXISTS seller_customer_credit_transactions (
  credit_transaction_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_account_id uuid NOT NULL REFERENCES seller_customer_credit_accounts(credit_account_id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  order_id uuid NULL REFERENCES orders(order_id) ON DELETE SET NULL,
  transaction_type varchar(30) NOT NULL,
  amount numeric(10, 2) NOT NULL,
  balance_after numeric(10, 2) NOT NULL,
  note text NULL,
  created_by uuid NULL REFERENCES users(user_id) ON DELETE SET NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seller_credit_transactions_business
  ON seller_customer_credit_transactions (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_credit_transactions_account
  ON seller_customer_credit_transactions (credit_account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_credit_transactions_order
  ON seller_customer_credit_transactions (order_id);

CREATE TABLE IF NOT EXISTS seller_ai_audit_logs (
  ai_audit_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  ai_employee varchar(80) NOT NULL,
  action varchar(120) NOT NULL,
  decision varchar(40) NOT NULL,
  confidence numeric(5, 2) NULL,
  risk_level varchar(20) NOT NULL DEFAULT 'low',
  entity_type varchar(60) NULL,
  entity_id varchar(100) NULL,
  input_summary text NULL,
  output_summary text NULL,
  guardrails jsonb NULL,
  owner_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seller_ai_audit_business
  ON seller_ai_audit_logs (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_ai_audit_employee
  ON seller_ai_audit_logs (business_id, ai_employee, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_ai_audit_entity
  ON seller_ai_audit_logs (entity_type, entity_id);

CREATE TABLE IF NOT EXISTS seller_product_profit_snapshots (
  profit_snapshot_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES catalog_items(item_id) ON DELETE CASCADE,
  variant_id uuid NULL REFERENCES item_variants(variant_id) ON DELETE SET NULL,
  cost_price numeric(10, 2) NULL,
  selling_price numeric(10, 2) NOT NULL,
  gross_margin numeric(10, 2) NULL,
  margin_percentage numeric(5, 2) NULL,
  source varchar(30) NOT NULL DEFAULT 'ai',
  recommendation text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seller_profit_item
  ON seller_product_profit_snapshots (business_id, item_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_profit_margin
  ON seller_product_profit_snapshots (business_id, margin_percentage);

CREATE TABLE IF NOT EXISTS seller_demand_signals (
  demand_signal_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  item_id uuid NULL REFERENCES catalog_items(item_id) ON DELETE SET NULL,
  category varchar(100) NULL,
  signal_type varchar(40) NOT NULL,
  signal_count integer NOT NULL DEFAULT 1,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  source varchar(30) NOT NULL DEFAULT 'ai',
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seller_demand_signal_type
  ON seller_demand_signals (business_id, signal_type, period_start);
CREATE INDEX IF NOT EXISTS idx_seller_demand_category
  ON seller_demand_signals (business_id, category, period_start);
CREATE INDEX IF NOT EXISTS idx_seller_demand_item
  ON seller_demand_signals (item_id);
