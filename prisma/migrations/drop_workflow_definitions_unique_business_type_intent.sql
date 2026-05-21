-- Drop the unique (business_type, intent_name) index on workflow_definitions.
-- The runtime now supports many workflows per (business_type, intent_name) pair
-- (schedule + event triggers can both reuse intent_name='default'), so this
-- index was rejecting legitimate inserts. The non-unique index on intent_name
-- (idx_workflow_definitions_intent) stays in place for query performance.
--
-- Note: Prisma's @@unique created this as a unique INDEX, not a CONSTRAINT, so
-- we drop the index directly. The CONSTRAINT variant below is a no-op safety
-- net in case the constraint form ever existed on some deployment.
DROP INDEX IF EXISTS unique_business_type_intent;
ALTER TABLE workflow_definitions DROP CONSTRAINT IF EXISTS unique_business_type_intent;
