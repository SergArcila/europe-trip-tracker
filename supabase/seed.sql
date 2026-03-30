-- ============================================================
-- Europe Trip Tracker — Seed Data (Europe Trip 2026)
-- ============================================================
-- INSTRUCTIONS:
--   1. Create your account in the app first (via /signup)
--   2. Find your User UUID in Supabase Dashboard → Authentication → Users
--   3. Replace 'YOUR_USER_UUID_HERE' below with your actual UUID
--   4. Run this script in Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  -- ── Replace this with your actual user UUID ──────────────
  v_user_id uuid := '2cf4ef27-89b4-421d-9cca-d8beb7c5a626';

  -- ── Trip & City IDs ──────────────────────────────────────
  v_trip_id     uuid := 'a1000000-0000-0000-0000-000000000001';
  v_madrid_id   uuid := 'a2000000-0000-0000-0000-000000000001';
  v_bcn_id      uuid := 'a2000000-0000-0000-0000-000000000002';
  v_nice_id     uuid := 'a2000000-0000-0000-0000-000000000003';
  v_ams_id      uuid := 'a2000000-0000-0000-0000-000000000004';
  v_mun_id      uuid := 'a2000000-0000-0000-0000-000000000005';
  v_ber_id      uuid := 'a2000000-0000-0000-0000-000000000006';

  -- ── Madrid category IDs ──────────────────────────────────
  v_mad_pack_cat  uuid := 'a3000001-0000-0000-0000-000000000001';
  v_mad_food_cat  uuid := 'a3000001-0000-0000-0000-000000000002';
  v_mad_sight_cat uuid := 'a3000001-0000-0000-0000-000000000003';
  v_mad_night_cat uuid := 'a3000001-0000-0000-0000-000000000004';

  -- ── Barcelona category IDs ───────────────────────────────
  v_bcn_pack_cat  uuid := 'a3000002-0000-0000-0000-000000000001';
  v_bcn_food_cat  uuid := 'a3000002-0000-0000-0000-000000000002';
  v_bcn_sight_cat uuid := 'a3000002-0000-0000-0000-000000000003';
  v_bcn_night_cat uuid := 'a3000002-0000-0000-0000-000000000004';

  -- ── Nice category IDs ────────────────────────────────────
  v_nice_pack_cat  uuid := 'a3000003-0000-0000-0000-000000000001';
  v_nice_food_cat  uuid := 'a3000003-0000-0000-0000-000000000002';
  v_nice_sight_cat uuid := 'a3000003-0000-0000-0000-000000000003';
  v_nice_mon_cat   uuid := 'a3000003-0000-0000-0000-000000000004';
  v_nice_night_cat uuid := 'a3000003-0000-0000-0000-000000000005';

  -- ── Amsterdam category IDs ───────────────────────────────
  v_ams_pack_cat  uuid := 'a3000004-0000-0000-0000-000000000001';
  v_ams_food_cat  uuid := 'a3000004-0000-0000-0000-000000000002';
  v_ams_sight_cat uuid := 'a3000004-0000-0000-0000-000000000003';
  v_ams_night_cat uuid := 'a3000004-0000-0000-0000-000000000004';

  -- ── Munich category IDs ──────────────────────────────────
  v_mun_pack_cat  uuid := 'a3000005-0000-0000-0000-000000000001';
  v_mun_food_cat  uuid := 'a3000005-0000-0000-0000-000000000002';
  v_mun_sight_cat uuid := 'a3000005-0000-0000-0000-000000000003';
  v_mun_night_cat uuid := 'a3000005-0000-0000-0000-000000000004';

  -- ── Berlin category IDs ──────────────────────────────────
  v_ber_pack_cat  uuid := 'a3000006-0000-0000-0000-000000000001';
  v_ber_food_cat  uuid := 'a3000006-0000-0000-0000-000000000002';
  v_ber_sight_cat uuid := 'a3000006-0000-0000-0000-000000000003';
  v_ber_night_cat uuid := 'a3000006-0000-0000-0000-000000000004';

  -- ── Madrid item IDs (only ones referenced in schedule) ───
  v_m_s1  uuid := 'a4010300-0000-0000-0000-000000000001'; -- Parque del Retiro
  v_m_s2  uuid := 'a4010300-0000-0000-0000-000000000002'; -- Royal Palace
  v_m_s3  uuid := 'a4010300-0000-0000-0000-000000000003'; -- Plaza Mayor
  v_m_s4  uuid := 'a4010300-0000-0000-0000-000000000004'; -- Prado Museum
  v_m_s6  uuid := 'a4010300-0000-0000-0000-000000000006'; -- Gran Via
  v_m_s7  uuid := 'a4010300-0000-0000-0000-000000000007'; -- Bernabeu Tour
  v_m_f6  uuid := 'a4010200-0000-0000-0000-000000000006'; -- Mercado de San Miguel
  v_m_n1  uuid := 'a4010400-0000-0000-0000-000000000001'; -- La Capital
  v_m_n3  uuid := 'a4010400-0000-0000-0000-000000000003'; -- Teatro Joy Eslava
  v_m_n5  uuid := 'a4010400-0000-0000-0000-000000000005'; -- Malasana bar crawl

  -- ── Barcelona item IDs ───────────────────────────────────
  v_b_s1  uuid := 'a4020300-0000-0000-0000-000000000001'; -- Sagrada Familia
  v_b_s2  uuid := 'a4020300-0000-0000-0000-000000000002'; -- Park Guell
  v_b_s3  uuid := 'a4020300-0000-0000-0000-000000000003'; -- Gothic Quarter
  v_b_s4  uuid := 'a4020300-0000-0000-0000-000000000004'; -- Casa Batllo
  v_b_s7  uuid := 'a4020300-0000-0000-0000-000000000007'; -- Barceloneta Beach
  v_b_s8  uuid := 'a4020300-0000-0000-0000-000000000008'; -- Camp Nou Tour
  v_b_f6  uuid := 'a4020200-0000-0000-0000-000000000006'; -- Boqueria
  v_b_n1  uuid := 'a4020400-0000-0000-0000-000000000001'; -- Opium
  v_b_n3  uuid := 'a4020400-0000-0000-0000-000000000003'; -- Razzmatazz

  -- ── Nice item IDs ────────────────────────────────────────
  v_n_s1  uuid := 'a4030300-0000-0000-0000-000000000001'; -- Promenade
  v_n_s2  uuid := 'a4030300-0000-0000-0000-000000000002'; -- Vieux-Nice
  v_n_s3  uuid := 'a4030300-0000-0000-0000-000000000003'; -- Castle Hill
  v_n_s4  uuid := 'a4030300-0000-0000-0000-000000000004'; -- Cours Saleya
  v_n_m1  uuid := 'a4030400-0000-0000-0000-000000000001'; -- Casino Monte-Carlo
  v_n_m2  uuid := 'a4030400-0000-0000-0000-000000000002'; -- Prince's Palace
  v_n_m3  uuid := 'a4030400-0000-0000-0000-000000000003'; -- Port Hercule
  v_n_n2  uuid := 'a4030500-0000-0000-0000-000000000002'; -- Wayne's Bar

  -- ── Amsterdam item IDs ───────────────────────────────────
  v_a_s1  uuid := 'a4040300-0000-0000-0000-000000000001'; -- Rijksmuseum
  v_a_s2  uuid := 'a4040300-0000-0000-0000-000000000002'; -- Anne Frank House
  v_a_s3  uuid := 'a4040300-0000-0000-0000-000000000003'; -- Van Gogh Museum
  v_a_s4  uuid := 'a4040300-0000-0000-0000-000000000004'; -- Canal bike
  v_a_s5  uuid := 'a4040300-0000-0000-0000-000000000005'; -- Vondelpark
  v_a_n1  uuid := 'a4040400-0000-0000-0000-000000000001'; -- Paradiso
  v_a_n5  uuid := 'a4040400-0000-0000-0000-000000000005'; -- Leidseplein
  v_a_n6  uuid := 'a4040400-0000-0000-0000-000000000006'; -- Rembrandtplein
  v_a_n7  uuid := 'a4040400-0000-0000-0000-000000000007'; -- De Pijp

  -- ── Munich item IDs ──────────────────────────────────────
  v_mu_s1 uuid := 'a4050300-0000-0000-0000-000000000001'; -- Marienplatz
  v_mu_s2 uuid := 'a4050300-0000-0000-0000-000000000002'; -- English Garden
  v_mu_s3 uuid := 'a4050300-0000-0000-0000-000000000003'; -- Neuschwanstein
  v_mu_s4 uuid := 'a4050300-0000-0000-0000-000000000004'; -- Marienbrucke
  v_mu_s5 uuid := 'a4050300-0000-0000-0000-000000000005'; -- BMW Museum
  v_mu_s7 uuid := 'a4050300-0000-0000-0000-000000000007'; -- Augustiner Beer Garden
  v_mu_f6 uuid := 'a4050200-0000-0000-0000-000000000006'; -- Hofbrauhaus
  v_mu_f7 uuid := 'a4050200-0000-0000-0000-000000000007'; -- Viktualienmarkt
  v_mu_n1 uuid := 'a4050400-0000-0000-0000-000000000001'; -- Harry Klein
  v_mu_n3 uuid := 'a4050400-0000-0000-0000-000000000003'; -- Blitz Club

  -- ── Berlin item IDs ──────────────────────────────────────
  v_be_s1 uuid := 'a4060300-0000-0000-0000-000000000001'; -- Brandenburg Gate
  v_be_s2 uuid := 'a4060300-0000-0000-0000-000000000002'; -- Holocaust Memorial
  v_be_s3 uuid := 'a4060300-0000-0000-0000-000000000003'; -- East Side Gallery
  v_be_s4 uuid := 'a4060300-0000-0000-0000-000000000004'; -- Checkpoint Charlie
  v_be_s5 uuid := 'a4060300-0000-0000-0000-000000000005'; -- Museum Island
  v_be_s6 uuid := 'a4060300-0000-0000-0000-000000000006'; -- Reichstag Dome
  v_be_s9 uuid := 'a4060300-0000-0000-0000-000000000009'; -- Mauerpark
  v_be_f1 uuid := 'a4060200-0000-0000-0000-000000000001'; -- Currywurst
  v_be_f6 uuid := 'a4060200-0000-0000-0000-000000000006'; -- Turkish in Kreuzberg
  v_be_f7 uuid := 'a4060200-0000-0000-0000-000000000007'; -- Markthalle Neun
  v_be_n1 uuid := 'a4060400-0000-0000-0000-000000000001'; -- Berghain
  v_be_n2 uuid := 'a4060400-0000-0000-0000-000000000002'; -- Tresor
  v_be_n3 uuid := 'a4060400-0000-0000-0000-000000000003'; -- Watergate

  -- ── Schedule Day IDs ─────────────────────────────────────
  v_mad_d1 uuid := 'a5000001-0000-0000-0000-000000000001';
  v_mad_d2 uuid := 'a5000001-0000-0000-0000-000000000002';
  v_mad_d3 uuid := 'a5000001-0000-0000-0000-000000000003';
  v_bcn_d1 uuid := 'a5000002-0000-0000-0000-000000000001';
  v_bcn_d2 uuid := 'a5000002-0000-0000-0000-000000000002';
  v_nice_d1 uuid := 'a5000003-0000-0000-0000-000000000001';
  v_nice_d2 uuid := 'a5000003-0000-0000-0000-000000000002';
  v_ams_d1  uuid := 'a5000004-0000-0000-0000-000000000001';
  v_ams_d2  uuid := 'a5000004-0000-0000-0000-000000000002';
  v_mun_d1  uuid := 'a5000005-0000-0000-0000-000000000001';
  v_mun_d2  uuid := 'a5000005-0000-0000-0000-000000000002';
  v_mun_d3  uuid := 'a5000005-0000-0000-0000-000000000003';
  v_ber_d1  uuid := 'a5000006-0000-0000-0000-000000000001';
  v_ber_d2  uuid := 'a5000006-0000-0000-0000-000000000002';
  v_ber_d3  uuid := 'a5000006-0000-0000-0000-000000000003';

