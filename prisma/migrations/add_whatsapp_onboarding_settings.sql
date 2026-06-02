ALTER TABLE business_settings
ADD COLUMN IF NOT EXISTS whatsapp_onboarding JSONB NOT NULL DEFAULT '{"current_usage":"not_sure","safety_acknowledged":false}'::jsonb;

