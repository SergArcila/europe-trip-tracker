-- ─────────────────────────────────────────────────────────────
-- Social features: usernames, follow system, activity feed
-- Run this in the Supabase SQL editor
-- ─────────────────────────────────────────────────────────────

-- 1. Add username + bio + is_public to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Case-insensitive unique username index
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx
  ON profiles (lower(username))
  WHERE username IS NOT NULL;

-- 2. Friendships table (Twitter-style one-way follow)
CREATE TABLE IF NOT EXISTS friendships (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id <> following_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friendships_select" ON friendships
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "friendships_insert" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "friendships_delete" ON friendships
  FOR DELETE USING (auth.uid() = follower_id);

-- 3. Feed events table
CREATE TABLE IF NOT EXISTS feed_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type  text        NOT NULL,  -- 'trip_created' | 'trip_completed' | 'country_added'
  trip_id     uuid        REFERENCES trips(id) ON DELETE SET NULL,
  payload     jsonb       DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed_events_select" ON feed_events
  FOR SELECT USING (
    user_id = auth.uid()
    OR user_id IN (
      SELECT following_id FROM friendships WHERE follower_id = auth.uid()
    )
  );

CREATE POLICY "feed_events_insert" ON feed_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Broaden profiles RLS to allow reading public profiles
--    (needed so /u/:username works without auth)
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR is_public = true
    OR id IN (SELECT following_id FROM friendships WHERE follower_id = auth.uid())
    OR id IN (SELECT follower_id  FROM friendships WHERE following_id = auth.uid())
  );

-- 5. Allow public read of trips + cities for public profiles
--    (so PassportView can load data on public profile pages)
CREATE POLICY "trips_public_profile" ON trips
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE is_public = true)
  );
