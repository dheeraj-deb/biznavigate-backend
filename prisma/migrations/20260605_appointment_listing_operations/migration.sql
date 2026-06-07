-- Operational listing fields for used-car and property appointment-sales businesses.

ALTER TABLE vehicle_item_details
  ADD COLUMN IF NOT EXISTS ownership_count integer NULL,
  ADD COLUMN IF NOT EXISTS insurance_valid_until date NULL,
  ADD COLUMN IF NOT EXISTS registration_number varchar(40) NULL,
  ADD COLUMN IF NOT EXISTS rc_status varchar(60) NULL,
  ADD COLUMN IF NOT EXISTS finance_available boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exchange_accepted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accident_history varchar(120) NULL,
  ADD COLUMN IF NOT EXISTS service_history text NULL,
  ADD COLUMN IF NOT EXISTS test_drive_available boolean NOT NULL DEFAULT true;

ALTER TABLE property_item_details
  ADD COLUMN IF NOT EXISTS map_url text NULL,
  ADD COLUMN IF NOT EXISTS documents_status varchar(80) NULL,
  ADD COLUMN IF NOT EXISTS loan_support_available boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visit_landmark varchar(160) NULL;

CREATE INDEX IF NOT EXISTS idx_vehicle_item_details_rc
  ON vehicle_item_details(business_id, registration_number);

CREATE INDEX IF NOT EXISTS idx_property_item_details_documents
  ON property_item_details(business_id, documents_status);
