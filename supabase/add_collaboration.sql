-- ─────────────────────────────────────────────────────────────
-- Trip collaboration: members table + RLS + realtime
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. Trip members table
CREATE TABLE IF NOT EXISTS trip_members (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    uuid        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text        NOT NULL DEFAULT 'collaborator',
  joined_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;

-- Members can see the member list of any trip they own or belong to
CREATE POLICY "members_select" ON trip_members
  FOR SELECT USING (
    auth.uid() = user_id
    OR trip_id IN (SELECT id   FROM trips       WHERE user_id = auth.uid())
    OR trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

-- Any authenticated user can join (insert their own record)
CREATE POLICY "members_insert" ON trip_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Members can leave (delete their own record)
CREATE POLICY "members_delete" ON trip_members
  FOR DELETE USING (auth.uid() = user_id);

-- Trip owners can remove members
CREATE POLICY "members_owner_delete" ON trip_members
  FOR DELETE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────
-- 2. Extend RLS on existing tables so members can read + write
-- ─────────────────────────────────────────────────────────────

-- trips: members can SELECT and UPDATE their trips
CREATE POLICY "trips_member_select" ON trips
  FOR SELECT USING (
    id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "trips_member_update" ON trips
  FOR UPDATE USING (
    id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

-- cities: members can SELECT and UPDATE
CREATE POLICY "cities_member_select" ON cities
  FOR SELECT USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

CREATE POLICY "cities_member_update" ON cities
  FOR UPDATE USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

-- checklist_categories: members full access
CREATE POLICY "checklist_categories_member_all" ON checklist_categories
  FOR ALL USING (
    city_id IN (
      SELECT id FROM cities
      WHERE trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
    )
  );

-- checklist_items: members full access
CREATE POLICY "checklist_items_member_all" ON checklist_items
  FOR ALL USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

-- schedule_days: members full access
CREATE POLICY "schedule_days_member_all" ON schedule_days
  FOR ALL USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

-- schedule_day_items: members full access
CREATE POLICY "schedule_day_items_member_all" ON schedule_day_items
  FOR ALL USING (
    day_id IN (
      SELECT id FROM schedule_days
      WHERE trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
    )
  );

-- bookings: members full access
CREATE POLICY "bookings_member_all" ON bookings
  FOR ALL USING (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────
-- 3. Enable Realtime for live collaboration
-- ─────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE checklist_items;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_day_items;
