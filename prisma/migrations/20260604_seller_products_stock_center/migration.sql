-- Seller Products & Stock Center
-- Adds scalable import tracking and manual stock-adjustment audit for product sellers.

CREATE TABLE IF NOT EXISTS seller_product_import_jobs (
  import_job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  source VARCHAR(40) NOT NULL DEFAULT 'csv',
  status VARCHAR(30) NOT NULL DEFAULT 'processing',
  total_rows INT NOT NULL DEFAULT 0,
  created_count INT NOT NULL DEFAULT 0,
  updated_count INT NOT NULL DEFAULT 0,
  skipped_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  errors JSONB,
  summary JSONB,
  created_by UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_import_jobs_business_created
  ON seller_product_import_jobs(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seller_import_jobs_status
  ON seller_product_import_jobs(status);

CREATE INDEX IF NOT EXISTS idx_seller_import_jobs_tenant
  ON seller_product_import_jobs(tenant_id);

CREATE TABLE IF NOT EXISTS seller_stock_adjustments (
  adjustment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  variant_id UUID,
  import_job_id UUID,
  adjustment_type VARCHAR(20) NOT NULL,
  quantity_change INT NOT NULL,
  quantity_before INT NOT NULL,
  quantity_after INT NOT NULL,
  reserved_before INT NOT NULL DEFAULT 0,
  available_after INT NOT NULL DEFAULT 0,
  reason VARCHAR(80) NOT NULL,
  source VARCHAR(40) NOT NULL DEFAULT 'manual',
  reference VARCHAR(255),
  note TEXT,
  created_by UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_stock_adjustments_business_created
  ON seller_stock_adjustments(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seller_stock_adjustments_product_created
  ON seller_stock_adjustments(product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seller_stock_adjustments_import_job
  ON seller_stock_adjustments(import_job_id)
  WHERE import_job_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_seller_stock_adjustments_tenant
  ON seller_stock_adjustments(tenant_id);
