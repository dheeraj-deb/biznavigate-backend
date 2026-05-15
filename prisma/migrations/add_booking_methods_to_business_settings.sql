ALTER TABLE business_settings
ADD COLUMN IF NOT EXISTS booking_methods jsonb NOT NULL DEFAULT '{
  "ai_chat": {
    "enabled": true,
    "collect_guest_details": true,
    "require_confirmation": true
  },
  "interactive": {
    "enabled": true,
    "send_entry_buttons": true,
    "send_room_or_service_list": true
  },
  "catalog": {
    "enabled": false,
    "send_product_messages": false
  },
  "templates": {
    "enabled": false,
    "confirmation_template_name": "",
    "reminder_template_name": "",
    "language": "en"
  },
  "human_handoff": {
    "enabled": true,
    "on_unavailable": true,
    "on_low_confidence": true,
    "on_payment_issue": true
  }
}'::jsonb;
