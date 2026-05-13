-- Durable workflow execution state, step logs, and idempotency keys.

ALTER TABLE workflow_executions
  ADD COLUMN IF NOT EXISTS tenant_id UUID,
  ADD COLUMN IF NOT EXISTS conversation_id UUID,
  ADD COLUMN IF NOT EXISTS system_context JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workflow_executions_tenant_id_fkey'
  ) THEN
    ALTER TABLE workflow_executions
      ADD CONSTRAINT workflow_executions_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_workflow_executions_business_status
  ON workflow_executions(business_id, status);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_business_chat_waiting
  ON workflow_executions(business_id, chat_id, waiting_for_input);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_conversation_id
  ON workflow_executions(conversation_id);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_tenant_id
  ON workflow_executions(tenant_id);

CREATE TABLE IF NOT EXISTS workflow_execution_steps (
  step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL,
  workflow_id UUID NOT NULL,
  business_id UUID NOT NULL,
  tenant_id UUID,
  node_id VARCHAR(100) NOT NULL,
  node_type VARCHAR(100),
  node_name VARCHAR(255),
  status VARCHAR(30) NOT NULL,
  input JSONB,
  output JSONB,
  error_message TEXT,
  error_stack TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workflow_execution_steps_execution_id_fkey
    FOREIGN KEY (execution_id) REFERENCES workflow_executions(execution_id) ON DELETE CASCADE,
  CONSTRAINT workflow_execution_steps_workflow_id_fkey
    FOREIGN KEY (workflow_id) REFERENCES workflow_definitions(workflow_id),
  CONSTRAINT workflow_execution_steps_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  CONSTRAINT workflow_execution_steps_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_execution_started
  ON workflow_execution_steps(execution_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_business_started
  ON workflow_execution_steps(business_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_business_node
  ON workflow_execution_steps(business_id, node_id);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_tenant_id
  ON workflow_execution_steps(tenant_id);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_id
  ON workflow_execution_steps(workflow_id);

CREATE TABLE IF NOT EXISTS workflow_idempotency_keys (
  key_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  business_id UUID NOT NULL,
  tenant_id UUID,
  workflow_id UUID,
  execution_id UUID,
  lead_id UUID,
  conversation_id UUID,
  message_id VARCHAR(255),
  node_id VARCHAR(100),
  purpose VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'started',
  response JSONB,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workflow_idempotency_keys_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
  CONSTRAINT workflow_idempotency_keys_tenant_id_fkey
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  CONSTRAINT workflow_idempotency_keys_workflow_id_fkey
    FOREIGN KEY (workflow_id) REFERENCES workflow_definitions(workflow_id),
  CONSTRAINT workflow_idempotency_keys_execution_id_fkey
    FOREIGN KEY (execution_id) REFERENCES workflow_executions(execution_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_workflow_idem_business_purpose
  ON workflow_idempotency_keys(business_id, purpose, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_idem_business_message
  ON workflow_idempotency_keys(business_id, message_id);

CREATE INDEX IF NOT EXISTS idx_workflow_idem_execution_id
  ON workflow_idempotency_keys(execution_id);

CREATE INDEX IF NOT EXISTS idx_workflow_idem_lead_id
  ON workflow_idempotency_keys(lead_id);

CREATE INDEX IF NOT EXISTS idx_workflow_idem_tenant_id
  ON workflow_idempotency_keys(tenant_id);
