-- Trip Planning Canvas
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS trip_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Untitled Plan',
  emoji       TEXT NOT NULL DEFAULT '🗺️',
  blocks      JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS trip_plans_user_id_idx ON trip_plans(user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_trip_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trip_plans_updated_at ON trip_plans;
CREATE TRIGGER trip_plans_updated_at
  BEFORE UPDATE ON trip_plans
  FOR EACH ROW EXECUTE FUNCTION update_trip_plans_updated_at();

-- RLS
ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own plans" ON trip_plans;
CREATE POLICY "Users can manage their own plans" ON trip_plans
  FOR ALL USING (auth.uid() = user_id);
