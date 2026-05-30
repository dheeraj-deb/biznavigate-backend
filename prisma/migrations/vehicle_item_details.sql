-- Migration: replace vehicle_inventory with vehicle_item_details extension table

CREATE TABLE vehicle_item_details (
  item_id      UUID PRIMARY KEY REFERENCES catalog_items(item_id) ON DELETE CASCADE,
  business_id  UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  make         VARCHAR(80) NOT NULL,
  model_name   VARCHAR(80) NOT NULL,
  year         INTEGER NOT NULL,
  fuel_type    VARCHAR(30),
  transmission VARCHAR(30),
  color        VARCHAR(50),
  km_driven    INTEGER,
  condition    VARCHAR(30) NOT NULL DEFAULT 'used',
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_item_details_business ON vehicle_item_details(business_id);
CREATE INDEX idx_vehicle_item_details_make_model ON vehicle_item_details(make, model_name);
CREATE INDEX idx_vehicle_item_details_year ON vehicle_item_details(year);

-- Drop old standalone table (if it exists and has no data worth keeping)
DROP TABLE IF EXISTS vehicle_inventory;
