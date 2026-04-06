-- Add home country and manually-visited countries to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS countries_visited TEXT[] DEFAULT '{}';
