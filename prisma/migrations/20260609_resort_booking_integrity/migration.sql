-- Resort booking integrity guardrails.
-- NOT VALID avoids breaking deployment if old rows need cleanup; PostgreSQL
-- still enforces these constraints for new inserts and updates.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_item_availability_slots_nonnegative'
  ) THEN
    ALTER TABLE item_availability
      ADD CONSTRAINT chk_item_availability_slots_nonnegative
      CHECK (total_slots >= 0 AND booked_slots >= 0) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_item_availability_booked_lte_total'
  ) THEN
    ALTER TABLE item_availability
      ADD CONSTRAINT chk_item_availability_booked_lte_total
      CHECK (booked_slots <= total_slots) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_hospitality_bookings_date_range'
  ) THEN
    ALTER TABLE hospitality_bookings
      ADD CONSTRAINT chk_hospitality_bookings_date_range
      CHECK (check_out > check_in) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_hospitality_bookings_guests_positive'
  ) THEN
    ALTER TABLE hospitality_bookings
      ADD CONSTRAINT chk_hospitality_bookings_guests_positive
      CHECK (guests > 0) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_hospitality_booking_items_positive'
  ) THEN
    ALTER TABLE hospitality_booking_items
      ADD CONSTRAINT chk_hospitality_booking_items_positive
      CHECK (quantity > 0 AND nights > 0) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'uq_hospitality_bookings_business_booking_number'
  ) AND NOT EXISTS (
    SELECT 1
    FROM hospitality_bookings
    WHERE booking_number IS NOT NULL
    GROUP BY business_id, booking_number
    HAVING COUNT(*) > 1
  ) THEN
    CREATE UNIQUE INDEX uq_hospitality_bookings_business_booking_number
      ON hospitality_bookings (business_id, booking_number)
      WHERE booking_number IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_hospitality_bookings_active_dates
  ON hospitality_bookings (business_id, status, check_in, check_out)
  WHERE status NOT IN ('cancelled', 'checked_out', 'completed', 'no_show');

CREATE INDEX IF NOT EXISTS idx_orders_hospitality_hold_expiry
  ON orders (business_id, payment_expires_at)
  WHERE order_type = 'accommodation'
    AND status = 'pending'
    AND payment_status IN ('pending', 'unpaid');
