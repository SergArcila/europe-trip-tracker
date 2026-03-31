-- ============================================================
-- Add trip sharing support
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add share_token column to trips
ALTER TABLE trips ADD COLUMN IF NOT EXISTS share_token text;
CREATE UNIQUE INDEX IF NOT EXISTS trips_share_token_idx
  ON trips(share_token) WHERE share_token IS NOT NULL;

-- ── Public read policies for shared trips ─────────────────────
-- A trip is "shared" when share_token is not null.
-- The share URL contains the token so only someone with the link can find it.

CREATE POLICY "trips_public_share" ON trips
  FOR SELECT USING (share_token IS NOT NULL);

CREATE POLICY "cities_public_share" ON cities
  FOR SELECT USING (
    trip_id IN (SELECT id FROM trips WHERE share_token IS NOT NULL)
  );

CREATE POLICY "categories_public_share" ON checklist_categories
  FOR SELECT USING (
    city_id IN (
      SELECT id FROM cities
      WHERE trip_id IN (SELECT id FROM trips WHERE share_token IS NOT NULL)
    )
  );

CREATE POLICY "items_public_share" ON checklist_items
  FOR SELECT USING (
    trip_id IN (SELECT id FROM trips WHERE share_token IS NOT NULL)
  );

CREATE POLICY "schedule_days_public_share" ON schedule_days
  FOR SELECT USING (
    trip_id IN (SELECT id FROM trips WHERE share_token IS NOT NULL)
  );

CREATE POLICY "schedule_items_public_share" ON schedule_day_items
  FOR SELECT USING (
    day_id IN (
      SELECT id FROM schedule_days
      WHERE trip_id IN (SELECT id FROM trips WHERE share_token IS NOT NULL)
    )
  );

CREATE POLICY "bookings_public_share" ON bookings
  FOR SELECT USING (
    trip_id IN (SELECT id FROM trips WHERE share_token IS NOT NULL)
  );
