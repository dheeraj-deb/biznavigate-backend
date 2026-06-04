-- Per-business default dial code used to canonicalise lead.phone on every write.
-- Defaults to "91" (India) to match the existing tenant base; admins can override
-- per business in business settings.
ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS default_country_code VARCHAR(5) NOT NULL DEFAULT '91';
