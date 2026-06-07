-- High-ticket appointment sales foundation for used cars and property sellers.
-- Listings stay in catalog_items; vertical-specific details and visit scheduling
-- live in separate extension tables so hospitality/product commerce stay clean.

CREATE TABLE IF NOT EXISTS property_item_details (
  item_id uuid PRIMARY KEY REFERENCES catalog_items(item_id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  property_type varchar(60) NOT NULL,
  listing_type varchar(30) NOT NULL DEFAULT 'sale',
  bedrooms int NULL,
  bathrooms int NULL,
  area_sqft int NULL,
  floor_number int NULL,
  total_floors int NULL,
  locality varchar(120) NULL,
  city varchar(100) NULL,
  furnishing varchar(40) NULL,
  possession_status varchar(60) NULL,
  facing varchar(30) NULL,
  parking varchar(60) NULL,
  rera_id varchar(80) NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_item_details_business
  ON property_item_details(business_id);
CREATE INDEX IF NOT EXISTS idx_property_item_details_city_locality
  ON property_item_details(business_id, city, locality);
CREATE INDEX IF NOT EXISTS idx_property_item_details_type
  ON property_item_details(business_id, property_type);

CREATE TABLE IF NOT EXISTS appointment_sales_settings (
  appointment_sales_settings_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL UNIQUE REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  vertical_type varchar(30) NOT NULL,
  onboarding_status varchar(30) NOT NULL DEFAULT 'draft',
  default_visit_type varchar(40) NOT NULL DEFAULT 'showroom_visit',
  default_visit_location text NULL,
  slot_duration_minutes int NOT NULL DEFAULT 45,
  visit_buffer_minutes int NOT NULL DEFAULT 15,
  auto_assign_visits boolean NOT NULL DEFAULT true,
  reminder_minutes_before int NOT NULL DEFAULT 60,
  escalation_rules jsonb NULL,
  setup_checklist jsonb NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointment_sales_settings_status
  ON appointment_sales_settings(business_id, onboarding_status);

CREATE TABLE IF NOT EXISTS appointment_sales_staff (
  sales_staff_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  name varchar(160) NOT NULL,
  phone varchar(30) NULL,
  email varchar(255) NULL,
  role varchar(60) NOT NULL DEFAULT 'sales_consultant',
  title varchar(120) NULL,
  priority int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NULL,
  created_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointment_staff_business_active
  ON appointment_sales_staff(business_id, is_active, priority);
CREATE INDEX IF NOT EXISTS idx_appointment_staff_phone
  ON appointment_sales_staff(business_id, phone);

CREATE TABLE IF NOT EXISTS appointment_sales_staff_availability (
  availability_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_staff_id uuid NOT NULL REFERENCES appointment_sales_staff(sales_staff_id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time varchar(5) NOT NULL,
  end_time varchar(5) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointment_staff_availability_day
  ON appointment_sales_staff_availability(business_id, day_of_week, is_active);
CREATE INDEX IF NOT EXISTS idx_appointment_staff_availability_staff_day
  ON appointment_sales_staff_availability(sales_staff_id, day_of_week);

CREATE TABLE IF NOT EXISTS appointment_sales_visits (
  visit_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id uuid NULL,
  lead_id uuid NULL REFERENCES leads(lead_id) ON DELETE SET NULL,
  customer_id uuid NULL REFERENCES customers(customer_id) ON DELETE SET NULL,
  item_id uuid NULL REFERENCES catalog_items(item_id) ON DELETE SET NULL,
  sales_staff_id uuid NULL REFERENCES appointment_sales_staff(sales_staff_id) ON DELETE SET NULL,
  visit_type varchar(40) NOT NULL DEFAULT 'showroom_visit',
  status varchar(30) NOT NULL DEFAULT 'scheduled',
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  customer_name varchar(255) NULL,
  customer_phone varchar(30) NULL,
  location text NULL,
  source varchar(40) NOT NULL DEFAULT 'owner',
  notes text NULL,
  metadata jsonb NULL,
  created_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (scheduled_end > scheduled_start)
);

CREATE INDEX IF NOT EXISTS idx_appointment_visits_business_time
  ON appointment_sales_visits(business_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_appointment_visits_status_time
  ON appointment_sales_visits(business_id, status, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_appointment_visits_staff_time
  ON appointment_sales_visits(sales_staff_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_appointment_visits_item
  ON appointment_sales_visits(item_id);
CREATE INDEX IF NOT EXISTS idx_appointment_visits_lead
  ON appointment_sales_visits(lead_id);

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE INDEX IF NOT EXISTS appointment_visits_staff_no_overlap
  ON appointment_sales_visits
  USING gist (
    sales_staff_id,
    tstzrange(scheduled_start, scheduled_end, '[)')
  )
  WHERE sales_staff_id IS NOT NULL
    AND status IN ('scheduled', 'confirmed', 'arrived');

DO $$
BEGIN
  ALTER TABLE appointment_sales_visits
    ADD CONSTRAINT appointment_visits_staff_no_overlap_excl
    EXCLUDE USING gist (
      sales_staff_id WITH =,
      tstzrange(scheduled_start, scheduled_end, '[)') WITH &&
    )
    WHERE (sales_staff_id IS NOT NULL AND status IN ('scheduled', 'confirmed', 'arrived'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
