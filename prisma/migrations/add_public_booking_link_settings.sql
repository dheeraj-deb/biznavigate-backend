ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS public_booking_slug VARCHAR(120);

CREATE UNIQUE INDEX IF NOT EXISTS businesses_public_booking_slug_key
  ON businesses(public_booking_slug)
  WHERE public_booking_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_businesses_public_booking_slug
  ON businesses(public_booking_slug);

ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS booking_link JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "experience_type": "generic",
    "payment_mode": "manual",
    "advance_type": "fixed",
    "advance_amount": 0,
    "theme": {
      "primary_color": "#0066FF",
      "show_logo": true,
      "show_banner": true
    },
    "policies": {
      "cancellation": "",
      "refund": "",
      "terms": ""
    },
    "contact": {
      "phone": "",
      "whatsapp": "",
      "address": ""
    },
    "required_fields": {
      "name": true,
      "phone": true,
      "email": false,
      "address": false,
      "notes": false
    }
  }'::jsonb;