BEGIN

-- ============================================================
-- PROFILE (required before trips due to FK constraint)
-- ============================================================
INSERT INTO profiles (id, name)
VALUES (v_user_id, 'Sergio Arcila')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TRIP
-- ============================================================
INSERT INTO trips (id, user_id, title, emoji, start_date, end_date, archived, trip_notes, crew)
VALUES (
  v_trip_id, v_user_id, 'Europe Trip 2026', '🌍',
  '2026-06-13', '2026-06-28', false, '',
  '["Sergio Arcila","Bryan Cadalso","Christan Mira","Jon Pereria","Dillon Cloudfeliter","Shaun Cruz"]'
);

-- ============================================================
-- CITIES
-- ============================================================
INSERT INTO cities (id, trip_id, name, country, flag_emoji, start_date, end_date, color, lat, lng, sort_order)
VALUES
  (v_madrid_id, v_trip_id, 'Madrid',    'Spain',       '🇪🇸', '2026-06-13', '2026-06-15', '#E63946', 40.4168,  -3.7038,  0),
  (v_bcn_id,    v_trip_id, 'Barcelona', 'Spain',       '🇪🇸', '2026-06-16', '2026-06-17', '#2A9D8F', 41.3874,   2.1686,  1),
  (v_nice_id,   v_trip_id, 'Nice',      'France',      '🇫🇷', '2026-06-18', '2026-06-19', '#457B9D', 43.7102,   7.2620,  2),
  (v_ams_id,    v_trip_id, 'Amsterdam', 'Netherlands', '🇳🇱', '2026-06-20', '2026-06-21', '#F4A261', 52.3676,   4.9041,  3),
  (v_mun_id,    v_trip_id, 'Munich',    'Germany',     '🇩🇪', '2026-06-22', '2026-06-24', '#264653', 48.1351,  11.5820,  4),
  (v_ber_id,    v_trip_id, 'Berlin',    'Germany',     '🇩🇪', '2026-06-25', '2026-06-27', '#9B2226', 52.5200,  13.4050,  5);

