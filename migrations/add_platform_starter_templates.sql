CREATE TABLE IF NOT EXISTS platform_starter_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50),
  kind VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  description TEXT,
  payload JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_starter_templates_lookup
  ON platform_starter_templates (business_type, kind, is_active);

CREATE TABLE IF NOT EXISTS business_starter_template_installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  template_key VARCHAR(120) NOT NULL,
  template_kind VARCHAR(50) NOT NULL,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, template_key)
);

CREATE INDEX IF NOT EXISTS idx_business_starter_template_installs_business
  ON business_starter_template_installs (business_id, installed_at DESC);
