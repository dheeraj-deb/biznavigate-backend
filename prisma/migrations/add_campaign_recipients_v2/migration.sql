-- Migration: Campaign recipients, campaign analytics, and WhatsApp opt-outs
-- campaign_id / business_id / contact_id are MongoDB ObjectId strings (VARCHAR 24)

-- ─── Enum type (idempotent) ───────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE recipient_status AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED',
    'SKIPPED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── Campaign recipients ──────────────────────────────────────────────────────

-- Drop old UUID-based table if it exists and recreate for WhatsApp campaigns
DROP TABLE IF EXISTS campaign_recipients CASCADE;

CREATE TABLE campaign_recipients (
  id                    BIGSERIAL PRIMARY KEY,
  campaign_id           VARCHAR(24) NOT NULL,
  business_id           VARCHAR(24) NOT NULL,
  phone_number          VARCHAR(20) NOT NULL,
  contact_id            VARCHAR(24),                    -- nullable MongoDB contact ref

  -- Resolved variable values snapshot at send time e.g. {"1":"Dheeraj","2":"ORD-123"}
  resolved_variables    JSONB DEFAULT '{}',

  status                VARCHAR(20) DEFAULT 'PENDING',

  -- Meta message ID after successful send
  whatsapp_message_id   VARCHAR(100),

  -- Timestamps from Meta webhooks
  sent_at               TIMESTAMPTZ,
  delivered_at          TIMESTAMPTZ,
  read_at               TIMESTAMPTZ,
  failed_at             TIMESTAMPTZ,

  -- Error details if failed
  error_code            VARCHAR(50),
  error_message         TEXT,

  -- Retry tracking
  retry_count           SMALLINT DEFAULT 0,
  next_retry_at         TIMESTAMPTZ,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign
  ON campaign_recipients(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_business
  ON campaign_recipients(business_id);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status
  ON campaign_recipients(campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_wa_msg_id
  ON campaign_recipients(whatsapp_message_id)
  WHERE whatsapp_message_id IS NOT NULL;

-- Partial index — only unprocessed rows, keeps worker queries fast
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_pending
  ON campaign_recipients(campaign_id, created_at)
  WHERE status = 'PENDING';

-- Partial index — only rows eligible for retry
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_retry
  ON campaign_recipients(next_retry_at)
  WHERE status = 'FAILED' AND retry_count < 3;

-- ─── Campaign analytics ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS campaign_analytics (
  id              BIGSERIAL PRIMARY KEY,
  campaign_id     VARCHAR(24) UNIQUE NOT NULL,
  business_id     VARCHAR(24) NOT NULL,

  total           INT DEFAULT 0,
  pending         INT DEFAULT 0,
  sent            INT DEFAULT 0,
  delivered       INT DEFAULT 0,
  read            INT DEFAULT 0,
  failed          INT DEFAULT 0,
  skipped         INT DEFAULT 0,

  -- Rates computed and updated periodically
  delivery_rate   NUMERIC(5,2) DEFAULT 0,   -- delivered / sent * 100
  read_rate       NUMERIC(5,2) DEFAULT 0,   -- read / delivered * 100

  estimated_cost  NUMERIC(10,4) DEFAULT 0,

  last_synced_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_business
  ON campaign_analytics(business_id);

-- ─── WhatsApp opt-outs ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS whatsapp_optouts (
  id            BIGSERIAL PRIMARY KEY,
  business_id   VARCHAR(24) NOT NULL,
  phone_number  VARCHAR(20) NOT NULL,
  opted_out_at  TIMESTAMPTZ DEFAULT NOW(),
  reason        VARCHAR(100),           -- 'user_request' | 'meta_block' | 'manual'
  UNIQUE(business_id, phone_number)
);

CREATE INDEX IF NOT EXISTS idx_optouts_lookup
  ON whatsapp_optouts(business_id, phone_number);