-- ============================================================
-- CHECKLIST CATEGORIES
-- ============================================================
-- Madrid
INSERT INTO checklist_categories (id, city_id, name, emoji, category_key, sort_order) VALUES
  (v_mad_pack_cat,  v_madrid_id, 'Packing List',    '🧳', 'packing',   0),
  (v_mad_food_cat,  v_madrid_id, 'Must-Try Food',   '🍽️', 'food',      1),
  (v_mad_sight_cat, v_madrid_id, 'Must-See Sights', '👁️', 'sights',    2),
  (v_mad_night_cat, v_madrid_id, 'Nightlife & Clubs','🎉', 'nightlife', 3);

-- Barcelona
INSERT INTO checklist_categories (id, city_id, name, emoji, category_key, sort_order) VALUES
  (v_bcn_pack_cat,  v_bcn_id, 'Packing List',    '🧳', 'packing',   0),
  (v_bcn_food_cat,  v_bcn_id, 'Must-Try Food',   '🍽️', 'food',      1),
  (v_bcn_sight_cat, v_bcn_id, 'Must-See Sights', '👁️', 'sights',    2),
  (v_bcn_night_cat, v_bcn_id, 'Nightlife',       '🎉', 'nightlife', 3);

-- Nice
INSERT INTO checklist_categories (id, city_id, name, emoji, category_key, sort_order) VALUES
  (v_nice_pack_cat,  v_nice_id, 'Packing List',      '🧳',  'packing',   0),
  (v_nice_food_cat,  v_nice_id, 'Must-Try Food',     '🍽️',  'food',      1),
  (v_nice_sight_cat, v_nice_id, 'Must-See Sights',   '👁️',  'sights',    2),
  (v_nice_mon_cat,   v_nice_id, 'Monaco Day Trip',   '🇲🇨', 'monaco',    3),
  (v_nice_night_cat, v_nice_id, 'Nightlife',         '🎉',  'nightlife', 4);

-- Amsterdam
INSERT INTO checklist_categories (id, city_id, name, emoji, category_key, sort_order) VALUES
  (v_ams_pack_cat,  v_ams_id, 'Packing List',    '🧳', 'packing',   0),
  (v_ams_food_cat,  v_ams_id, 'Must-Try Food',   '🍽️', 'food',      1),
  (v_ams_sight_cat, v_ams_id, 'Must-See Sights', '👁️', 'sights',    2),
  (v_ams_night_cat, v_ams_id, 'Nightlife',       '🎉', 'nightlife', 3);

-- Munich
INSERT INTO checklist_categories (id, city_id, name, emoji, category_key, sort_order) VALUES
  (v_mun_pack_cat,  v_mun_id, 'Packing List',    '🧳', 'packing',   0),
  (v_mun_food_cat,  v_mun_id, 'Must-Try Food',   '🍽️', 'food',      1),
  (v_mun_sight_cat, v_mun_id, 'Must-See Sights', '👁️', 'sights',    2),
  (v_mun_night_cat, v_mun_id, 'Nightlife',       '🎉', 'nightlife', 3);

-- Berlin
INSERT INTO checklist_categories (id, city_id, name, emoji, category_key, sort_order) VALUES
  (v_ber_pack_cat,  v_ber_id, 'Packing List',    '🧳', 'packing',   0),
  (v_ber_food_cat,  v_ber_id, 'Must-Try Food',   '🍽️', 'food',      1),
  (v_ber_sight_cat, v_ber_id, 'Must-See Sights', '👁️', 'sights',    2),
  (v_ber_night_cat, v_ber_id, 'Nightlife',       '🎉', 'nightlife', 3);

-- ============================================================
-- CHECKLIST ITEMS — MADRID
-- ============================================================
-- Packing
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_mad_pack_cat, v_madrid_id, v_trip_id, 'Passport & copies',         '',              0),
  (v_mad_pack_cat, v_madrid_id, v_trip_id, 'EU power adapter',          'Type C/F',      1),
  (v_mad_pack_cat, v_madrid_id, v_trip_id, 'Comfortable walking shoes', '',              2);

-- Food (v_m_f6 has a fixed ID for schedule ref)
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_mad_food_cat, v_madrid_id, v_trip_id, 'Bocadillo de calamares', 'Fried squid sandwich',          0),
  (v_mad_food_cat, v_madrid_id, v_trip_id, 'Cocido madrileño',       'Hearty chickpea stew',          1),
  (v_mad_food_cat, v_madrid_id, v_trip_id, 'Patatas bravas',          'Fried potatoes with spicy aioli',2),
  (v_mad_food_cat, v_madrid_id, v_trip_id, 'Churros con chocolate',  'Chocolatería San Ginés (24 hrs)',3),
  (v_mad_food_cat, v_madrid_id, v_trip_id, 'Jamón ibérico',           'Splurge at a taberna',          4);
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_m_f6, v_mad_food_cat, v_madrid_id, v_trip_id, 'Mercado de San Miguel', 'Graze the stalls', 40.4154, -3.7090, 5);

