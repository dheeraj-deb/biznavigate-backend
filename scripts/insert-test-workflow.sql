-- Insert test workflow definition
-- This creates the workflow record that workflow_executions references

INSERT INTO workflow_definitions (
    workflow_id,
    workflow_name,
    workflow_description,
    workflow_definition,
    is_active,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Test Workflow',
    'General inquiry and purchase intent workflow for WhatsApp',
    '{
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "Test Workflow",
        "active": true,
        "nodes": [],
        "connections": {}
    }'::jsonb,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (workflow_id) DO UPDATE SET
    workflow_name = EXCLUDED.workflow_name,
    workflow_description = EXCLUDED.workflow_description,
    workflow_definition = EXCLUDED.workflow_definition,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
