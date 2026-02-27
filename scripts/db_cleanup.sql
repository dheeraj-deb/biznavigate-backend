-- DB Cleanup Script for biznavigate-backend
-- Purpose: resolve index collision and prepare for unique constraint on lead_messages.platform_message_id

BEGIN;

-- 1) Drop conflicting index if it already exists
DROP INDEX IF EXISTS "idx_products_whatsapp_catalog";

-- 2) Prepare for unique constraint on lead_messages.platform_message_id
--    Null-out duplicates while keeping the latest message per platform_message_id
WITH dupes AS (
  SELECT message_id
  FROM (
    SELECT message_id,
           platform_message_id,
           ROW_NUMBER() OVER (
             PARTITION BY platform_message_id
             ORDER BY timestamp DESC, created_at DESC
           ) AS rn
    FROM lead_messages
    WHERE platform_message_id IS NOT NULL
  ) t
  WHERE rn > 1
)
UPDATE lead_messages lm
SET platform_message_id = NULL
WHERE lm.message_id IN (SELECT message_id FROM dupes);

COMMIT;

-- Optional: report remaining duplicates (should be zero)
-- SELECT platform_message_id, COUNT(*) AS cnt
-- FROM lead_messages
-- WHERE platform_message_id IS NOT NULL
-- GROUP BY platform_message_id
-- HAVING COUNT(*) > 1
-- ORDER BY cnt DESC;