-- Sights (with fixed IDs for schedule refs)
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_m_s1, v_mad_sight_cat, v_madrid_id, v_trip_id, 'Parque del Retiro',    'Crystal Palace, rowing',        40.4153, -3.6845, 0),
  (v_m_s2, v_mad_sight_cat, v_madrid_id, v_trip_id, 'Royal Palace',         'Largest in Western Europe',     40.4180, -3.7142, 1),
  (v_m_s3, v_mad_sight_cat, v_madrid_id, v_trip_id, 'Plaza Mayor',          'Grand main square',             40.4155, -3.7074, 2),
  (v_m_s4, v_mad_sight_cat, v_madrid_id, v_trip_id, 'Prado Museum',         'Free after 6 PM',               40.4138, -3.6921, 3),
  (v_m_s6, v_mad_sight_cat, v_madrid_id, v_trip_id, 'Gran Vía',             'Main boulevard',                40.4203, -3.7059, 5),
  (v_m_s7, v_mad_sight_cat, v_madrid_id, v_trip_id, 'Bernabéu Tour',        'Book online 🎟',                40.4531, -3.6883, 6);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_mad_sight_cat, v_madrid_id, v_trip_id, 'Reina Sofía',         'Picasso''s Guernica',    40.4086, -3.6943, 4),
  (v_mad_sight_cat, v_madrid_id, v_trip_id, 'Retiro at sunset',    'Locals come out at 7 PM',40.4153, -3.6845, 7);

-- Nightlife (with fixed IDs for schedule refs)
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_m_n1, v_mad_night_cat, v_madrid_id, v_trip_id, 'La Capital',          'Rooftop, starts ~1 AM',    40.4205, -3.7011, 0),
  (v_m_n3, v_mad_night_cat, v_madrid_id, v_trip_id, 'Teatro Joy Eslava',   'Theatre club, till 6 AM',  40.4171, -3.7075, 2),
  (v_m_n5, v_mad_night_cat, v_madrid_id, v_trip_id, 'Malasaña bar crawl',  'El Penta, Bar La Palma',   40.4245, -3.7074, 4);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_mad_night_cat, v_madrid_id, v_trip_id, 'Kapital',             '7-floor megaclub',        40.4108, -3.6934, 1),
  (v_mad_night_cat, v_madrid_id, v_trip_id, 'Sala El Sol',         'Indie in Malasaña',       40.4212, -3.7060, 3),
  (v_mad_night_cat, v_madrid_id, v_trip_id, 'Chueca neighborhood', 'LGBTQ+ district',         40.4228, -3.6978, 5);

-- ============================================================
-- CHECKLIST ITEMS — BARCELONA
-- ============================================================
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_bcn_pack_cat, v_bcn_id, v_trip_id, 'Swimsuit',   'Barceloneta Beach', 0),
  (v_bcn_pack_cat, v_bcn_id, v_trip_id, 'Sunscreen',  '',                  1);

INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_bcn_food_cat, v_bcn_id, v_trip_id, 'Pan con tomate',     'Bread rubbed with tomato',  0),
  (v_bcn_food_cat, v_bcn_id, v_trip_id, 'Patatas bravas (BCN)','Two sauces',               1),
  (v_bcn_food_cat, v_bcn_id, v_trip_id, 'Jamón croquetas',    'Crispy, creamy',            4),
  (v_bcn_food_cat, v_bcn_id, v_trip_id, 'Gelat (Catalan gelato)','Gothic Quarter',         6);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_bcn_food_cat, v_bcn_id, v_trip_id, 'Seafood paella',  'Near Barceloneta', 41.3809, 2.1897, 2),
  (v_bcn_food_cat, v_bcn_id, v_trip_id, 'Pintxos in El Born','Basque bar snacks',41.3851, 2.1826, 3);
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_b_f6, v_bcn_food_cat, v_bcn_id, v_trip_id, 'Mercat de la Boqueria','Fruit, jamón, juice', 41.3816, 2.1719, 5);

INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_b_s1, v_bcn_sight_cat, v_bcn_id, v_trip_id, 'Sagrada Família',       '9 AM tower entry 🎟',    41.4036, 2.1744, 0),
  (v_b_s2, v_bcn_sight_cat, v_bcn_id, v_trip_id, 'Park Güell',            'Gaudí terraces 🎟',      41.4145, 2.1527, 1),
  (v_b_s3, v_bcn_sight_cat, v_bcn_id, v_trip_id, 'Gothic Quarter',        'Get lost on purpose',    41.3833, 2.1761, 2),
  (v_b_s4, v_bcn_sight_cat, v_bcn_id, v_trip_id, 'Casa Batlló',           'Gaudí''s surreal building 🎟',41.3916,2.1650,3),
  (v_b_s7, v_bcn_sight_cat, v_bcn_id, v_trip_id, 'Barceloneta Beach',     'Morning swim',            41.3785, 2.1925, 6),
  (v_b_s8, v_bcn_sight_cat, v_bcn_id, v_trip_id, 'Camp Nou Tour',         'Insane scale',            41.3809, 2.1228, 7);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_bcn_sight_cat, v_bcn_id, v_trip_id, 'Casa Milà (La Pedrera)',  'Rooftop at sunset',    41.3954, 2.1620, 4),
  (v_bcn_sight_cat, v_bcn_id, v_trip_id, 'La Rambla',               'Walk it once',         41.3809, 2.1734, 5),
  (v_bcn_sight_cat, v_bcn_id, v_trip_id, 'Montjuïc at sunset',      'Best panoramic view',  41.3642, 2.1587, 8);

INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_b_n1, v_bcn_night_cat, v_bcn_id, v_trip_id, 'Opium Barcelona', 'Beachfront megaclub',   41.3847, 2.2008, 0),
  (v_b_n3, v_bcn_night_cat, v_bcn_id, v_trip_id, 'Razzmatazz',      '5 rooms, 5 genres',     41.3978, 2.1901, 2);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_bcn_night_cat, v_bcn_id, v_trip_id, 'Pacha Barcelona',  'On the beach',       41.3867, 2.1970, 1),
  (v_bcn_night_cat, v_bcn_id, v_trip_id, 'Sala Apolo',       'Indie/electronic',   41.3744, 2.1691, 3),
  (v_bcn_night_cat, v_bcn_id, v_trip_id, 'El Born bar crawl','Pre-club crawl',     41.3851, 2.1826, 4);

