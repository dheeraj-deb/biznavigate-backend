-- Track products imported from or linked to external catalogs such as WhatsApp.
-- This keeps catalog_items as the local source of truth while preventing duplicate imports.

CREATE TABLE IF NOT EXISTS external_catalog_items (
  external_catalog_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id              UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  item_id                  UUID REFERENCES catalog_items(item_id),
  provider                 VARCHAR(50) NOT NULL,
  external_catalog_id      VARCHAR(255),
  external_product_id      VARCHAR(255) NOT NULL,
  retailer_id              VARCHAR(255),
  sync_status              VARCHAR(30) NOT NULL DEFAULT 'imported',
  last_synced_at           TIMESTAMPTZ,
  remote_hash              VARCHAR(64),
  local_hash               VARCHAR(64),
  raw_payload              JSONB,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS external_catalog_items_business_id_provider_external_product_id_key
ON external_catalog_items(business_id, provider, external_product_id);

CREATE INDEX IF NOT EXISTS external_catalog_items_business_id_provider_sync_status_idx
ON external_catalog_items(business_id, provider, sync_status);

CREATE INDEX IF NOT EXISTS external_catalog_items_business_id_item_id_idx
ON external_catalog_items(business_id, item_id);

CREATE INDEX IF NOT EXISTS external_catalog_items_external_catalog_id_idx
ON external_catalog_items(external_catalog_id);
