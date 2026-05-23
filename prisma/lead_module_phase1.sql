-- Lead Module Phase 1 — apply new columns and tables
-- Safe to run multiple times (IF NOT EXISTS / IF NOT EXISTS guards)

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS lead_type VARCHAR(30),
  ADD COLUMN IF NOT EXISTS qualification_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS exit_intent_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS exit_captured_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS exit_reason VARCHAR(30);

CREATE INDEX IF NOT EXISTS idx_leads_business_lead_type ON leads(business_id, lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_business_qual_score ON leads(business_id, qualification_score DESC);

CREATE TABLE IF NOT EXISTS lead_item_interests (
  interest_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID NOT NULL REFERENCES leads(lead_id) ON DELETE CASCADE,
  business_id     UUID NOT NULL,
  item_id         UUID,
  item_type       VARCHAR(30) NOT NULL,
  item_name       VARCHAR(255) NOT NULL,
  interest_level  VARCHAR(20) NOT NULL DEFAULT 'viewed',
  last_price_seen NUMERIC(12,2),
  is_alert_active BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_lead_item_interest ON lead_item_interests(lead_id, item_id) WHERE item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_item_interests_lead ON lead_item_interests(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_item_interests_business_alert ON lead_item_interests(business_id, is_alert_active);

CREATE TABLE IF NOT EXISTS lead_preference_watches (
  watch_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES leads(lead_id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  watch_type  VARCHAR(30) NOT NULL,
  criteria    JSONB NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  notified_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pref_watches_business_type_active ON lead_preference_watches(business_id, watch_type, is_active);
CREATE INDEX IF NOT EXISTS idx_pref_watches_lead ON lead_preference_watches(lead_id);
CREATE INDEX IF NOT EXISTS idx_pref_watches_expires ON lead_preference_watches(expires_at);

CREATE TABLE IF NOT EXISTS vehicle_inventory (
  vehicle_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(business_id),
  make         VARCHAR(80) NOT NULL,
  model_name   VARCHAR(80) NOT NULL,
  year         INTEGER NOT NULL,
  fuel_type    VARCHAR(30),
  color        VARCHAR(50),
  asking_price NUMERIC(12,2) NOT NULL,
  km_driven    INTEGER,
  condition    VARCHAR(20) NOT NULL DEFAULT 'used',
  images       TEXT[] NOT NULL DEFAULT '{}',
  description  TEXT,
  status       VARCHAR(20) NOT NULL DEFAULT 'available',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vehicle_inv_business_status ON vehicle_inventory(business_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicle_inv_business_price ON vehicle_inventory(business_id, asking_price);
CREATE INDEX IF NOT EXISTS idx_vehicle_inv_make_model ON vehicle_inventory(business_id, make, model_name);
