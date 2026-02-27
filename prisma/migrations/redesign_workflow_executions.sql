-- Redesign workflow_executions table
-- Add new columns
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS channel VARCHAR(50);
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS message_id VARCHAR(255);
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS chat_id VARCHAR(255);
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS waiting_for_input BOOLEAN DEFAULT false;
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS intent VARCHAR(100);
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS current_node_id VARCHAR(100);
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS context JSONB;

-- Drop old columns (backup data first if needed)
ALTER TABLE workflow_executions DROP COLUMN IF EXISTS workflow_key;
ALTER TABLE workflow_executions DROP COLUMN IF EXISTS intent_name;
ALTER TABLE workflow_executions DROP COLUMN IF EXISTS current_state;
ALTER TABLE workflow_executions DROP COLUMN IF EXISTS execution_context;
ALTER TABLE workflow_executions DROP COLUMN IF EXISTS error_message;
