-- Appointment visits are capacity-based for showroom/site visits.
-- A salesperson can handle multiple visitors at the same requested time; the
-- application enforces a fixed business-level cap before inserting a visit.

ALTER TABLE appointment_sales_visits
  DROP CONSTRAINT IF EXISTS appointment_visits_staff_no_overlap_excl;

DROP INDEX IF EXISTS appointment_visits_staff_no_overlap;

CREATE INDEX IF NOT EXISTS idx_appointment_visits_business_start_active
  ON appointment_sales_visits(business_id, scheduled_start)
  WHERE status IN ('scheduled', 'confirmed', 'arrived');
