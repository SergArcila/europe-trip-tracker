-- Add home_city and profile_cities columns to profiles table
-- home_city: { name, lat, lng } — the user's hometown
-- profile_cities: [{ name, country, flag, lat, lng }] — manually added cities outside of trips

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_city JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_cities JSONB DEFAULT '[]';
