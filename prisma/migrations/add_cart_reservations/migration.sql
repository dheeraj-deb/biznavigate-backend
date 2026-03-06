-- Migration: Cart-level stock reservations (pre-order holds)
-- These are created when a lead adds to cart via WhatsApp catalog,
-- before an actual order exists. No FK to orders table.

CREATE TABLE IF NOT EXISTS cart_reservations (
  reservation_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id        UUID        NOT NULL,
  product_id     UUID        NOT NULL,
  variant_id     UUID,
  quantity       INTEGER     NOT NULL CHECK (quantity > 0),
  expires_at     TIMESTAMPTZ NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_cart_reservation_lead    FOREIGN KEY (lead_id)    REFERENCES leads(lead_id)       ON DELETE CASCADE,
  CONSTRAINT fk_cart_reservation_product FOREIGN KEY (product_id) REFERENCES products(product_id),
  CONSTRAINT chk_cart_reservation_status CHECK (status IN ('active', 'released', 'converted'))
);

CREATE INDEX idx_cart_reservations_lead_id    ON cart_reservations(lead_id);
CREATE INDEX idx_cart_reservations_product_id ON cart_reservations(product_id);
-- Partial index — only active unexpired holds matter for stock math
CREATE INDEX idx_cart_reservations_expires_at ON cart_reservations(expires_at) WHERE status = 'active';
CREATE INDEX idx_cart_reservations_status     ON cart_reservations(status);