-- ============================================================
-- CHECKLIST ITEMS — NICE
-- ============================================================
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_nice_pack_cat, v_nice_id, v_trip_id, 'Beach towel',             '',                  0),
  (v_nice_pack_cat, v_nice_id, v_trip_id, 'Light jacket for evenings','',                  1);

INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_nice_food_cat, v_nice_id, v_trip_id, 'Socca',             'Crispy chickpea crepe',        0),
  (v_nice_food_cat, v_nice_id, v_trip_id, 'Pan bagnat',        'Tuna Niçoise sandwich',        1),
  (v_nice_food_cat, v_nice_id, v_trip_id, 'Salade Niçoise',    'Proper brasserie version',     2),
  (v_nice_food_cat, v_nice_id, v_trip_id, 'Pissaladière',      'Onion anchovy flatbread',      3),
  (v_nice_food_cat, v_nice_id, v_trip_id, 'Ratatouille',       'The real thing',               4),
  (v_nice_food_cat, v_nice_id, v_trip_id, 'Rosé from Provence','You''re in the right place',   5);

INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_n_s1, v_nice_sight_cat, v_nice_id, v_trip_id, 'Promenade des Anglais', 'Morning or sunset walk',       43.6948, 7.2654, 0),
  (v_n_s2, v_nice_sight_cat, v_nice_id, v_trip_id, 'Vieux-Nice',           'Pastel buildings, Cours Saleya',43.6966,7.2764, 1),
  (v_n_s3, v_nice_sight_cat, v_nice_id, v_trip_id, 'Castle Hill',          'Best view of Nice, free',       43.6953, 7.2820, 2),
  (v_n_s4, v_nice_sight_cat, v_nice_id, v_trip_id, 'Cours Saleya market',  'Go in the morning',             43.6955, 7.2760, 3);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_nice_sight_cat, v_nice_id, v_trip_id, 'Matisse Museum', 'Free first Sunday',   43.7196, 7.2753, 4),
  (v_nice_sight_cat, v_nice_id, v_trip_id, 'Pebble beach',   'Lovely for a swim',   43.6946, 7.2600, 5);

-- Monaco Day Trip
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_n_m1, v_nice_mon_cat, v_nice_id, v_trip_id, 'Casino de Monte-Carlo', '2 PM, €20, Belle Époque', 43.7389, 7.4282, 0),
  (v_n_m2, v_nice_mon_cat, v_nice_id, v_trip_id, 'Prince''s Palace',      'Guard change 11:55 AM',   43.7316, 7.4202, 1),
  (v_n_m3, v_nice_mon_cat, v_nice_id, v_trip_id, 'Port Hercule',          'Superyachts, F1 pit lane',43.7347, 7.4210, 2);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_nice_mon_cat, v_nice_id, v_trip_id, 'F1 circuit walk',   'City streets = the track', 43.7347, 7.4210, 3),
  (v_nice_mon_cat, v_nice_id, v_trip_id, 'Larvotto Beach',    'Monaco public beach',      43.7458, 7.4382, 4);

-- Nightlife
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_n_n2, v_nice_night_cat, v_nice_id, v_trip_id, 'Wayne''s Bar', 'Expat bar Vieux-Nice', 1);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_nice_night_cat, v_nice_id, v_trip_id, 'Bâoli Nice',  'Upscale beach club',    0),
  (v_nice_night_cat, v_nice_id, v_trip_id, 'High Club',   'Top nightclub',         2),
  (v_nice_night_cat, v_nice_id, v_trip_id, 'Le Ghost',    'Underground electronic',3);

-- ============================================================
-- CHECKLIST ITEMS — AMSTERDAM
-- ============================================================
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_ams_pack_cat, v_ams_id, v_trip_id, 'Rain jacket', 'Always rains in Amsterdam', 0);

INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_ams_food_cat, v_ams_id, v_trip_id, 'Stroopwafel (fresh cart)', 'Not packaged',           0),
  (v_ams_food_cat, v_ams_id, v_trip_id, 'Haring (raw herring)',     'Dutch way, with onions', 1),
  (v_ams_food_cat, v_ams_id, v_trip_id, 'Bitterballen',             'Fried beef ragù balls',  2),
  (v_ams_food_cat, v_ams_id, v_trip_id, 'Dutch fries (patat)',      'Thick-cut, with mayo',   3),
  (v_ams_food_cat, v_ams_id, v_trip_id, 'Rijsttafel',               'Indonesian rice table',  4),
  (v_ams_food_cat, v_ams_id, v_trip_id, 'Poffertjes',               'Mini fluffy pancakes',   5),
  (v_ams_food_cat, v_ams_id, v_trip_id, 'Jenever',                  'Dutch gin, brown café',  6);

INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_a_s1, v_ams_sight_cat, v_ams_id, v_trip_id, 'Rijksmuseum',         'Night Watch 🎟',           52.3600, 4.8852, 0),
  (v_a_s2, v_ams_sight_cat, v_ams_id, v_trip_id, 'Anne Frank House',    'Book months ahead 🎟',     52.3752, 4.8840, 1),
  (v_a_s3, v_ams_sight_cat, v_ams_id, v_trip_id, 'Van Gogh Museum',     'Best collection 🎟',       52.3584, 4.8811, 2),
  (v_a_s4, v_ams_sight_cat, v_ams_id, v_trip_id, 'Canal bike — Jordaan','The real Amsterdam',       52.3747, 4.8818, 3),
  (v_a_s5, v_ams_sight_cat, v_ams_id, v_trip_id, 'Vondelpark',          'Beautiful in June',        52.3579, 4.8686, 4);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_ams_sight_cat, v_ams_id, v_trip_id, 'NDSM Wharf',         'Waterfront arts district', 52.4012, 4.8918, 5),
  (v_ams_sight_cat, v_ams_id, v_trip_id, 'Heineken Experience','Fun casual day',            52.3578, 4.8914, 6);

INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_a_n1, v_ams_night_cat, v_ams_id, v_trip_id, 'Paradiso',         'Converted church',         52.3621, 4.8840, 0),
  (v_a_n5, v_ams_night_cat, v_ams_id, v_trip_id, 'Leidseplein crawl','Main nightlife square',    52.3636, 4.8827, 4),
  (v_a_n6, v_ams_night_cat, v_ams_id, v_trip_id, 'Rembrandtplein',   'Bar hopping',              52.3662, 4.8962, 5),
  (v_a_n7, v_ams_night_cat, v_ams_id, v_trip_id, 'De Pijp',          'Hipper, local',            52.3537, 4.8934, 6);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_ams_night_cat, v_ams_id, v_trip_id, 'Melkweg',           'Multiple rooms',       52.3642, 4.8818, 1),
  (v_ams_night_cat, v_ams_id, v_trip_id, 'Shelter Amsterdam', 'Techno, A''DAM Tower', 52.3841, 4.9013, 2);

-- ============================================================
-- CHECKLIST ITEMS — MUNICH
-- ============================================================
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_mun_pack_cat, v_mun_id, v_trip_id, 'Warm layers for castle day trip','Neuschwanstein is in the mountains',0);

INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_mun_food_cat, v_mun_id, v_trip_id, 'Weisswurst',        'Before noon tradition',    0),
  (v_mun_food_cat, v_mun_id, v_trip_id, 'Schweinshaxe',      'Roasted pork knuckle',     1),
  (v_mun_food_cat, v_mun_id, v_trip_id, 'Obatzda + pretzel', 'Bavarian cheese spread',   2),
  (v_mun_food_cat, v_mun_id, v_trip_id, 'Weissbier (Mass)',  'Liter glass',              3);
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_mu_f6, v_mun_food_cat, v_mun_id, v_trip_id, 'Hofbräuhaus',     'Do it once',           48.1376, 11.5799, 4),
  (v_mu_f7, v_mun_food_cat, v_mun_id, v_trip_id, 'Viktualienmarkt', 'Famous food market',   48.1351, 11.5763, 5);

INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_mu_s1, v_mun_sight_cat, v_mun_id, v_trip_id, 'Marienplatz + Glockenspiel','11 AM clock',          48.1374, 11.5755, 0),
  (v_mu_s2, v_mun_sight_cat, v_mun_id, v_trip_id, 'English Garden',            'Eisbach river surfers',48.1642, 11.6054, 1),
  (v_mu_s3, v_mun_sight_cat, v_mun_id, v_trip_id, 'Neuschwanstein Castle',     '🎟 Book NOW',          47.5576, 10.7498, 2),
  (v_mu_s4, v_mun_sight_cat, v_mun_id, v_trip_id, 'Marienbrücke bridge',       'Iconic castle view',   47.5577, 10.7440, 3),
  (v_mu_s5, v_mun_sight_cat, v_mun_id, v_trip_id, 'BMW Museum + Welt',         'Welt is free',         48.1770, 11.5564, 4),
  (v_mu_s7, v_mun_sight_cat, v_mun_id, v_trip_id, 'Augustiner Beer Garden',    'Most authentic',       48.1439, 11.5492, 6);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_mun_sight_cat, v_mun_id, v_trip_id, 'Nymphenburg Palace','Baroque gardens', 48.1583, 11.5035, 5);

INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_mu_n1, v_mun_night_cat, v_mun_id, v_trip_id, 'Harry Klein',    'World-class electronic', 0),
  (v_mu_n3, v_mun_night_cat, v_mun_id, v_trip_id, 'Blitz Club',     'Serious, no tourists',   2);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_mun_night_cat, v_mun_id, v_trip_id, 'Rote Sonne',     'Local techno',          1),
  (v_mun_night_cat, v_mun_id, v_trip_id, 'Schumann''s Bar','Legendary cocktails',   3);

-- ============================================================
-- CHECKLIST ITEMS — BERLIN
-- ============================================================
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_ber_pack_cat, v_ber_id, v_trip_id, 'All-black outfit', 'For Berghain', 0);

INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_be_f1, v_ber_food_cat, v_ber_id, v_trip_id, 'Currywurst',     'Berlin icon',      NULL, NULL, 0),
  (v_be_f6, v_ber_food_cat, v_ber_id, v_trip_id, 'Turkish in Kreuzberg','Best outside Turkey', 52.4992, 13.4038, 5),
  (v_be_f7, v_ber_food_cat, v_ber_id, v_trip_id, 'Markthalle Neun','Best on Thursdays',52.5009, 13.4335, 6);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, sort_order) VALUES
  (v_ber_food_cat, v_ber_id, v_trip_id, 'Döner kebab',          'Best in the world',   1),
  (v_ber_food_cat, v_ber_id, v_trip_id, 'Pretzels + mustard',   'Any street cart',     2),
  (v_ber_food_cat, v_ber_id, v_trip_id, 'Königsberger Klopse',  'Meatballs, caper sauce',3),
  (v_ber_food_cat, v_ber_id, v_trip_id, 'Club Mate',            'Berlin club drink',   4);

INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_be_s1, v_ber_sight_cat, v_ber_id, v_trip_id, 'Brandenburg Gate',    'Go at sunrise',          52.5163, 13.3777, 0),
  (v_be_s2, v_ber_sight_cat, v_ber_id, v_trip_id, 'Holocaust Memorial',  'Walk through slowly',    52.5139, 13.3789, 1),
  (v_be_s3, v_ber_sight_cat, v_ber_id, v_trip_id, 'East Side Gallery',   '1.3 km murals, bike it', 52.5050, 13.4395, 2),
  (v_be_s4, v_ber_sight_cat, v_ber_id, v_trip_id, 'Checkpoint Charlie',  'Historically heavy',     52.5075, 13.3904, 3),
  (v_be_s5, v_ber_sight_cat, v_ber_id, v_trip_id, 'Museum Island',       'Pergamon Museum',        52.5210, 13.3966, 4),
  (v_be_s6, v_ber_sight_cat, v_ber_id, v_trip_id, 'Reichstag Dome',      'Free, book online 🎟',   52.5186, 13.3761, 5),
  (v_be_s9, v_ber_sight_cat, v_ber_id, v_trip_id, 'Mauerpark flea market','Sundays, karaoke',      52.5445, 13.4024, 8);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_ber_sight_cat, v_ber_id, v_trip_id, 'Berliner Dom',        'Rooftop climb',       52.5190, 13.4013, 6),
  (v_ber_sight_cat, v_ber_id, v_trip_id, 'Topography of Terror','Free, sobering',      52.5065, 13.3837, 7);

INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_be_n1, v_ber_night_cat, v_ber_id, v_trip_id, 'Berghain',  'All black, after midnight', 52.5112, 13.4433, 0),
  (v_be_n2, v_ber_night_cat, v_ber_id, v_trip_id, 'Tresor',    'Original techno bunker',    52.5099, 13.4210, 1),
  (v_be_n3, v_ber_night_cat, v_ber_id, v_trip_id, 'Watergate', 'Spree river terrace',       52.5016, 13.4426, 2);
INSERT INTO checklist_items (category_id, city_id, trip_id, name, notes, lat, lng, sort_order) VALUES
  (v_ber_night_cat, v_ber_id, v_trip_id, 'Sisyphos',   'Open-air, former factory', 52.4932, 13.4787, 3),
  (v_ber_night_cat, v_ber_id, v_trip_id, 'Kater Blau', 'Riverside, accessible',    52.5121, 13.4276, 4),
  (v_ber_night_cat, v_ber_id, v_trip_id, 'Kreuzberg crawl','Schlesische Straße',    52.4970, 13.4450, 5);

-- ============================================================
-- SCHEDULE DAYS
-- ============================================================
INSERT INTO schedule_days (id, city_id, trip_id, date, day_number, day_label, title) VALUES
  (v_mad_d1, v_madrid_id, v_trip_id, '2026-06-13', 1, 'June 13', 'Arrival Night'),
  (v_mad_d2, v_madrid_id, v_trip_id, '2026-06-14', 2, 'June 14', 'Full Day'),
  (v_mad_d3, v_madrid_id, v_trip_id, '2026-06-15', 3, 'June 15', 'Last Day'),
  (v_bcn_d1, v_bcn_id,    v_trip_id, '2026-06-16', 1, 'June 16', 'Arrival'),
  (v_bcn_d2, v_bcn_id,    v_trip_id, '2026-06-17', 2, 'June 17', 'Full Day'),
  (v_nice_d1,v_nice_id,   v_trip_id, '2026-06-18', 1, 'June 18', 'Arrive Nice'),
  (v_nice_d2,v_nice_id,   v_trip_id, '2026-06-19', 2, 'June 19', 'Monaco Day Trip'),
  (v_ams_d1, v_ams_id,    v_trip_id, '2026-06-20', 1, 'June 20', 'Arrive'),
  (v_ams_d2, v_ams_id,    v_trip_id, '2026-06-21', 2, 'June 21', 'Full Day'),
  (v_mun_d1, v_mun_id,    v_trip_id, '2026-06-22', 1, 'June 22', 'Arrive'),
  (v_mun_d2, v_mun_id,    v_trip_id, '2026-06-23', 2, 'June 23', 'Full Day'),
  (v_mun_d3, v_mun_id,    v_trip_id, '2026-06-24', 3, 'June 24', 'Neuschwanstein'),
  (v_ber_d1, v_ber_id,    v_trip_id, '2026-06-25', 1, 'June 25', 'Arrive Afternoon'),
  (v_ber_d2, v_ber_id,    v_trip_id, '2026-06-26', 2, 'June 26', 'Full Day'),
  (v_ber_d3, v_ber_id,    v_trip_id, '2026-06-27', 3, 'June 27', 'Last Day');

-- ============================================================
-- SCHEDULE DAY ITEMS
-- ============================================================
-- Madrid Day 1
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_mad_d1, v_m_s6,  'Walk Gran Vía',              'Evening', 0),
  (v_mad_d1, NULL,    'Dinner at taberna in Malasaña','9–10 PM', 1),
  (v_mad_d1, v_m_n5,  'Malasaña bar crawl',          'Late',    2);

-- Madrid Day 2
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_mad_d2, v_m_s1,  'Parque del Retiro',           'Morning',   0),
  (v_mad_d2, v_m_s2,  'Royal Palace',                'Afternoon', 1),
  (v_mad_d2, v_m_s3,  'Plaza Mayor',                 'Afternoon', 2),
  (v_mad_d2, v_m_f6,  'Mercado de San Miguel',       'Afternoon', 3),
  (v_mad_d2, v_m_s6,  'Gran Vía stroll',             'Evening',   4),
  (v_mad_d2, v_m_n1,  'La Capital or Kapital',       'Night',     5);

-- Madrid Day 3
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_mad_d3, v_m_s7,  'Bernabéu Tour 🎟',            'Morning',   0),
  (v_mad_d3, v_m_s4,  'Prado Museum',                'Afternoon', 1),
  (v_mad_d3, v_m_n3,  'Teatro Joy Eslava',           'Night',     2);

-- Barcelona Day 1
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_bcn_d1, v_b_s1,  'Sagrada Família 🎟',          '9 AM',      0),
  (v_bcn_d1, v_b_s3,  'Gothic Quarter',              'Afternoon', 1),
  (v_bcn_d1, v_b_f6,  'La Rambla → Boqueria',        'Afternoon', 2),
  (v_bcn_d1, v_b_n3,  'El Born → Razzmatazz',        'Night',     3);

-- Barcelona Day 2
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_bcn_d2, v_b_s7,  'Barceloneta Beach',           'Morning',   0),
  (v_bcn_d2, v_b_s8,  'Camp Nou Tour',               'Morning',   1),
  (v_bcn_d2, v_b_s2,  'Park Güell 🎟',               'Afternoon', 2),
  (v_bcn_d2, v_b_s4,  'Casa Batlló',                 'Afternoon', 3),
  (v_bcn_d2, v_b_n1,  'Opium or Pacha',              'Night',     4);

-- Nice Day 1
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_nice_d1, v_n_s1, 'Promenade des Anglais',       'Morning',  0),
  (v_nice_d1, v_n_s4, 'Cours Saleya market',         'Morning',  1),
  (v_nice_d1, v_n_s2, 'Vieux-Nice',                  'Afternoon',2),
  (v_nice_d1, v_n_s3, 'Castle Hill',                 'Sunset',   3),
  (v_nice_d1, NULL,   'Socca + pan bagnat + rosé',   'Dinner',   4),
  (v_nice_d1, v_n_n2, 'Wayne''s Bar → High Club',    'Night',    5);

