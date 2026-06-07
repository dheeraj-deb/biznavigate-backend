-- Staff-controlled working windows for appointment-sales businesses.
-- working windows create bookable time; lunch/break/blocked windows remove time.

ALTER TABLE appointment_sales_staff_availability
  ADD COLUMN IF NOT EXISTS window_type varchar(30) NOT NULL DEFAULT 'working',
  ADD COLUMN IF NOT EXISTS label varchar(80) NULL;

CREATE INDEX IF NOT EXISTS idx_appointment_staff_availability_type
  ON appointment_sales_staff_availability(business_id, sales_staff_id, day_of_week, window_type, is_active);
