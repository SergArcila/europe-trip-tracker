-- ============================================================
-- Create test@trips.com and duplicate Sergio's data
-- ============================================================
DO $$
DECLARE
  v_src_user_id uuid := '2cf4ef27-89b4-421d-9cca-d8beb7c5a626';
  v_new_user_id uuid := 'ae570000-0000-0000-0000-000000000001';
  v_new_email   text := 'test@trips.com';
  v_new_pass    text := 'Trips2025!';
BEGIN

  -- ── Auth user ────────────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    phone, email_change, email_change_token_new,
    recovery_token, email_change_token_current,
    confirmation_token, reauthentication_token
  ) VALUES (
    v_new_user_id,
    '00000000-0000-0000-0000-000000000000',
    v_new_email,
    crypt(v_new_pass, gen_salt('bf')),
    now(), now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Test User"}',
    false, 'authenticated', 'authenticated',
    NULL, '', '', '', '', '', ''
  ) ON CONFLICT (id) DO NOTHING;

  -- ── Auth identity ─────────────────────────────────────────
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    v_new_user_id,
    v_new_email,
    jsonb_build_object('sub', v_new_user_id::text, 'email', v_new_email),
    'email',
    now(), now(), now()
  ) ON CONFLICT DO NOTHING;

  -- ── Profile ───────────────────────────────────────────────
  INSERT INTO profiles (id, name)
  VALUES (v_new_user_id, 'Test User')
  ON CONFLICT (id) DO NOTHING;

  -- ── Build ID maps ─────────────────────────────────────────
  CREATE TEMP TABLE _trip_map ON COMMIT DROP AS
    SELECT id AS old_id, gen_random_uuid() AS new_id
    FROM trips WHERE user_id = v_src_user_id;

  CREATE TEMP TABLE _city_map ON COMMIT DROP AS
    SELECT id AS old_id, gen_random_uuid() AS new_id
    FROM cities WHERE trip_id IN (SELECT old_id FROM _trip_map);

  CREATE TEMP TABLE _cat_map ON COMMIT DROP AS
    SELECT id AS old_id, gen_random_uuid() AS new_id
    FROM checklist_categories WHERE city_id IN (SELECT old_id FROM _city_map);

  CREATE TEMP TABLE _item_map ON COMMIT DROP AS
    SELECT id AS old_id, gen_random_uuid() AS new_id
    FROM checklist_items WHERE trip_id IN (SELECT old_id FROM _trip_map);

  CREATE TEMP TABLE _day_map ON COMMIT DROP AS
    SELECT id AS old_id, gen_random_uuid() AS new_id
    FROM schedule_days WHERE trip_id IN (SELECT old_id FROM _trip_map);

  -- ── trips ─────────────────────────────────────────────────
  INSERT INTO trips (id, user_id, title, emoji, start_date, end_date, archived, trip_notes, crew, created_at)
  SELECT m.new_id, v_new_user_id, t.title, t.emoji, t.start_date, t.end_date, t.archived, t.trip_notes, t.crew, t.created_at
  FROM trips t JOIN _trip_map m ON t.id = m.old_id;

  -- ── cities ────────────────────────────────────────────────
  INSERT INTO cities (id, trip_id, name, country, flag_emoji, start_date, end_date, color, lat, lng, city_notes, sort_order)
  SELECT cm.new_id, tm.new_id, c.name, c.country, c.flag_emoji, c.start_date, c.end_date, c.color, c.lat, c.lng, c.city_notes, c.sort_order
  FROM cities c
  JOIN _city_map cm ON c.id = cm.old_id
  JOIN _trip_map tm ON c.trip_id = tm.old_id;

  -- ── checklist_categories ──────────────────────────────────
  INSERT INTO checklist_categories (id, city_id, name, emoji, category_key, sort_order)
  SELECT catm.new_id, cm.new_id, cat.name, cat.emoji, cat.category_key, cat.sort_order
  FROM checklist_categories cat
  JOIN _cat_map catm ON cat.id = catm.old_id
  JOIN _city_map cm  ON cat.city_id = cm.old_id;

  -- ── checklist_items ───────────────────────────────────────
  INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, address, has_location, completed, lat, lng, sort_order, created_at)
  SELECT im.new_id, catm.new_id, cm.new_id, tm.new_id,
         i.name, i.notes, i.address, i.has_location, i.completed, i.lat, i.lng, i.sort_order, i.created_at
  FROM checklist_items i
  JOIN _item_map im   ON i.id = im.old_id
  JOIN _cat_map  catm ON i.category_id = catm.old_id
  JOIN _city_map cm   ON i.city_id = cm.old_id
  JOIN _trip_map tm   ON i.trip_id = tm.old_id;

  -- ── schedule_days ─────────────────────────────────────────
  INSERT INTO schedule_days (id, city_id, trip_id, date, day_number, day_label, title)
  SELECT dm.new_id, cm.new_id, tm.new_id, sd.date, sd.day_number, sd.day_label, sd.title
  FROM schedule_days sd
  JOIN _day_map dm  ON sd.id = dm.old_id
  JOIN _city_map cm ON sd.city_id = cm.old_id
  JOIN _trip_map tm ON sd.trip_id = tm.old_id;

  -- ── schedule_day_items ────────────────────────────────────
  INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, notes, done, sort_order)
  SELECT gen_random_uuid(), dm.new_id,
         CASE WHEN sdi.checklist_item_id IS NOT NULL THEN im.new_id ELSE NULL END,
         sdi.name, sdi.time, sdi.notes, sdi.done, sdi.sort_order
  FROM schedule_day_items sdi
  JOIN _day_map dm ON sdi.day_id = dm.old_id
  LEFT JOIN _item_map im ON sdi.checklist_item_id = im.old_id;

  -- ── bookings (incl. transport) ────────────────────────────
  INSERT INTO bookings (id, trip_id, name, notes, is_urgent, completed, is_transport, sort_order, created_at)
  SELECT gen_random_uuid(), tm.new_id, b.name, b.notes, b.is_urgent, b.completed, b.is_transport, b.sort_order, b.created_at
  FROM bookings b
  JOIN _trip_map tm ON b.trip_id = tm.old_id;

END $$;
