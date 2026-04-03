-- ─────────────────────────────────────────────────────────────
-- Avatar Storage setup
-- Run this in Supabase SQL Editor AFTER creating the storage
-- bucket named "avatars" (public bucket) in the Supabase dashboard
-- Storage > New bucket > name: avatars > Public: true
-- ─────────────────────────────────────────────────────────────

-- Add display_name column as alias (profiles already has 'name')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;

-- Storage RLS: users can upload/update/delete their own avatar
CREATE POLICY "avatar_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatar_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatar_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can read avatars (public bucket)
CREATE POLICY "avatar_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
