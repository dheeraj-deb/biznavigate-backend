-- Fix column sizes in campaign_recipients to support UUIDs and longer phone numbers
ALTER TABLE campaign_recipients
  ALTER COLUMN business_id TYPE VARCHAR(36),
  ALTER COLUMN phone_number TYPE VARCHAR(30),
  ALTER COLUMN contact_id TYPE VARCHAR(36);