-- Nice Day 2
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_nice_d2, v_n_m2, 'Prince''s Palace guard change','11:55 AM', 0),
  (v_nice_d2, v_n_m1, 'Casino de Monte-Carlo',       'Afternoon', 1),
  (v_nice_d2, v_n_m3, 'Port Hercule → F1 walk',      'Afternoon', 2),
  (v_nice_d2, NULL,   'Back to Nice for dinner',      'Evening',  3);

-- Amsterdam Day 1
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_ams_d1, v_a_s1,  'Rijksmuseum 🎟',              'Morning',   0),
  (v_ams_d1, v_a_s5,  'Vondelpark',                  'Morning',   1),
  (v_ams_d1, v_a_s4,  'Canal bike — Jordaan',        'Afternoon', 2),
  (v_ams_d1, v_a_n5,  'Leidseplein crawl',           'Night',     3),
  (v_ams_d1, v_a_n1,  'Paradiso or Melkweg',         'Night',     4);

-- Amsterdam Day 2
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_ams_d2, v_a_s2,  'Anne Frank House 🎟',         'Morning',   0),
  (v_ams_d2, v_a_s3,  'Van Gogh Museum',             'Afternoon', 1),
  (v_ams_d2, v_a_n7,  'De Pijp neighborhood',        'Afternoon', 2),
  (v_ams_d2, v_a_n6,  'Rembrandtplein → Shelter',    'Night',     3);

-- Munich Day 1
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_mun_d1, v_mu_s1, 'Marienplatz + Glockenspiel',  '11 AM',     0),
  (v_mun_d1, v_mu_f7, 'Viktualienmarkt',              'Afternoon', 1),
  (v_mun_d1, v_mu_f6, 'Hofbräuhaus + weissbier',     'Evening',   2),
  (v_mun_d1, v_mu_n1, 'Harry Klein or Rote Sonne',   'Night',     3);

-- Munich Day 2
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_mun_d2, v_mu_s2, 'English Garden (surfers)',    'Morning',   0),
  (v_mun_d2, v_mu_s5, 'BMW Museum or Nymphenburg',   'Afternoon', 1),
  (v_mun_d2, v_mu_s7, 'Augustiner Beer Garden',      'Evening',   2),
  (v_mun_d2, v_mu_n3, 'Blitz Club',                  'Night',     3);

-- Munich Day 3
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_mun_d3, v_mu_s3, 'Neuschwanstein 🎟 (~2 hrs each way)','Full day', 0),
  (v_mun_d3, v_mu_s4, 'Marienbrücke bridge',         'Full day',  1),
  (v_mun_d3, NULL,    'Back to Munich, early night', 'Evening',   2);

-- Berlin Day 1
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_ber_d1, v_be_s1, 'Brandenburg Gate',            'Afternoon', 0),
  (v_ber_d1, v_be_s2, 'Holocaust Memorial',          'Afternoon', 1),
  (v_ber_d1, v_be_s4, 'Checkpoint Charlie',          'Afternoon', 2),
  (v_ber_d1, v_be_f6, 'Turkish in Kreuzberg',        'Dinner',    3),
  (v_ber_d1, v_be_n3, 'Watergate or Kater Blau',     'Night',     4);

-- Berlin Day 2
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_ber_d2, v_be_s3, 'East Side Gallery (bike)',    'Morning',   0),
  (v_ber_d2, v_be_s5, 'Museum Island',               'Afternoon', 1),
  (v_ber_d2, v_be_f7, 'Markthalle Neun / Kreuzberg', 'Evening',   2),
  (v_ber_d2, v_be_n2, 'Tresor or Sisyphos',          'Night',     3);

-- Berlin Day 3
INSERT INTO schedule_day_items (day_id, checklist_item_id, name, time, sort_order) VALUES
  (v_ber_d3, v_be_s6, 'Reichstag Dome 🎟',           'Morning',   0),
  (v_ber_d3, v_be_s9, 'Mauerpark or Berliner Dom',   'Afternoon', 1),
  (v_ber_d3, v_be_f1, 'Currywurst at Curry 36',      'Dinner',    2),
  (v_ber_d3, v_be_n1, 'Berghain. After midnight. Go.','Night',    3);

-- ============================================================
-- BOOKINGS
-- ============================================================
INSERT INTO bookings (trip_id, name, notes, is_urgent, completed, is_transport, sort_order) VALUES
  (v_trip_id, 'Anne Frank House tickets',      'Books out 2–3 months ahead',          true,  false, false, 0),
  (v_trip_id, 'Neuschwanstein Castle tickets', 'Book weeks in advance',               true,  false, false, 1),
  (v_trip_id, 'Sagrada Família tower entry',   'Specific time slot',                  true,  false, false, 2),
  (v_trip_id, 'Park Güell timed entry',        '',                                    false, false, false, 3),
  (v_trip_id, 'Reichstag Dome registration',   'Free but requires advance booking',   false, false, false, 4),
  (v_trip_id, 'Rijksmuseum timed entry',       '',                                    false, false, false, 5),
  (v_trip_id, 'Van Gogh Museum timed entry',   '',                                    false, false, false, 6),
  (v_trip_id, 'Bernabéu Tour',                 '',                                    false, false, false, 7);

-- Transport
INSERT INTO bookings (trip_id, name, notes, is_urgent, completed, is_transport, sort_order) VALUES
  (v_trip_id, '✈️ Fly to Madrid (June 13)',         'Arrival flight — Jun 13, 2026',            false, false, true, 0),
  (v_trip_id, '🚄 AVE train Madrid → Barcelona',    'Jun 16 morning, ~2.5 hrs',                 false, false, true, 1),
  (v_trip_id, '✈️ Fly Barcelona → Nice',            'Jun 18 morning (or 5hr coastal train)',    false, false, true, 2),
  (v_trip_id, '✈️ Fly Nice → Amsterdam',            'Jun 20 morning',                           false, false, true, 3),
  (v_trip_id, '🚄 Train Amsterdam → Munich',        'Jun 22 (or fly, ~4 hrs ICE)',              false, false, true, 4),
  (v_trip_id, '🚄 ICE train Munich → Berlin',       'Jun 25 morning, ~4 hrs',                   false, false, true, 5),
  (v_trip_id, '✈️ Fly home from Berlin (BER)',      'Jun 28, 2026',                             false, false, true, 6);

END $$;
