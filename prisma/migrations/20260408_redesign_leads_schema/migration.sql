-- ============================================================
-- LEAD SCHEMA REDESIGN
-- Replace 13 lead tables with 3 lean, fast, concurrent-safe tables.
-- MongoDB (conversations + messages) is source of truth for chat.
-- PostgreSQL handles business state, analytics, dashboard queries.
-- ============================================================

-- ============================================================
-- STEP 1: Drop old lead-related tables (dependency order)
-- ============================================================

-- Tables that reference lead_messages / lead_conversations first
DROP TABLE IF EXISTS lead_messages           CASCADE;
DROP TABLE IF EXISTS lead_conversations      CASCADE;

-- Tables that reference leads (dependent children)
DROP TABLE IF EXISTS lead_tag_assignments    CASCADE;
DROP TABLE IF EXISTS lead_notes              CASCADE;
DROP TABLE IF EXISTS lead_status_history     CASCADE;
DROP TABLE IF EXISTS lead_activities         CASCADE;
DROP TABLE IF EXISTS lead_score_history      CASCADE;
DROP TABLE IF EXISTS lead_duplicates         CASCADE;
DROP TABLE IF EXISTS lead_followups          CASCADE;   -- old 14-column version

-- Standalone old tables
DROP TABLE IF EXISTS tags                    CASCADE;
DROP TABLE IF EXISTS lead_scoring_rules      CASCADE;
DROP TABLE IF EXISTS tasks                   CASCADE;

-- ============================================================
-- STEP 2: Migrate leads table in-place (preserves lead_id FK refs)
-- ============================================================

-- 2a. Drop old columns that no longer exist in the new design
--     (includes columns added by earlier ad-hoc migrations)
ALTER TABLE leads
  DROP COLUMN IF EXISTS source_reference_id,
  DROP COLUMN IF EXISTS post_id,
  DROP COLUMN IF EXISTS page_id,
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name,
  DROP COLUMN IF EXISTS alternate_phone,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS state,
  DROP COLUMN IF EXISTS country,
  DROP COLUMN IF EXISTS pincode,
  DROP COLUMN IF EXISTS intent_type,
  DROP COLUMN IF EXISTS lead_quality,
  DROP COLUMN IF EXISTS lead_score,
  DROP COLUMN IF EXISTS assigned_agent_id,
  DROP COLUMN IF EXISTS assigned_at,
  DROP COLUMN IF EXISTS assigned_by,
  DROP COLUMN IF EXISTS first_contact_at,
  DROP COLUMN IF EXISTS last_contact_at,
  DROP COLUMN IF EXISTS last_activity_at,
  DROP COLUMN IF EXISTS next_followup_at,
  DROP COLUMN IF EXISTS followup_count,
  DROP COLUMN IF EXISTS is_converted,
  DROP COLUMN IF EXISTS converted_at,
  DROP COLUMN IF EXISTS conversion_value,
  DROP COLUMN IF EXISTS interested_products,
  DROP COLUMN IF EXISTS interested_courses,
  DROP COLUMN IF EXISTS tags,           -- was JSONB, will be recreated as TEXT[]
  DROP COLUMN IF EXISTS custom_fields,
  DROP COLUMN IF EXISTS extracted_entities,
  DROP COLUMN IF EXISTS sentiment_score,
  DROP COLUMN IF EXISTS preferred_contact_method,
  DROP COLUMN IF EXISTS preferred_contact_time,
  DROP COLUMN IF EXISTS language_preference,
  DROP COLUMN IF EXISTS utm_source,
  DROP COLUMN IF EXISTS utm_medium,
  DROP COLUMN IF EXISTS utm_campaign,
  DROP COLUMN IF EXISTS referral_source,
  DROP COLUMN IF EXISTS lost_at,
  DROP COLUMN IF EXISTS invalid_reason,
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS is_duplicate,
  DROP COLUMN IF EXISTS duplicate_of_lead_id,
  DROP COLUMN IF EXISTS created_by,
  DROP COLUMN IF EXISTS updated_by,
  DROP COLUMN IF EXISTS deleted_by,
  DROP COLUMN IF EXISTS onboarding_completed,
  -- columns added by earlier ad-hoc SQL migrations
  DROP COLUMN IF EXISTS delivery_address,
  DROP COLUMN IF EXISTS inquiry,
  DROP COLUMN IF EXISTS room_preference,
  DROP COLUMN IF EXISTS check_in_date,
  DROP COLUMN IF EXISTS check_out_date,
  DROP COLUMN IF EXISTS guest_count,
  DROP COLUMN IF EXISTS special_requests,
  DROP COLUMN IF EXISTS quote_sent,
  DROP COLUMN IF EXISTS booking_id,
  DROP COLUMN IF EXISTS staff_notes,
  DROP COLUMN IF EXISTS estimated_value;

