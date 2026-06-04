ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS business_group VARCHAR(5),
  ADD COLUMN IF NOT EXISTS communication_mode VARCHAR(20) NOT NULL DEFAULT 'AI',
  ADD COLUMN IF NOT EXISTS blueprint_seeded BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS blueprint_seeded_at TIMESTAMPTZ;

UPDATE businesses
SET business_group = CASE business_type
  WHEN 'real_estate' THEN 'A'
  WHEN 'used_cars' THEN 'A'
  WHEN 'hospitality' THEN 'B'
  WHEN 'events' THEN 'B'
  WHEN 'products' THEN 'C'
  WHEN 'retail' THEN 'C'
  WHEN 'healthcare' THEN 'D'
  WHEN 'professional_services' THEN 'D'
  WHEN 'crm_automation' THEN 'D'
  WHEN 'education' THEN 'D'
  ELSE business_group
END
WHERE business_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_businesses_business_group
  ON businesses(business_group);

CREATE INDEX IF NOT EXISTS idx_businesses_communication_mode
  ON businesses(communication_mode);

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100),
  ADD COLUMN IF NOT EXISTS auto_approve_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deduplication_key VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS campaigns_deduplication_key_key
  ON campaigns(deduplication_key)
  WHERE deduplication_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_auto_approve_at
  ON campaigns(auto_approve_at);
