-- ============================================================
-- Europe Trip Tracker — Supabase Schema
-- Run this in Supabase SQL Editor to set up the database
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE profiles (
  id          uuid        REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name        text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now()
);

-- ── trips ─────────────────────────────────────────────────────
CREATE TABLE trips (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title       text        NOT NULL,
  emoji       text        DEFAULT '✈️',
  start_date  date,
  end_date    date,
  archived    boolean     DEFAULT false,
  trip_notes  text        DEFAULT '',
  crew        jsonb       DEFAULT '[]',
  created_at  timestamptz DEFAULT now()
);

-- ── cities ────────────────────────────────────────────────────
CREATE TABLE cities (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     uuid        REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  name        text        NOT NULL,
  country     text,
  flag_emoji  text,
  start_date  date,
  end_date    date,
  color       text,
  lat         double precision,
  lng         double precision,
  city_notes  text        DEFAULT '',
  sort_order  int         DEFAULT 0
);

-- ── checklist_categories ──────────────────────────────────────
CREATE TABLE checklist_categories (
  id            uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id       uuid  REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
  name          text,
  emoji         text,
  category_key  text,
  sort_order    int   DEFAULT 0
);

-- ── checklist_items ───────────────────────────────────────────
CREATE TABLE checklist_items (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  uuid        REFERENCES checklist_categories(id) ON DELETE CASCADE NOT NULL,
  city_id      uuid        REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
  trip_id      uuid        REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  name         text,
  notes        text,
  address      text,
  has_location boolean     DEFAULT false,
  completed    boolean     DEFAULT false,
  lat          double precision,
  lng          double precision,
  sort_order   int         DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

-- ── schedule_days ─────────────────────────────────────────────
CREATE TABLE schedule_days (
  id          uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id     uuid  REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
  trip_id     uuid  REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  date        date,
  day_number  int,
  day_label   text,
  title       text
);

-- ── schedule_day_items ────────────────────────────────────────
CREATE TABLE schedule_day_items (
  id                 uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id             uuid    REFERENCES schedule_days(id) ON DELETE CASCADE NOT NULL,
  checklist_item_id  uuid    REFERENCES checklist_items(id) ON DELETE SET NULL,
  name               text,
  time               text,
  notes              text,
  done               boolean DEFAULT false,
  sort_order         int     DEFAULT 0
);

-- ── bookings ──────────────────────────────────────────────────
-- Stores both bookings/tickets and transport items (is_transport flag)
CREATE TABLE bookings (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       uuid        REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  name          text,
  notes         text,
  is_urgent     boolean     DEFAULT false,
  completed     boolean     DEFAULT false,
  is_transport  boolean     DEFAULT false,
  sort_order    int         DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities               ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_days        ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_day_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings             ENABLE ROW LEVEL SECURITY;

-- ── profiles policies ────────────────────────────────────────
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ── trips policies ───────────────────────────────────────────
CREATE POLICY "trips_select" ON trips
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "trips_insert" ON trips
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "trips_update" ON trips
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "trips_delete" ON trips
  FOR DELETE USING (user_id = auth.uid());

-- ── cities policies ──────────────────────────────────────────
CREATE POLICY "cities_select" ON cities
  FOR SELECT USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "cities_insert" ON cities
  FOR INSERT WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "cities_update" ON cities
  FOR UPDATE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "cities_delete" ON cities
  FOR DELETE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- ── checklist_categories policies ────────────────────────────
CREATE POLICY "categories_select" ON checklist_categories
  FOR SELECT USING (
    city_id IN (SELECT id FROM cities WHERE trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))
  );

CREATE POLICY "categories_insert" ON checklist_categories
  FOR INSERT WITH CHECK (
    city_id IN (SELECT id FROM cities WHERE trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))
  );

CREATE POLICY "categories_update" ON checklist_categories
  FOR UPDATE USING (
    city_id IN (SELECT id FROM cities WHERE trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))
  );

CREATE POLICY "categories_delete" ON checklist_categories
  FOR DELETE USING (
    city_id IN (SELECT id FROM cities WHERE trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))
  );

-- ── checklist_items policies ─────────────────────────────────
CREATE POLICY "items_select" ON checklist_items
  FOR SELECT USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "items_insert" ON checklist_items
  FOR INSERT WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "items_update" ON checklist_items
  FOR UPDATE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "items_delete" ON checklist_items
  FOR DELETE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- ── schedule_days policies ────────────────────────────────────
CREATE POLICY "schedule_days_select" ON schedule_days
  FOR SELECT USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "schedule_days_insert" ON schedule_days
  FOR INSERT WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "schedule_days_update" ON schedule_days
  FOR UPDATE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "schedule_days_delete" ON schedule_days
  FOR DELETE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- ── schedule_day_items policies ───────────────────────────────
CREATE POLICY "schedule_items_select" ON schedule_day_items
  FOR SELECT USING (
    day_id IN (
      SELECT id FROM schedule_days
      WHERE trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "schedule_items_insert" ON schedule_day_items
  FOR INSERT WITH CHECK (
    day_id IN (
      SELECT id FROM schedule_days
      WHERE trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "schedule_items_update" ON schedule_day_items
  FOR UPDATE USING (
    day_id IN (
      SELECT id FROM schedule_days
      WHERE trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "schedule_items_delete" ON schedule_day_items
  FOR DELETE USING (
    day_id IN (
      SELECT id FROM schedule_days
      WHERE trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
    )
  );

-- ── bookings policies ─────────────────────────────────────────
CREATE POLICY "bookings_select" ON bookings
  FOR SELECT USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "bookings_insert" ON bookings
  FOR INSERT WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "bookings_update" ON bookings
  FOR UPDATE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "bookings_delete" ON bookings
  FOR DELETE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
