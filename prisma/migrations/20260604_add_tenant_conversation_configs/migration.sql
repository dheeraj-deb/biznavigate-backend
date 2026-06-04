CREATE TABLE IF NOT EXISTS tenant_conversation_configs (
  config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  waba_id VARCHAR(255) NOT NULL,
  mode VARCHAR(30) NOT NULL DEFAULT 'text',
  flow VARCHAR(30) NOT NULL DEFAULT 'support',
  capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tenant_conversation_configs_mode_chk
    CHECK (mode IN ('text', 'interactive', 'web')),
  CONSTRAINT tenant_conversation_configs_flow_chk
    CHECK (flow IN ('sales', 'booking', 'ordering', 'support')),
  CONSTRAINT tenant_conversation_configs_tenant_waba_key
    UNIQUE (tenant_id, waba_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_conversation_configs_tenant
  ON tenant_conversation_configs(tenant_id);

CREATE INDEX IF NOT EXISTS idx_tenant_conversation_configs_waba
  ON tenant_conversation_configs(waba_id);
