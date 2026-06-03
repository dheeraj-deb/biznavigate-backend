-- Seller Order + Payment Safety
-- Adds idempotent payment attempts and state transition audit records for product sellers.

CREATE TABLE IF NOT EXISTS seller_order_payment_attempts (
  attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  reservation_id UUID NULL,
  payment_provider VARCHAR(50) NOT NULL DEFAULT 'manual',
  payment_method VARCHAR(50) NOT NULL DEFAULT 'upi',
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  idempotency_key VARCHAR(160) NOT NULL UNIQUE,
  provider_order_id VARCHAR(255),
  provider_payment_id VARCHAR(255),
  payment_reference VARCHAR(255),
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  source VARCHAR(50) NOT NULL DEFAULT 'payment_desk',
  created_by UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_payment_attempts_business_status
  ON seller_order_payment_attempts(business_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seller_payment_attempts_order_status
  ON seller_order_payment_attempts(order_id, status);

CREATE INDEX IF NOT EXISTS idx_seller_payment_attempts_expiry
  ON seller_order_payment_attempts(expires_at)
  WHERE expires_at IS NOT NULL AND status IN ('created', 'pending', 'authorized');

CREATE INDEX IF NOT EXISTS idx_seller_payment_attempts_provider_payment
  ON seller_order_payment_attempts(provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_seller_payment_attempts_tenant
  ON seller_order_payment_attempts(tenant_id);

CREATE TABLE IF NOT EXISTS seller_order_state_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  event_type VARCHAR(80) NOT NULL,
  from_status VARCHAR(30),
  to_status VARCHAR(30),
  from_payment_status VARCHAR(30),
  to_payment_status VARCHAR(30),
  actor_type VARCHAR(40) NOT NULL DEFAULT 'system',
  actor_id UUID,
  source VARCHAR(50),
  idempotency_key VARCHAR(160) UNIQUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_order_events_business_created
  ON seller_order_state_events(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seller_order_events_order_created
  ON seller_order_state_events(order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seller_order_events_tenant
  ON seller_order_state_events(tenant_id);