-- 2b. Alter column types to match new schema
ALTER TABLE leads
  ALTER COLUMN source    TYPE VARCHAR(20)  USING LEFT(source, 20),
  ALTER COLUMN status    TYPE VARCHAR(20)  USING LEFT(status, 20),
  ALTER COLUMN lost_reason TYPE VARCHAR(50) USING LEFT(COALESCE(lost_reason, ''), 50);

-- 2c. Add new columns
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS name            VARCHAR(200),
  ADD COLUMN IF NOT EXISTS channel         VARCHAR(20)  NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS platform_id     VARCHAR(255),
  ADD COLUMN IF NOT EXISTS context         JSONB,
  ADD COLUMN IF NOT EXISTS quoted_amount   DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS quoted_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS converted_value DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS converted_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tags            TEXT[]       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assigned_to     UUID,
  ADD COLUMN IF NOT EXISTS followup_at     TIMESTAMPTZ;

-- 2d. Migrate data: combine first_name + last_name → name (already dropped, skip)
--     Migrate platform_user_id → platform_id (rename)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='leads' AND column_name='platform_user_id') THEN
    UPDATE leads SET platform_id = platform_user_id WHERE platform_id IS NULL;
    ALTER TABLE leads DROP COLUMN IF EXISTS platform_user_id;
  END IF;
END $$;

-- 2e. Drop stale indexes
DROP INDEX IF EXISTS idx_leads_business_status;
DROP INDEX IF EXISTS idx_leads_tenant;

-- 2f. Add new indexes
CREATE INDEX IF NOT EXISTS idx_leads_business_status     ON leads (business_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_business_channel    ON leads (business_id, channel, source);
CREATE INDEX IF NOT EXISTS idx_leads_business_created    ON leads (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_business_quoted     ON leads (business_id, quoted_at);
CREATE INDEX IF NOT EXISTS idx_leads_business_followup   ON leads (business_id, assigned_to, followup_at);
CREATE INDEX IF NOT EXISTS idx_leads_phone               ON leads (phone);
CREATE INDEX IF NOT EXISTS idx_leads_platform_id         ON leads (platform_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id           ON leads (tenant_id);

-- GIN index for tag filtering: WHERE 'vip' = ANY(tags)
CREATE INDEX IF NOT EXISTS idx_leads_tags ON leads USING GIN (tags);

-- ============================================================
-- STEP 3: Create lead_events — append-only business milestone log
-- Replaces: lead_activities + lead_status_history + lead_notes + lead_score_history
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_events (
  event_id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID        NOT NULL,
  business_id UUID        NOT NULL,

  -- What happened
  -- "status_changed" | "quoted" | "booked" | "won" | "lost" | "note"
  -- "assigned" | "followup_set" | "demand_miss" | "handoff"
  -- + custom operational types: "ai_result" | "ai_error" | "catalog_order" etc.
  type        VARCHAR(30) NOT NULL,

  -- Who caused it: "ai" | "human" | "system"
  actor       VARCHAR(10) NOT NULL DEFAULT 'system',
  actor_id    UUID,                            -- user_id if human, NULL if ai/system

  -- Type-specific payload (flexible JSON)
  -- status_changed: { from: "new", to: "active" }
  -- quoted:         { amount: 4500, service: "Deluxe AC Room" }
  -- note:           { text: "Called Rahul, agreed to ₹4000" }
  -- demand_miss:    { service_id, service_name, date, guests }
  data        JSONB,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_lead_events_lead FOREIGN KEY (lead_id) REFERENCES leads (lead_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lead_events_lead_created     ON lead_events (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_events_business_type    ON lead_events (business_id, type);
CREATE INDEX IF NOT EXISTS idx_lead_events_business_created ON lead_events (business_id, created_at DESC);

-- ============================================================
-- STEP 4: Create lead_followups — staff to-do list (slim, 9 columns)
-- Replaces: old lead_followups (14 columns) + tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_followups (
  followup_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id      UUID        NOT NULL,
  business_id  UUID        NOT NULL,

  note         TEXT,                           -- "Call Priya — camping May 1, 4 people"
  scheduled_at TIMESTAMPTZ NOT NULL,
  assigned_to  UUID        NOT NULL,

  done         BOOLEAN     NOT NULL DEFAULT FALSE,
  done_at      TIMESTAMPTZ,
  done_note    TEXT,                           -- what happened

  created_by   UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_lead_followups_lead     FOREIGN KEY (lead_id)     REFERENCES leads (lead_id) ON DELETE CASCADE,
  CONSTRAINT fk_lead_followups_assignee FOREIGN KEY (assigned_to) REFERENCES users (user_id),
  CONSTRAINT fk_lead_followups_creator  FOREIGN KEY (created_by)  REFERENCES users (user_id)
);

CREATE INDEX IF NOT EXISTS idx_lead_followups_lead        ON lead_followups (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_followups_staff_queue ON lead_followups (assigned_to, done, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_lead_followups_biz_queue   ON lead_followups (business_id, done, scheduled_at);
