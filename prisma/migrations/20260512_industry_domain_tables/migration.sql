-- Industry domain tables for product orders and hospitality bookings.
-- Existing orders/order_items remain as a compatibility bridge.

CREATE TABLE IF NOT EXISTS product_item_details (
  item_id UUID PRIMARY KEY REFERENCES catalog_items(item_id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  brand VARCHAR(150),
  sku VARCHAR(100),
  condition VARCHAR(50),
  weight NUMERIC(10,3),
  dimensions JSONB,
  warranty VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_item_details_business ON product_item_details(business_id);
CREATE INDEX IF NOT EXISTS idx_product_item_details_sku ON product_item_details(sku);

CREATE TABLE IF NOT EXISTS hospitality_item_details (
  item_id UUID PRIMARY KEY REFERENCES catalog_items(item_id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  service_type VARCHAR(50),
  capacity INTEGER,
  total_units INTEGER,
  max_adults INTEGER,
  bed_type VARCHAR(100),
  check_in_time VARCHAR(20),
  check_out_time VARCHAR(20),
  amenities JSONB,
  cancellation_policy TEXT,
  tax_percentage NUMERIC(5,2),
  extra_guest_charge NUMERIC(10,2),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hospitality_item_details_business ON hospitality_item_details(business_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_item_details_service_type ON hospitality_item_details(service_type);

CREATE TABLE IF NOT EXISTS product_inquiries (
  inquiry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(lead_id) ON DELETE CASCADE,
  item_id UUID REFERENCES catalog_items(item_id),
  variant_id UUID,
  quantity INTEGER,
  delivery_pincode VARCHAR(20),
  budget NUMERIC(10,2),
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_business_status ON product_inquiries(business_id, status);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_lead_created ON product_inquiries(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_inquiries_item ON product_inquiries(item_id);

CREATE TABLE IF NOT EXISTS hospitality_inquiries (
  inquiry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(lead_id) ON DELETE CASCADE,
  preferred_item_id UUID REFERENCES catalog_items(item_id),
  check_in DATE,
  check_out DATE,
  guests INTEGER,
  budget NUMERIC(10,2),
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hospitality_inquiries_business_status ON hospitality_inquiries(business_id, status);
CREATE INDEX IF NOT EXISTS idx_hospitality_inquiries_lead_created ON hospitality_inquiries(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hospitality_inquiries_item ON hospitality_inquiries(preferred_item_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_inquiries_dates ON hospitality_inquiries(business_id, check_in, check_out);

CREATE TABLE IF NOT EXISTS product_orders (
  product_order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  legacy_order_id UUID UNIQUE REFERENCES orders(order_id),
  customer_id UUID REFERENCES customers(customer_id),
  lead_id UUID REFERENCES leads(lead_id),
  order_number VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  source VARCHAR(50) DEFAULT 'whatsapp',
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_pincode VARCHAR(20),
  shipping_phone VARCHAR(20),
  notes TEXT,
  metadata JSONB,
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_orders_business_created ON product_orders(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_orders_business_status ON product_orders(business_id, status);
CREATE INDEX IF NOT EXISTS idx_product_orders_business_payment ON product_orders(business_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_product_orders_customer ON product_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_lead ON product_orders(lead_id);

CREATE TABLE IF NOT EXISTS product_order_items (
  product_order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_order_id UUID NOT NULL REFERENCES product_orders(product_order_id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES catalog_items(item_id),
  variant_id UUID REFERENCES item_variants(variant_id),
  product_name VARCHAR(255) NOT NULL,
  variant_name VARCHAR(255),
  sku VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL,
  snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_order_items_order ON product_order_items(product_order_id);
CREATE INDEX IF NOT EXISTS idx_product_order_items_item ON product_order_items(item_id);

CREATE TABLE IF NOT EXISTS product_order_status_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_order_id UUID NOT NULL REFERENCES product_orders(product_order_id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  actor VARCHAR(20) NOT NULL DEFAULT 'system',
  actor_id UUID,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_order_events_order_created ON product_order_status_events(product_order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_order_events_business_created ON product_order_status_events(business_id, created_at DESC);

CREATE TABLE IF NOT EXISTS hospitality_bookings (
  hospitality_booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  legacy_order_id UUID UNIQUE REFERENCES orders(order_id),
  customer_id UUID REFERENCES customers(customer_id),
  lead_id UUID REFERENCES leads(lead_id),
  booking_number VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  source VARCHAR(50) DEFAULT 'whatsapp',
  notes TEXT,
  metadata JSONB,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_business_created ON hospitality_bookings(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_business_status ON hospitality_bookings(business_id, status);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_dates ON hospitality_bookings(business_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_customer ON hospitality_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_lead ON hospitality_bookings(lead_id);

CREATE TABLE IF NOT EXISTS hospitality_booking_items (
  booking_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospitality_booking_id UUID NOT NULL REFERENCES hospitality_bookings(hospitality_booking_id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES catalog_items(item_id),
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  nights INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hospitality_booking_items_booking ON hospitality_booking_items(hospitality_booking_id);
CREATE INDEX IF NOT EXISTS idx_hospitality_booking_items_item ON hospitality_booking_items(item_id);

CREATE TABLE IF NOT EXISTS hospitality_booking_guests (
  guest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospitality_booking_id UUID NOT NULL REFERENCES hospitality_bookings(hospitality_booking_id) ON DELETE CASCADE,
  name VARCHAR(255),
  phone VARCHAR(20),
  age INTEGER,
  address TEXT,
  pin_code VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hospitality_booking_guests_booking ON hospitality_booking_guests(hospitality_booking_id);

CREATE TABLE IF NOT EXISTS hospitality_booking_status_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospitality_booking_id UUID NOT NULL REFERENCES hospitality_bookings(hospitality_booking_id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  actor VARCHAR(20) NOT NULL DEFAULT 'system',
  actor_id UUID,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hospitality_booking_events_booking_created ON hospitality_booking_status_events(hospitality_booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hospitality_booking_events_business_created ON hospitality_booking_status_events(business_id, created_at DESC);

-- Initial catalog-detail backfill from existing JSON attributes.
INSERT INTO product_item_details (item_id, business_id, brand, sku, condition, dimensions, warranty, metadata)
SELECT
  item_id,
  business_id,
  attributes->>'brand',
  attributes->>'sku',
  attributes->>'condition',
  attributes->'dimensions',
  attributes->>'warranty',
  attributes
FROM catalog_items
WHERE item_type = 'physical_product'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO hospitality_item_details (
  item_id, business_id, service_type, capacity, total_units, max_adults,
  check_in_time, check_out_time, amenities, cancellation_policy,
  tax_percentage, extra_guest_charge, metadata
)
SELECT
  item_id,
  business_id,
  attributes->>'service_type',
  NULLIF(attributes->>'capacity', '')::integer,
  NULLIF(attributes->>'total_units', '')::integer,
  NULLIF(attributes->>'max_adults', '')::integer,
  attributes->>'check_in_time',
  attributes->>'check_out_time',
  attributes->'amenities',
  attributes->>'cancellation_policy',
  NULLIF(attributes->>'tax_percentage', '')::numeric,
  NULLIF(attributes->>'extra_guest_charge', '')::numeric,
  attributes
FROM catalog_items
WHERE item_type = 'accommodation'
ON CONFLICT (item_id) DO NOTHING;
