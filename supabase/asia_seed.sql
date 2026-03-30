-- ============================================================
-- Asia 2025 Trip — Seed Data
-- ============================================================
-- Run this in Supabase SQL Editor after schema.sql is applied.
-- User: sergio@trips.app (UUID: 2cf4ef27-89b4-421d-9cca-d8beb7c5a626)
-- ============================================================

DO $$
DECLARE
  v_user_id uuid := '2cf4ef27-89b4-421d-9cca-d8beb7c5a626';

  -- Trip
  v_trip_id uuid := 'b1000000-0000-0000-0000-000000000001';

  -- Cities
  v_tokyo_id     uuid := 'b2000000-0000-0000-0000-000000000001';
  v_kyoto_id     uuid := 'b2000000-0000-0000-0000-000000000002';
  v_osaka_id     uuid := 'b2000000-0000-0000-0000-000000000003';
  v_seoul_id     uuid := 'b2000000-0000-0000-0000-000000000004';
  v_busan_id     uuid := 'b2000000-0000-0000-0000-000000000005';
  v_sg_city_id   uuid := 'b2000000-0000-0000-0000-000000000006';
  v_bali_id      uuid := 'b2000000-0000-0000-0000-000000000007';
  v_hanoi_id     uuid := 'b2000000-0000-0000-0000-000000000008';
  v_danang_id    uuid := 'b2000000-0000-0000-0000-000000000009';
  v_hcmc_id      uuid := 'b2000000-0000-0000-0000-000000000010';

  -- Categories (food / sights / nightlife per city)
  v_tok_food_cat  uuid := 'b3000001-0000-0000-0000-000000000001';
  v_tok_sight_cat uuid := 'b3000001-0000-0000-0000-000000000002';
  v_tok_night_cat uuid := 'b3000001-0000-0000-0000-000000000003';
  v_kyo_food_cat  uuid := 'b3000002-0000-0000-0000-000000000001';
  v_kyo_sight_cat uuid := 'b3000002-0000-0000-0000-000000000002';
  v_kyo_night_cat uuid := 'b3000002-0000-0000-0000-000000000003';
  v_osa_food_cat  uuid := 'b3000003-0000-0000-0000-000000000001';
  v_osa_sight_cat uuid := 'b3000003-0000-0000-0000-000000000002';
  v_osa_night_cat uuid := 'b3000003-0000-0000-0000-000000000003';
  v_sel_food_cat  uuid := 'b3000004-0000-0000-0000-000000000001';
  v_sel_sight_cat uuid := 'b3000004-0000-0000-0000-000000000002';
  v_sel_night_cat uuid := 'b3000004-0000-0000-0000-000000000003';
  v_bus_food_cat  uuid := 'b3000005-0000-0000-0000-000000000001';
  v_bus_sight_cat uuid := 'b3000005-0000-0000-0000-000000000002';
  v_bus_night_cat uuid := 'b3000005-0000-0000-0000-000000000003';
  v_sgc_food_cat  uuid := 'b3000006-0000-0000-0000-000000000001';
  v_sgc_sight_cat uuid := 'b3000006-0000-0000-0000-000000000002';
  v_sgc_night_cat uuid := 'b3000006-0000-0000-0000-000000000003';
  v_bal_food_cat  uuid := 'b3000007-0000-0000-0000-000000000001';
  v_bal_sight_cat uuid := 'b3000007-0000-0000-0000-000000000002';
  v_bal_night_cat uuid := 'b3000007-0000-0000-0000-000000000003';
  v_han_food_cat  uuid := 'b3000008-0000-0000-0000-000000000001';
  v_han_sight_cat uuid := 'b3000008-0000-0000-0000-000000000002';
  v_han_night_cat uuid := 'b3000008-0000-0000-0000-000000000003';
  v_dan_food_cat  uuid := 'b3000009-0000-0000-0000-000000000001';
  v_dan_sight_cat uuid := 'b3000009-0000-0000-0000-000000000002';
  v_dan_night_cat uuid := 'b3000009-0000-0000-0000-000000000003';
  v_hmc_food_cat  uuid := 'b3000010-0000-0000-0000-000000000001';
  v_hmc_sight_cat uuid := 'b3000010-0000-0000-0000-000000000002';
  v_hmc_night_cat uuid := 'b3000010-0000-0000-0000-000000000003';

  -- Tokyo items referenced in schedule
  v_tk_f1  uuid := 'b4010100-0000-0000-0000-000000000001'; -- Ramen at Ichiran
  v_tk_f2  uuid := 'b4010100-0000-0000-0000-000000000002'; -- Tsukiji Outer Market
  v_tk_f6  uuid := 'b4010100-0000-0000-0000-000000000006'; -- Harajuku crepes
  v_tk_n1  uuid := 'b4010300-0000-0000-0000-000000000001'; -- Golden Gai
  v_tk_n2  uuid := 'b4010300-0000-0000-0000-000000000002'; -- Omoide Yokocho
  v_tk_s1  uuid := 'b4010200-0000-0000-0000-000000000001'; -- Senso-ji Temple
  v_tk_s2  uuid := 'b4010200-0000-0000-0000-000000000002'; -- Shibuya Crossing
  v_tk_s3  uuid := 'b4010200-0000-0000-0000-000000000003'; -- Shinjuku Gyoen
  v_tk_s4  uuid := 'b4010200-0000-0000-0000-000000000004'; -- teamLab Borderless
  v_tk_s5  uuid := 'b4010200-0000-0000-0000-000000000005'; -- Tokyo DisneySea
  v_tk_s6  uuid := 'b4010200-0000-0000-0000-000000000006'; -- Akihabara
  v_tk_s7  uuid := 'b4010200-0000-0000-0000-000000000007'; -- Meiji Shrine
  v_tk_s8  uuid := 'b4010200-0000-0000-0000-000000000008'; -- Tokyo Tower

  -- Kyoto items referenced in schedule
  v_ky_f1  uuid := 'b4020100-0000-0000-0000-000000000001'; -- Nishiki Market
  v_ky_f3  uuid := 'b4020100-0000-0000-0000-000000000003'; -- Kaiseki dinner
  v_ky_s1  uuid := 'b4020200-0000-0000-0000-000000000001'; -- Fushimi Inari
  v_ky_s2  uuid := 'b4020200-0000-0000-0000-000000000002'; -- Arashiyama Bamboo Grove
  v_ky_s3  uuid := 'b4020200-0000-0000-0000-000000000003'; -- Kinkaku-ji
  v_ky_s5  uuid := 'b4020200-0000-0000-0000-000000000005'; -- Philosopher's Path
  v_ky_s6  uuid := 'b4020200-0000-0000-0000-000000000006'; -- Nara day trip
  v_ky_n1  uuid := 'b4020300-0000-0000-0000-000000000001'; -- Pontocho alley

  -- Osaka items referenced in schedule
  v_os_f1  uuid := 'b4030100-0000-0000-0000-000000000001'; -- Takoyaki at Wanaka
  v_os_f3  uuid := 'b4030100-0000-0000-0000-000000000003'; -- Kushikatsu
  v_os_f4  uuid := 'b4030100-0000-0000-0000-000000000004'; -- Kuromon Ichiba Market
  v_os_s1  uuid := 'b4030200-0000-0000-0000-000000000001'; -- Dotonbori
  v_os_s2  uuid := 'b4030200-0000-0000-0000-000000000002'; -- Osaka Castle
  v_os_s3  uuid := 'b4030200-0000-0000-0000-000000000003'; -- Universal Studios Japan
  v_os_n1  uuid := 'b4030300-0000-0000-0000-000000000001'; -- Amerikamura

  -- Seoul items referenced in schedule
  v_se_f1  uuid := 'b4040100-0000-0000-0000-000000000001'; -- Korean BBQ
  v_se_s1  uuid := 'b4040200-0000-0000-0000-000000000001'; -- Gyeongbokgung Palace
  v_se_s2  uuid := 'b4040200-0000-0000-0000-000000000002'; -- N Seoul Tower
  v_se_s3  uuid := 'b4040200-0000-0000-0000-000000000003'; -- Bukchon Hanok Village
  v_se_s4  uuid := 'b4040200-0000-0000-0000-000000000004'; -- Hongdae area
  v_se_n1  uuid := 'b4040300-0000-0000-0000-000000000001'; -- Hongdae clubs
  v_se_n2  uuid := 'b4040300-0000-0000-0000-000000000002'; -- Itaewon crawl

  -- Busan items referenced in schedule
  v_bu_f1  uuid := 'b4050100-0000-0000-0000-000000000001'; -- Jagalchi Market seafood
  v_bu_s1  uuid := 'b4050200-0000-0000-0000-000000000001'; -- Haeundae Beach
  v_bu_s2  uuid := 'b4050200-0000-0000-0000-000000000002'; -- Gamcheon Culture Village
  v_bu_s3  uuid := 'b4050200-0000-0000-0000-000000000003'; -- Haedong Yonggungsa Temple
  v_bu_s4  uuid := 'b4050200-0000-0000-0000-000000000004'; -- Gwangalli Beach

  -- Singapore items referenced in schedule
  v_sg_f1  uuid := 'b4060100-0000-0000-0000-000000000001'; -- Hainanese chicken rice
  v_sg_f5  uuid := 'b4060100-0000-0000-0000-000000000005'; -- Kaya toast
  v_sg_s1  uuid := 'b4060200-0000-0000-0000-000000000001'; -- Gardens by the Bay
  v_sg_s2  uuid := 'b4060200-0000-0000-0000-000000000002'; -- Marina Bay Sands
  v_sg_n1  uuid := 'b4060300-0000-0000-0000-000000000001'; -- Clarke Quay bars

  -- Bali items referenced in schedule
  v_ba_f1  uuid := 'b4070100-0000-0000-0000-000000000001'; -- Babi guling
  v_ba_s1  uuid := 'b4070200-0000-0000-0000-000000000001'; -- Ubud Monkey Forest
  v_ba_s2  uuid := 'b4070200-0000-0000-0000-000000000002'; -- Tegallalang Rice Terraces
  v_ba_s3  uuid := 'b4070200-0000-0000-0000-000000000003'; -- Tanah Lot Temple
  v_ba_s4  uuid := 'b4070200-0000-0000-0000-000000000004'; -- Uluwatu Temple
  v_ba_s5  uuid := 'b4070200-0000-0000-0000-000000000005'; -- Mount Batur sunrise hike
  v_ba_s6  uuid := 'b4070200-0000-0000-0000-000000000006'; -- Canggu surf
  v_ba_s7  uuid := 'b4070200-0000-0000-0000-000000000007'; -- Seminyak
  v_ba_n1  uuid := 'b4070300-0000-0000-0000-000000000001'; -- Potato Head Beach Club
  v_ba_n2  uuid := 'b4070300-0000-0000-0000-000000000002'; -- Single Fin
  v_ba_n3  uuid := 'b4070300-0000-0000-0000-000000000003'; -- La Favela

  -- Hanoi items referenced in schedule
  v_hn_f1  uuid := 'b4080100-0000-0000-0000-000000000001'; -- Pho Thin
  v_hn_f3  uuid := 'b4080100-0000-0000-0000-000000000003'; -- Egg coffee
  v_hn_s1  uuid := 'b4080200-0000-0000-0000-000000000001'; -- Hoan Kiem Lake
  v_hn_s3  uuid := 'b4080200-0000-0000-0000-000000000003'; -- Ho Chi Minh Mausoleum
  v_hn_s5  uuid := 'b4080200-0000-0000-0000-000000000005'; -- Ha Giang Loop

  -- Da Nang items referenced in schedule
  v_dn_f1  uuid := 'b4090100-0000-0000-0000-000000000001'; -- Cao lau
  v_dn_f4  uuid := 'b4090100-0000-0000-0000-000000000004'; -- Mi Quang
  v_dn_s1  uuid := 'b4090200-0000-0000-0000-000000000001'; -- Hoi An Ancient Town
  v_dn_s2  uuid := 'b4090200-0000-0000-0000-000000000002'; -- My Khe Beach
  v_dn_s3  uuid := 'b4090200-0000-0000-0000-000000000003'; -- Golden Bridge

  -- HCMC items referenced in schedule
  v_hc_f2  uuid := 'b4100100-0000-0000-0000-000000000002'; -- Ben Thanh Market food hall
  v_hc_n1  uuid := 'b4100300-0000-0000-0000-000000000001'; -- Bui Vien Walking Street
  v_hc_s1  uuid := 'b4100200-0000-0000-0000-000000000001'; -- War Remnants Museum
  v_hc_s3  uuid := 'b4100200-0000-0000-0000-000000000003'; -- Cu Chi Tunnels
  v_hc_s4  uuid := 'b4100200-0000-0000-0000-000000000004'; -- Reunification Palace

  -- Schedule day IDs
  v_td1    uuid := 'b5010000-0000-0000-0000-000000000001'; -- Tokyo May 14
  v_td2    uuid := 'b5010000-0000-0000-0000-000000000002'; -- Tokyo May 15
  v_td3    uuid := 'b5010000-0000-0000-0000-000000000003'; -- Tokyo May 16
  v_td4    uuid := 'b5010000-0000-0000-0000-000000000004'; -- Tokyo May 17
  v_td5    uuid := 'b5010000-0000-0000-0000-000000000005'; -- Tokyo May 25-26
  v_kd1    uuid := 'b5020000-0000-0000-0000-000000000001'; -- Kyoto May 18
  v_kd2    uuid := 'b5020000-0000-0000-0000-000000000002'; -- Kyoto May 19
  v_kd3    uuid := 'b5020000-0000-0000-0000-000000000003'; -- Kyoto May 20
  v_od1    uuid := 'b5030000-0000-0000-0000-000000000001'; -- Osaka May 21
  v_od2    uuid := 'b5030000-0000-0000-0000-000000000002'; -- Osaka May 22
  v_od3    uuid := 'b5030000-0000-0000-0000-000000000003'; -- Osaka May 23
  v_sd1    uuid := 'b5040000-0000-0000-0000-000000000001'; -- Seoul May 29
  v_sd2    uuid := 'b5040000-0000-0000-0000-000000000002'; -- Seoul May 30
  v_sd3    uuid := 'b5040000-0000-0000-0000-000000000003'; -- Seoul Jun 3
  v_bd1    uuid := 'b5050000-0000-0000-0000-000000000001'; -- Busan May 30-31
  v_bd2    uuid := 'b5050000-0000-0000-0000-000000000002'; -- Busan Jun 1-2
  v_sgd1   uuid := 'b5060000-0000-0000-0000-000000000001'; -- Singapore Jun 4
  v_sgd2   uuid := 'b5060000-0000-0000-0000-000000000002'; -- Singapore Jun 5
  v_bald1  uuid := 'b5070000-0000-0000-0000-000000000001'; -- Bali Jun 5-7
  v_bald2  uuid := 'b5070000-0000-0000-0000-000000000002'; -- Bali Jun 8-10
  v_bald3  uuid := 'b5070000-0000-0000-0000-000000000003'; -- Bali Jun 11-13
  v_bald4  uuid := 'b5070000-0000-0000-0000-000000000004'; -- Bali Jun 14-17
  v_hnd1   uuid := 'b5080000-0000-0000-0000-000000000001'; -- Hanoi Jun 18
  v_hnd2   uuid := 'b5080000-0000-0000-0000-000000000002'; -- Hanoi Jun 19-22
  v_hnd3   uuid := 'b5080000-0000-0000-0000-000000000003'; -- Hanoi Jun 23-24
  v_dnd1   uuid := 'b5090000-0000-0000-0000-000000000001'; -- Da Nang Jun 25
  v_dnd2   uuid := 'b5090000-0000-0000-0000-000000000002'; -- Da Nang Jun 26
  v_hcd1   uuid := 'b5100000-0000-0000-0000-000000000001'; -- HCMC Jun 26
  v_hcd2   uuid := 'b5100000-0000-0000-0000-000000000002'; -- HCMC Jun 27

BEGIN

-- ── Trip ────────────────────────────────────────────────────
INSERT INTO trips (id, user_id, title, emoji, start_date, end_date, archived, trip_notes)
VALUES (v_trip_id, v_user_id, 'Asia 2025', '🌏', '2025-05-13', '2025-06-27', true, '');

-- ── Cities ──────────────────────────────────────────────────
INSERT INTO cities (id, trip_id, name, country, flag_emoji, start_date, end_date, color, lat, lng, city_notes, sort_order) VALUES
  (v_tokyo_id,   v_trip_id, 'Tokyo',            'Japan',       '🇯🇵', '2025-05-13', '2025-05-27', '#E63946',  35.6762,   139.6503, '', 0),
  (v_kyoto_id,   v_trip_id, 'Kyoto',            'Japan',       '🇯🇵', '2025-05-18', '2025-05-20', '#2A9D8F',  35.0116,   135.7681, '', 1),
  (v_osaka_id,   v_trip_id, 'Osaka',            'Japan',       '🇯🇵', '2025-05-21', '2025-05-24', '#F4A261',  34.6937,   135.5023, '', 2),
  (v_seoul_id,   v_trip_id, 'Seoul',            'South Korea', '🇰🇷', '2025-05-29', '2025-06-04', '#457B9D',  37.5665,   126.9780, '', 3),
  (v_busan_id,   v_trip_id, 'Busan',            'South Korea', '🇰🇷', '2025-05-30', '2025-06-02', '#E9C46A',  35.1796,   129.0756, '', 4),
  (v_sg_city_id, v_trip_id, 'Singapore',        'Singapore',   '🇸🇬', '2025-06-04', '2025-06-05', '#264653',   1.3521,   103.8198, '', 5),
  (v_bali_id,    v_trip_id, 'Bali',             'Indonesia',   '🇮🇩', '2025-06-05', '2025-06-17', '#2A9D8F',  -8.4095,   115.1889, '', 6),
  (v_hanoi_id,   v_trip_id, 'Hanoi',            'Vietnam',     '🇻🇳', '2025-06-18', '2025-06-24', '#E63946',  21.0278,   105.8342, '', 7),
  (v_danang_id,  v_trip_id, 'Da Nang',          'Vietnam',     '🇻🇳', '2025-06-25', '2025-06-26', '#457B9D',  16.0544,   108.2022, '', 8),
  (v_hcmc_id,    v_trip_id, 'Ho Chi Minh City', 'Vietnam',     '🇻🇳', '2025-06-26', '2025-06-27', '#9B2226',  10.7769,   106.7009, '', 9);

-- ── Checklist Categories ─────────────────────────────────────
INSERT INTO checklist_categories (id, city_id, name, emoji, category_key, sort_order) VALUES
  (v_tok_food_cat,  v_tokyo_id,   'Must-Try Food',   '🍽️', 'food',      0),
  (v_tok_sight_cat, v_tokyo_id,   'Must-See Sights', '👁️', 'sights',    1),
  (v_tok_night_cat, v_tokyo_id,   'Nightlife',       '🎉', 'nightlife', 2),
  (v_kyo_food_cat,  v_kyoto_id,   'Must-Try Food',   '🍽️', 'food',      0),
  (v_kyo_sight_cat, v_kyoto_id,   'Must-See Sights', '👁️', 'sights',    1),
  (v_kyo_night_cat, v_kyoto_id,   'Nightlife',       '🎉', 'nightlife', 2),
  (v_osa_food_cat,  v_osaka_id,   'Must-Try Food',   '🍽️', 'food',      0),
  (v_osa_sight_cat, v_osaka_id,   'Must-See Sights', '👁️', 'sights',    1),
  (v_osa_night_cat, v_osaka_id,   'Nightlife',       '🎉', 'nightlife', 2),
  (v_sel_food_cat,  v_seoul_id,   'Must-Try Food',   '🍽️', 'food',      0),
  (v_sel_sight_cat, v_seoul_id,   'Must-See Sights', '👁️', 'sights',    1),
  (v_sel_night_cat, v_seoul_id,   'Nightlife',       '🎉', 'nightlife', 2),
  (v_bus_food_cat,  v_busan_id,   'Must-Try Food',   '🍽️', 'food',      0),
  (v_bus_sight_cat, v_busan_id,   'Must-See Sights', '👁️', 'sights',    1),
  (v_bus_night_cat, v_busan_id,   'Nightlife',       '🎉', 'nightlife', 2),
  (v_sgc_food_cat,  v_sg_city_id, 'Must-Try Food',   '🍽️', 'food',      0),
  (v_sgc_sight_cat, v_sg_city_id, 'Must-See Sights', '👁️', 'sights',    1),
  (v_sgc_night_cat, v_sg_city_id, 'Nightlife',       '🎉', 'nightlife', 2),
  (v_bal_food_cat,  v_bali_id,    'Must-Try Food',   '🍽️', 'food',      0),
  (v_bal_sight_cat, v_bali_id,    'Must-See Sights', '👁️', 'sights',    1),
  (v_bal_night_cat, v_bali_id,    'Nightlife',       '🎉', 'nightlife', 2),
  (v_han_food_cat,  v_hanoi_id,   'Must-Try Food',   '🍽️', 'food',      0),
  (v_han_sight_cat, v_hanoi_id,   'Must-See Sights', '👁️', 'sights',    1),
  (v_han_night_cat, v_hanoi_id,   'Nightlife',       '🎉', 'nightlife', 2),
  (v_dan_food_cat,  v_danang_id,  'Must-Try Food',   '🍽️', 'food',      0),
  (v_dan_sight_cat, v_danang_id,  'Must-See Sights', '👁️', 'sights',    1),
  (v_dan_night_cat, v_danang_id,  'Nightlife',       '🎉', 'nightlife', 2),
  (v_hmc_food_cat,  v_hcmc_id,    'Must-Try Food',   '🍽️', 'food',      0),
  (v_hmc_sight_cat, v_hcmc_id,    'Must-See Sights', '👁️', 'sights',    1),
  (v_hmc_night_cat, v_hcmc_id,    'Nightlife',       '🎉', 'nightlife', 2);

-- ── Checklist Items ──────────────────────────────────────────

-- TOKYO — Food
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_tk_f1,           v_tok_food_cat, v_tokyo_id, v_trip_id, 'Ramen at Ichiran',             'Solo booths, rich tonkotsu',     true,  35.6908, 139.7003, true,  0),
  (v_tk_f2,           v_tok_food_cat, v_tokyo_id, v_trip_id, 'Tsukiji Outer Market',         'Fresh sushi breakfast',          true,  35.6654, 139.7707, true,  1),
  (gen_random_uuid(), v_tok_food_cat, v_tokyo_id, v_trip_id, 'Conveyor belt sushi (kaiten)', 'Fun, affordable',                true,  NULL,    NULL,     false, 2),
  (gen_random_uuid(), v_tok_food_cat, v_tokyo_id, v_trip_id, 'Wagyu beef yakiniku',          'Worth the splurge',              true,  NULL,    NULL,     false, 3),
  (gen_random_uuid(), v_tok_food_cat, v_tokyo_id, v_trip_id, 'Monjayaki in Tsukishima',      'Tokyo-style savory pancake',     false, 35.6636, 139.7839, true,  4),
  (v_tk_f6,           v_tok_food_cat, v_tokyo_id, v_trip_id, 'Harajuku crepes',              'Sweet crepe on Takeshita St',    true,  35.6702, 139.7026, true,  5);

-- TOKYO — Sights
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_tk_s1, v_tok_sight_cat, v_tokyo_id, v_trip_id, 'Senso-ji Temple',       'Asakusa, most iconic',          true, 35.7148, 139.7967, true, 0),
  (v_tk_s2, v_tok_sight_cat, v_tokyo_id, v_trip_id, 'Shibuya Crossing',      'Most famous intersection',      true, 35.6594, 139.7006, true, 1),
  (v_tk_s3, v_tok_sight_cat, v_tokyo_id, v_trip_id, 'Shinjuku Gyoen',        'Stunning garden',               true, 35.6851, 139.7100, true, 2),
  (v_tk_s4, v_tok_sight_cat, v_tokyo_id, v_trip_id, 'teamLab Borderless 🎟', 'Immersive digital art',         true, NULL,    NULL,     false,3),
  (v_tk_s5, v_tok_sight_cat, v_tokyo_id, v_trip_id, 'Tokyo DisneySea 🎟',   'Most magical Disney park',      true, 35.6267, 139.8853, true, 4),
  (v_tk_s6, v_tok_sight_cat, v_tokyo_id, v_trip_id, 'Akihabara',             'Electronics & anime district',  true, 35.7022, 139.7742, true, 5),
  (v_tk_s7, v_tok_sight_cat, v_tokyo_id, v_trip_id, 'Meiji Shrine',          'Serene forest shrine',          true, 35.6764, 139.6993, true, 6),
  (v_tk_s8, v_tok_sight_cat, v_tokyo_id, v_trip_id, 'Tokyo Tower',           'Classic skyline view',          true, 35.6586, 139.7454, true, 7);

-- TOKYO — Nightlife
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_tk_n1,           v_tok_night_cat, v_tokyo_id, v_trip_id, 'Golden Gai (Shinjuku)', '100+ tiny themed bars',          true,  35.6930, 139.7021, true,  0),
  (v_tk_n2,           v_tok_night_cat, v_tokyo_id, v_trip_id, 'Omoide Yokocho',        'Yakitori alley, smoky & charming',true, 35.6907, 139.6994, true,  1),
  (gen_random_uuid(), v_tok_night_cat, v_tokyo_id, v_trip_id, 'Roppongi',              'International nightlife',         false, 35.6628, 139.7311, true,  2),
  (gen_random_uuid(), v_tok_night_cat, v_tokyo_id, v_trip_id, 'Shimokitazawa bar hop', 'Indie local bars',                false, NULL,    NULL,     false, 3);

-- KYOTO — Food
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_ky_f1,           v_kyo_food_cat, v_kyoto_id, v_trip_id, 'Nishiki Market stalls',       '"Kitchen of Kyoto"',                  true,  35.0050, 135.7650, true,  0),
  (gen_random_uuid(), v_kyo_food_cat, v_kyoto_id, v_trip_id, 'Matcha everything',           'Gion Tsujiri or Nakamura Tokichi',    true,  35.0038, 135.7743, true,  1),
  (v_ky_f3,           v_kyo_food_cat, v_kyoto_id, v_trip_id, 'Kaiseki dinner',              'Multi-course Japanese haute cuisine', true,  NULL,    NULL,     false, 2),
  (gen_random_uuid(), v_kyo_food_cat, v_kyoto_id, v_trip_id, 'Tofu cuisine in Arashiyama', 'Zen Buddhist style',                  false, 35.0094, 135.6683, true,  3),
  (gen_random_uuid(), v_kyo_food_cat, v_kyoto_id, v_trip_id, 'Obanzai (Kyoto home cooking)','Local izakaya near Gion',            true,  NULL,    NULL,     false, 4);

-- KYOTO — Sights
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_ky_s1,           v_kyo_sight_cat, v_kyoto_id, v_trip_id, 'Fushimi Inari Shrine',        '10,000 torii gates, go at dawn',  true,  34.9671, 135.7727, true, 0),
  (v_ky_s2,           v_kyo_sight_cat, v_kyoto_id, v_trip_id, 'Arashiyama Bamboo Grove',     'Early morning beats the crowds',  true,  35.0094, 135.6683, true, 1),
  (v_ky_s3,           v_kyo_sight_cat, v_kyoto_id, v_trip_id, 'Kinkaku-ji (Golden Pavilion)','Iconic gold-leaf temple',         true,  35.0394, 135.7292, true, 2),
  (gen_random_uuid(), v_kyo_sight_cat, v_kyoto_id, v_trip_id, 'Gion district at night',      'Geisha spotting on Hanamikoji',   true,  35.0038, 135.7743, true, 3),
  (v_ky_s5,           v_kyo_sight_cat, v_kyoto_id, v_trip_id, 'Philosopher''s Path',         'Cherry tree-lined canal walk',    true,  35.0270, 135.7942, true, 4),
  (v_ky_s6,           v_kyo_sight_cat, v_kyoto_id, v_trip_id, 'Nara day trip',               'Feed the bowing deer',            true,  34.6895, 135.8048, true, 5);

-- KYOTO — Nightlife
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_ky_n1,           v_kyo_night_cat, v_kyoto_id, v_trip_id, 'Pontocho alley',   'Lantern-lit dining alley', true,  35.0036, 135.7716, true,  0),
  (gen_random_uuid(), v_kyo_night_cat, v_kyoto_id, v_trip_id, 'Sake bar in Gion', 'Try local Fushimi sake',   true,  NULL,    NULL,     false, 1),
  (gen_random_uuid(), v_kyo_night_cat, v_kyoto_id, v_trip_id, 'Bar K6',           'Jazz bar in Gion',         false, NULL,    NULL,     false, 2);

-- OSAKA — Food
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_os_f1,           v_osa_food_cat, v_osaka_id, v_trip_id, 'Takoyaki at Wanaka',     'Octopus balls, essential Osaka',      true,  34.6687, 135.5021, true,  0),
  (gen_random_uuid(), v_osa_food_cat, v_osaka_id, v_trip_id, 'Okonomiyaki',            'Savory pancake, Dotonbori area',      true,  34.6687, 135.5021, true,  1),
  (v_os_f3,           v_osa_food_cat, v_osaka_id, v_trip_id, 'Kushikatsu at Shinsekai','Deep fried everything, one dip rule', true,  34.6519, 135.5063, true,  2),
  (v_os_f4,           v_osa_food_cat, v_osaka_id, v_trip_id, 'Kuromon Ichiba Market',  'Fresh seafood, fruit, snacks',        true,  34.6672, 135.5072, true,  3),
  (gen_random_uuid(), v_osa_food_cat, v_osaka_id, v_trip_id, 'Yakiniku (Korean BBQ)',  'Best outside Korea',                  false, NULL,    NULL,     false, 4);

-- OSAKA — Sights
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_os_s1,           v_osa_sight_cat, v_osaka_id, v_trip_id, 'Dotonbori',                'Neon signs, giant crab, energy', true,  34.6687, 135.5021, true,  0),
  (v_os_s2,           v_osa_sight_cat, v_osaka_id, v_trip_id, 'Osaka Castle',             'Historic park around it',        true,  34.6873, 135.5262, true,  1),
  (v_os_s3,           v_osa_sight_cat, v_osaka_id, v_trip_id, 'Universal Studios Japan 🎟','Harry Potter world!',           true,  34.6654, 135.4323, true,  2),
  (gen_random_uuid(), v_osa_sight_cat, v_osaka_id, v_trip_id, 'Shinsekai',                'Retro downtown district',        true,  34.6519, 135.5063, true,  3),
  (gen_random_uuid(), v_osa_sight_cat, v_osaka_id, v_trip_id, 'Namba area',               'Shopping, street food',          true,  34.6640, 135.5013, true,  4);

-- OSAKA — Nightlife
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_os_n1,           v_osa_night_cat, v_osaka_id, v_trip_id, 'Amerikamura',     'Trendy bars & clubs',            true,  34.6733, 135.4983, true,  0),
  (gen_random_uuid(), v_osa_night_cat, v_osaka_id, v_trip_id, 'Club Joule',      'Multiple rooms in Shinsaibashi', false, 34.6685, 135.5012, true,  1),
  (gen_random_uuid(), v_osa_night_cat, v_osaka_id, v_trip_id, 'Namba bar crawl', 'Start at Dotonbori',             true,  NULL,    NULL,     false, 2);

-- SEOUL — Food
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_se_f1,           v_sel_food_cat, v_seoul_id, v_trip_id, 'Korean BBQ in Mapo-gu',      'Samgyeopsal (pork belly)',              true, 37.5471, 126.9069, true, 0),
  (gen_random_uuid(), v_sel_food_cat, v_seoul_id, v_trip_id, 'Gwangjang Market',           'Bindaetteok (mung bean pancakes)',      true, 35.5704, 126.9997, true, 1),
  (gen_random_uuid(), v_sel_food_cat, v_seoul_id, v_trip_id, 'Bibimbap',                   'Stone bowl version (dolsot)',           true, NULL,    NULL,     false,2),
  (gen_random_uuid(), v_sel_food_cat, v_seoul_id, v_trip_id, 'Korean fried chicken + beer','"chimaek" — the combo',                true, NULL,    NULL,     false,3),
  (gen_random_uuid(), v_sel_food_cat, v_seoul_id, v_trip_id, 'Myeongdong street food',     'Hotteok, tteokbokki, tornado potato',  true, 37.5638, 126.9849, true, 4);

-- SEOUL — Sights
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_se_s1,           v_sel_sight_cat, v_seoul_id, v_trip_id, 'Gyeongbokgung Palace',  'Guard changing ceremony',           true,  37.5796, 126.9770, true,  0),
  (v_se_s2,           v_sel_sight_cat, v_seoul_id, v_trip_id, 'N Seoul Tower',         'Panoramic views',                   true,  37.5512, 126.9882, true,  1),
  (v_se_s3,           v_sel_sight_cat, v_seoul_id, v_trip_id, 'Bukchon Hanok Village', 'Traditional Korean houses',         true,  37.5821, 126.9839, true,  2),
  (v_se_s4,           v_sel_sight_cat, v_seoul_id, v_trip_id, 'Hongdae area',          'Young, artsy, street performances', true,  37.5563, 126.9228, true,  3),
  (gen_random_uuid(), v_sel_sight_cat, v_seoul_id, v_trip_id, 'DMZ tour',              'North Korean border, surreal',      false, 37.9380, 126.6827, true,  4);

-- SEOUL — Nightlife
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_se_n1,           v_sel_night_cat, v_seoul_id, v_trip_id, 'Hongdae clubs', 'Young crowd, good music',  true,  37.5563, 126.9228, true,  0),
  (v_se_n2,           v_sel_night_cat, v_seoul_id, v_trip_id, 'Itaewon crawl', 'International mix',        true,  37.5340, 126.9946, true,  1),
  (gen_random_uuid(), v_sel_night_cat, v_seoul_id, v_trip_id, 'Club Octagon',  'One of Asia''s best',      false, 37.5165, 127.0576, true,  2);

-- BUSAN — Food
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_bu_f1,           v_bus_food_cat, v_busan_id, v_trip_id, 'Jagalchi Market seafood',  'Point and eat fresh',             true,  35.0972, 129.0304, true,  0),
  (gen_random_uuid(), v_bus_food_cat, v_busan_id, v_trip_id, 'Dwaeji-gukbap',            'Pork rice soup, Busan specialty', true,  NULL,    NULL,     false, 1),
  (gen_random_uuid(), v_bus_food_cat, v_busan_id, v_trip_id, 'Ssiat Hotteok',            'Seed-filled sweet pancake',       true,  NULL,    NULL,     false, 2),
  (gen_random_uuid(), v_bus_food_cat, v_busan_id, v_trip_id, 'Gukje Market street food', 'Bibim dangmyeon + more',          false, 35.0992, 129.0275, true,  3);

-- BUSAN — Sights
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_bu_s1,           v_bus_sight_cat, v_busan_id, v_trip_id, 'Haeundae Beach',            'Most famous beach in Korea',    true,  35.1585, 129.1603, true,  0),
  (v_bu_s2,           v_bus_sight_cat, v_busan_id, v_trip_id, 'Gamcheon Culture Village',  'Colorful hillside village',     true,  35.0975, 128.9925, true,  1),
  (v_bu_s3,           v_bus_sight_cat, v_busan_id, v_trip_id, 'Haedong Yonggungsa Temple', 'Temple by the sea',             true,  35.1876, 129.2242, true,  2),
  (v_bu_s4,           v_bus_sight_cat, v_busan_id, v_trip_id, 'Gwangalli Beach',           'Night view of Gwangan Bridge',  true,  35.1534, 129.1183, true,  3),
  (gen_random_uuid(), v_bus_sight_cat, v_busan_id, v_trip_id, 'Jagalchi Fish Market',      'Huge, bustling seafood market', true,  35.0972, 129.0304, true,  4);

-- BUSAN — Nightlife
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (gen_random_uuid(), v_bus_night_cat, v_busan_id, v_trip_id, 'Gwangalli beach bar scene', 'Cocktails with bridge view', true,  35.1534, 129.1183, true,  0),
  (gen_random_uuid(), v_bus_night_cat, v_busan_id, v_trip_id, 'Haeundae clubs',            'Beach club vibes',           false, NULL,    NULL,     false, 1);

-- SINGAPORE — Food
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_sg_f1,           v_sgc_food_cat, v_sg_city_id, v_trip_id, 'Hainanese chicken rice',    'Maxwell Hawker Centre',          true, 1.2800, 103.8449, true,  0),
  (gen_random_uuid(), v_sgc_food_cat, v_sg_city_id, v_trip_id, 'Chili crab',                'Jumbo Seafood or Long Beach',    true, 1.2860, 103.8628, true,  1),
  (gen_random_uuid(), v_sgc_food_cat, v_sg_city_id, v_trip_id, 'Lau Pa Sat satay',          'Evening hawker centre',          true, 1.2807, 103.8508, true,  2),
  (gen_random_uuid(), v_sgc_food_cat, v_sg_city_id, v_trip_id, 'Laksa',                     '328 Katong Laksa',               true, NULL,   NULL,     false, 3),
  (v_sg_f5,           v_sgc_food_cat, v_sg_city_id, v_trip_id, 'Kaya toast + soft egg',     'Ya Kun or Tong Ah Eating House', true, NULL,   NULL,     false, 4);

-- SINGAPORE — Sights
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_sg_s1,           v_sgc_sight_cat, v_sg_city_id, v_trip_id, 'Gardens by the Bay',       'Supertrees + Cloud Forest',               true,  1.2816, 103.8636, true,  0),
  (v_sg_s2,           v_sgc_sight_cat, v_sg_city_id, v_trip_id, 'Marina Bay Sands rooftop', 'Infinity pool view or observation deck',   true,  1.2834, 103.8607, true,  1),
  (gen_random_uuid(), v_sgc_sight_cat, v_sg_city_id, v_trip_id, 'Merlion Park',             'Classic photo',                           true,  1.2868, 103.8545, true,  2),
  (gen_random_uuid(), v_sgc_sight_cat, v_sg_city_id, v_trip_id, 'Chinatown + Little India', 'Food trail through neighborhoods',        true,  1.2832, 103.8445, true,  3),
  (gen_random_uuid(), v_sgc_sight_cat, v_sg_city_id, v_trip_id, 'Sentosa Island',           'Beach, Universal Studios',                false, 1.2494, 103.8303, true,  4);

-- SINGAPORE — Nightlife
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_sg_n1,           v_sgc_night_cat, v_sg_city_id, v_trip_id, 'Clarke Quay bars',       'River bar strip',         true,  1.2906, 103.8463, true,  0),
  (gen_random_uuid(), v_sgc_night_cat, v_sg_city_id, v_trip_id, '1-Altitude rooftop bar', 'Highest al fresco in SG', false, NULL,   NULL,     false, 1);

-- BALI — Food
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_ba_f1,           v_bal_food_cat, v_bali_id, v_trip_id, 'Babi guling (suckling pig)', 'Ibu Oka in Ubud',             true,  -8.5069, 115.2625, true,  0),
  (gen_random_uuid(), v_bal_food_cat, v_bali_id, v_trip_id, 'Nasi goreng at a warung',   'Proper local version',        true,  NULL,    NULL,     false, 1),
  (gen_random_uuid(), v_bal_food_cat, v_bali_id, v_trip_id, 'Fresh coconuts on the beach','Every single day',           true,  NULL,    NULL,     false, 2),
  (gen_random_uuid(), v_bal_food_cat, v_bali_id, v_trip_id, 'Bebek betutu',              'Smoked duck, Balinese style', true,  NULL,    NULL,     false, 3),
  (gen_random_uuid(), v_bal_food_cat, v_bali_id, v_trip_id, 'Kopi Luwak (civet coffee)', 'Ubud coffee plantation',      false, NULL,    NULL,     false, 4);

-- BALI — Sights
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_ba_s1, v_bal_sight_cat, v_bali_id, v_trip_id, 'Ubud Monkey Forest',       'Free-roaming macaques',           true, -8.5191,  115.2588, true, 0),
  (v_ba_s2, v_bal_sight_cat, v_bali_id, v_trip_id, 'Tegallalang Rice Terraces','Best in the morning light',       true, -8.4319,  115.2773, true, 1),
  (v_ba_s3, v_bal_sight_cat, v_bali_id, v_trip_id, 'Tanah Lot Temple',         'Sea temple at sunset',            true, -8.6215,  115.0866, true, 2),
  (v_ba_s4, v_bal_sight_cat, v_bali_id, v_trip_id, 'Uluwatu Temple',           'Cliffside, fire dance at sunset', true, -8.8291,  115.0849, true, 3),
  (v_ba_s5, v_bal_sight_cat, v_bali_id, v_trip_id, 'Mount Batur sunrise hike', '3 AM start, worth it',            true, -8.2421,  115.3750, true, 4),
  (v_ba_s6, v_bal_sight_cat, v_bali_id, v_trip_id, 'Canggu surf',              'Echo Beach, beginner-friendly',   true, -8.6463,  115.1389, true, 5),
  (v_ba_s7, v_bal_sight_cat, v_bali_id, v_trip_id, 'Seminyak',                 'Upscale beach clubs',             true, -8.6897,  115.1602, true, 6);

-- BALI — Nightlife
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_ba_n1,           v_bal_night_cat, v_bali_id, v_trip_id, 'Potato Head Beach Club', 'Iconic Seminyak sunset',         true,  -8.6888, 115.1548, true,  0),
  (v_ba_n2,           v_bal_night_cat, v_bali_id, v_trip_id, 'Single Fin (Uluwatu)',   'Sunday sessions with surf view', true,  -8.8211, 115.0881, true,  1),
  (v_ba_n3,           v_bal_night_cat, v_bali_id, v_trip_id, 'La Favela',              'Jungle bar, late night',          true,  -8.6918, 115.1584, true,  2),
  (gen_random_uuid(), v_bal_night_cat, v_bali_id, v_trip_id, 'Sky Garden Kuta',        'Multi-floor, budget-friendly',   false, NULL,    NULL,     false, 3);

-- HANOI — Food
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_hn_f1,           v_han_food_cat, v_hanoi_id, v_trip_id, 'Phở Thìn',                  'The original bowl',                     true,  21.0308, 105.8443, true,  0),
  (gen_random_uuid(), v_han_food_cat, v_hanoi_id, v_trip_id, 'Bún chả Hương Liên',        'Obama''s spot — grilled pork + noodles', true,  21.0215, 105.8482, true,  1),
  (v_hn_f3,           v_han_food_cat, v_hanoi_id, v_trip_id, 'Egg coffee (cà phê trứng)', 'Giang Café in Old Quarter',             true,  21.0349, 105.8511, true,  2),
  (gen_random_uuid(), v_han_food_cat, v_hanoi_id, v_trip_id, 'Bánh mì at Bánh Mì 25',    'Best bánh mì in the city',              true,  21.0329, 105.8490, true,  3),
  (gen_random_uuid(), v_han_food_cat, v_hanoi_id, v_trip_id, 'Bia hơi (fresh draft beer)','Junction of Tạ Hiện St',               true,  NULL,    NULL,     false, 4);

-- HANOI — Sights
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_hn_s1,           v_han_sight_cat, v_hanoi_id, v_trip_id, 'Hoan Kiem Lake',         'Turtle Tower, morning tai chi',       true,  21.0285, 105.8520, true,  0),
  (gen_random_uuid(), v_han_sight_cat, v_hanoi_id, v_trip_id, 'Old Quarter walk',       '36 trading streets',                  true,  21.0342, 105.8487, true,  1),
  (v_hn_s3,           v_han_sight_cat, v_hanoi_id, v_trip_id, 'Ho Chi Minh Mausoleum', 'Closed Mondays, dress conservatively', true,  21.0365, 105.8349, true,  2),
  (gen_random_uuid(), v_han_sight_cat, v_hanoi_id, v_trip_id, 'Temple of Literature',   'Vietnam''s first university',         true,  21.0236, 105.8355, true,  3),
  (v_hn_s5,           v_han_sight_cat, v_hanoi_id, v_trip_id, 'Ha Giang Loop 🏍️',      '4 days, motorbike, insane scenery',   true,  22.8232, 104.9836, true,  4),
  (gen_random_uuid(), v_han_sight_cat, v_hanoi_id, v_trip_id, 'Hoa Lo Prison',          'Hanoi Hilton — sobering',             false, 21.0347, 105.8436, true,  5);

-- HANOI — Nightlife
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (gen_random_uuid(), v_han_night_cat, v_hanoi_id, v_trip_id, 'Tạ Hiện St bia hơi corner', '$0.30 beers, street plastic stools', true,  21.0356, 105.8516, true,  0),
  (gen_random_uuid(), v_han_night_cat, v_hanoi_id, v_trip_id, 'Bùi Viện (backpacker street)','Lively but touristy',             true,  NULL,    NULL,     false, 1),
  (gen_random_uuid(), v_han_night_cat, v_hanoi_id, v_trip_id, 'Hanoi Social Club',         'Chill rooftop bar',                 false, NULL,    NULL,     false, 2);

-- DA NANG — Food
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_dn_f1,           v_dan_food_cat, v_danang_id, v_trip_id, 'Cao lầu (Hoi An noodles)',     'Only authentic in Hoi An',   true,  15.8801, 108.3380, true,  0),
  (gen_random_uuid(), v_dan_food_cat, v_danang_id, v_trip_id, 'White rose dumplings (Hoi An)','Delicate rice paper',        true,  15.8801, 108.3380, true,  1),
  (gen_random_uuid(), v_dan_food_cat, v_danang_id, v_trip_id, 'Bánh xèo (sizzling crepe)',    'Crispy rice flour crepe',    true,  NULL,    NULL,     false, 2),
  (v_dn_f4,           v_dan_food_cat, v_danang_id, v_trip_id, 'Mi Quang noodle soup',         'Da Nang specialty',          true,  NULL,    NULL,     false, 3);

-- DA NANG — Sights
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_dn_s1,           v_dan_sight_cat, v_danang_id, v_trip_id, 'Hoi An Ancient Town',         'Lantern-lit UNESCO old town',      true,  15.8801, 108.3380, true,  0),
  (v_dn_s2,           v_dan_sight_cat, v_danang_id, v_trip_id, 'My Khe Beach',                'Beautiful beach right in Da Nang', true,  16.0666, 108.2469, true,  1),
  (v_dn_s3,           v_dan_sight_cat, v_danang_id, v_trip_id, 'Golden Bridge (Bà Nà Hills)', 'The hands bridge — stunning',      true,  15.9970, 107.9892, true,  2),
  (gen_random_uuid(), v_dan_sight_cat, v_danang_id, v_trip_id, 'Marble Mountains',            'Caves, temples, views',            false, 15.9733, 108.2645, true,  3);

-- DA NANG — Nightlife
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (gen_random_uuid(), v_dan_night_cat, v_danang_id, v_trip_id, 'Hoi An lantern boat cruise', 'Magical at night',    true,  15.8801, 108.3380, true,  0),
  (gen_random_uuid(), v_dan_night_cat, v_danang_id, v_trip_id, 'An Thuong Beach bars',       'Chill sunset drinks', true,  NULL,    NULL,     false, 1);

-- HO CHI MINH CITY — Food
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (gen_random_uuid(), v_hmc_food_cat, v_hcmc_id, v_trip_id, 'Com tam (broken rice)',          'Street stall, authentic', true,  NULL,    NULL,     false, 0),
  (v_hc_f2,           v_hmc_food_cat, v_hcmc_id, v_trip_id, 'Ben Thanh Market food hall',    'Sample everything',       true,  10.7723, 106.6982, true,  1),
  (gen_random_uuid(), v_hmc_food_cat, v_hcmc_id, v_trip_id, 'Bánh mì at Bánh Mì Huynh Hoa', 'Best in the south',       true,  10.7736, 106.6894, true,  2),
  (gen_random_uuid(), v_hmc_food_cat, v_hcmc_id, v_trip_id, 'Fresh spring rolls (gỏi cuốn)','Light, bright, healthy',  true,  NULL,    NULL,     false, 3);

-- HO CHI MINH CITY — Sights
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_hc_s1,           v_hmc_sight_cat, v_hcmc_id, v_trip_id, 'War Remnants Museum',          'Powerful, bring tissues',         true,  10.7797, 106.6943, true,  0),
  (gen_random_uuid(), v_hmc_sight_cat, v_hcmc_id, v_trip_id, 'Ben Thanh Market',             'Huge, chaotic, great',            true,  10.7723, 106.6982, true,  1),
  (v_hc_s3,           v_hmc_sight_cat, v_hcmc_id, v_trip_id, 'Cu Chi Tunnels',               'Viet Cong tunnel system',         true,  11.0676, 106.4671, true,  2),
  (v_hc_s4,           v_hmc_sight_cat, v_hcmc_id, v_trip_id, 'Reunification Palace',         '1975 surrender location',         true,  10.7769, 106.6956, true,  3),
  (gen_random_uuid(), v_hmc_sight_cat, v_hcmc_id, v_trip_id, 'Notre-Dame Cathedral Saigon',  'French colonial architecture',    false, 10.7798, 106.6990, true,  4);

-- HO CHI MINH CITY — Nightlife
INSERT INTO checklist_items (id, category_id, city_id, trip_id, name, notes, completed, lat, lng, has_location, sort_order) VALUES
  (v_hc_n1,           v_hmc_night_cat, v_hcmc_id, v_trip_id, 'Bui Vien Walking Street',    'Backpacker strip, chaotic fun', true,  10.7671, 106.6924, true,  0),
  (gen_random_uuid(), v_hmc_night_cat, v_hcmc_id, v_trip_id, 'Saigon Saigon Rooftop Bar',  'Colonial Caravelle Hotel',      true,  NULL,    NULL,     false, 1);

-- ── Schedule Days ────────────────────────────────────────────
INSERT INTO schedule_days (id, city_id, trip_id, day_label, title) VALUES
  (v_td1,   v_tokyo_id,   v_trip_id, 'May 14',    'Arrive Tokyo'),
  (v_td2,   v_tokyo_id,   v_trip_id, 'May 15',    'Classic Tokyo'),
  (v_td3,   v_tokyo_id,   v_trip_id, 'May 16',    'DisneySea'),
  (v_td4,   v_tokyo_id,   v_trip_id, 'May 17',    'Parks & Culture'),
  (v_td5,   v_tokyo_id,   v_trip_id, 'May 25–26', 'Return to Tokyo'),
  (v_kd1,   v_kyoto_id,   v_trip_id, 'May 18',    'Arrive Kyoto'),
  (v_kd2,   v_kyoto_id,   v_trip_id, 'May 19',    'Bamboo & Gold'),
  (v_kd3,   v_kyoto_id,   v_trip_id, 'May 20',    'Nara Day Trip'),
  (v_od1,   v_osaka_id,   v_trip_id, 'May 21',    'Arrive Osaka'),
  (v_od2,   v_osaka_id,   v_trip_id, 'May 22',    'Universal Studios'),
  (v_od3,   v_osaka_id,   v_trip_id, 'May 23',    'City Day'),
  (v_sd1,   v_seoul_id,   v_trip_id, 'May 29',    'Arrive Seoul'),
  (v_sd2,   v_seoul_id,   v_trip_id, 'May 30',    'Palaces & Busan Prep'),
  (v_sd3,   v_seoul_id,   v_trip_id, 'Jun 3',     'Return to Seoul'),
  (v_bd1,   v_busan_id,   v_trip_id, 'May 30–31', 'Arrive + Beaches'),
  (v_bd2,   v_busan_id,   v_trip_id, 'Jun 1–2',   'Temple + Market'),
  (v_sgd1,  v_sg_city_id, v_trip_id, 'Jun 4',     'Arrive Singapore'),
  (v_sgd2,  v_sg_city_id, v_trip_id, 'Jun 5',     'Food + Fly to Bali'),
  (v_bald1, v_bali_id,    v_trip_id, 'Jun 5–7',   'Arrive + South Bali'),
  (v_bald2, v_bali_id,    v_trip_id, 'Jun 8–10',  'Ubud'),
  (v_bald3, v_bali_id,    v_trip_id, 'Jun 11–13', 'Uluwatu'),
  (v_bald4, v_bali_id,    v_trip_id, 'Jun 14–17', 'Canggu + Wind Down'),
  (v_hnd1,  v_hanoi_id,   v_trip_id, 'Jun 18',    'Arrive Hanoi Late'),
  (v_hnd2,  v_hanoi_id,   v_trip_id, 'Jun 19–22', 'Ha Giang Loop 🏍️'),
  (v_hnd3,  v_hanoi_id,   v_trip_id, 'Jun 23–24', 'Hanoi City Days'),
  (v_dnd1,  v_danang_id,  v_trip_id, 'Jun 25',    'Fly In + Hoi An'),
  (v_dnd2,  v_danang_id,  v_trip_id, 'Jun 26',    'Fly to HCMC'),
  (v_hcd1,  v_hcmc_id,    v_trip_id, 'Jun 26',    'Arrive HCMC'),
  (v_hcd2,  v_hcmc_id,    v_trip_id, 'Jun 27',    'Last Day — Fly to Taipei');

-- ── Schedule Day Items ───────────────────────────────────────

-- Tokyo — May 14 (Arrive Tokyo)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_td1, NULL,    'Check in Shinjuku, explore',  'Afternoon', true,  0),
  (gen_random_uuid(), v_td1, v_tk_n2, 'Omoide Yokocho for yakitori', 'Evening',   false, 1),
  (gen_random_uuid(), v_td1, v_tk_n1, 'Golden Gai bar hop',          'Night',     false, 2);

-- Tokyo — May 15 (Classic Tokyo)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_td2, v_tk_s1, 'Senso-ji Temple & Asakusa', 'Morning',   false, 0),
  (gen_random_uuid(), v_td2, v_tk_s6, 'Akihabara',                  'Afternoon', false, 1),
  (gen_random_uuid(), v_td2, v_tk_s2, 'Shibuya Crossing',           'Evening',   false, 2),
  (gen_random_uuid(), v_td2, v_tk_f1, 'Ramen at Ichiran',           'Night',     false, 3);

-- Tokyo — May 16 (DisneySea)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_td3, v_tk_s5, 'Tokyo DisneySea 🎟', 'All day', false, 0);

-- Tokyo — May 17 (Parks & Culture)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_td4, v_tk_s7, 'Meiji Shrine',       'Morning',   false, 0),
  (gen_random_uuid(), v_td4, v_tk_s3, 'Shinjuku Gyoen',     'Afternoon', false, 1),
  (gen_random_uuid(), v_td4, v_tk_s4, 'teamLab Borderless', 'Evening',   false, 2);

-- Tokyo — May 25–26 (Return to Tokyo)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_td5, v_tk_f2, 'Tsukiji Market breakfast',   'Day 1', false, 0),
  (gen_random_uuid(), v_td5, v_tk_s8, 'Tokyo Tower',                'Day 1', false, 1),
  (gen_random_uuid(), v_td5, v_tk_f6, 'Harajuku crepes + shopping', 'Day 2', false, 2);

-- Kyoto — May 18 (Arrive Kyoto)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_kd1, v_ky_s1, 'Fushimi Inari at dawn',    'Morning',   false, 0),
  (gen_random_uuid(), v_kd1, v_ky_f1, 'Nishiki Market',           'Afternoon', false, 1),
  (gen_random_uuid(), v_kd1, v_ky_n1, 'Gion district + Pontocho', 'Evening',   false, 2);

-- Kyoto — May 19 (Bamboo & Gold)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_kd2, v_ky_s2, 'Arashiyama Bamboo Grove',      'Morning',   false, 0),
  (gen_random_uuid(), v_kd2, v_ky_s3, 'Kinkaku-ji (Golden Pavilion)', 'Afternoon', false, 1),
  (gen_random_uuid(), v_kd2, v_ky_s5, 'Philosopher''s Path walk',     'Evening',   false, 2);

-- Kyoto — May 20 (Nara Day Trip)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_kd3, v_ky_s6, 'Nara deer park day trip',       'All day', false, 0),
  (gen_random_uuid(), v_kd3, v_ky_f3, 'Back to Kyoto, kaiseki dinner', 'Evening', false, 1);

-- Osaka — May 21 (Arrive Osaka)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_od1, v_os_s1, 'Dotonbori + street food', 'Afternoon', false, 0),
  (gen_random_uuid(), v_od1, v_os_f1, 'Takoyaki + Okonomiyaki',  'Evening',   false, 1),
  (gen_random_uuid(), v_od1, v_os_n1, 'Amerikamura bars',         'Night',     false, 2);

-- Osaka — May 22 (Universal Studios)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_od2, v_os_s3, 'Universal Studios Japan 🎟', 'All day', false, 0);

-- Osaka — May 23 (City Day)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_od3, v_os_s2, 'Osaka Castle',            'Morning',   false, 0),
  (gen_random_uuid(), v_od3, v_os_f4, 'Kuromon Market',          'Afternoon', false, 1),
  (gen_random_uuid(), v_od3, v_os_f3, 'Kushikatsu in Shinsekai', 'Afternoon', false, 2);

-- Seoul — May 29 (Arrive Seoul)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_sd1, v_se_s4, 'Check in, Hongdae explore', 'Afternoon', false, 0),
  (gen_random_uuid(), v_sd1, v_se_f1, 'Korean BBQ dinner',         'Evening',   false, 1),
  (gen_random_uuid(), v_sd1, v_se_n1, 'Hongdae clubs',             'Night',     false, 2);

-- Seoul — May 30 (Palaces & Busan Prep)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_sd2, v_se_s1, 'Gyeongbokgung Palace',  'Morning',   false, 0),
  (gen_random_uuid(), v_sd2, v_se_s3, 'Bukchon Hanok Village', 'Afternoon', false, 1),
  (gen_random_uuid(), v_sd2, NULL,    'KTX → Busan',           'Evening',   true,  2);

-- Seoul — Jun 3 (Return to Seoul)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_sd3, NULL,    'KTX Busan → Seoul', 'Morning',   true,  0),
  (gen_random_uuid(), v_sd3, v_se_s2, 'N Seoul Tower',     'Afternoon', false, 1),
  (gen_random_uuid(), v_sd3, v_se_n2, 'Itaewon crawl',     'Night',     false, 2);

-- Busan — May 30–31 (Arrive + Beaches)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_bd1, v_bu_s1, 'Arrive KTX, Haeundae Beach', 'Afternoon', false, 0),
  (gen_random_uuid(), v_bd1, v_bu_s2, 'Gamcheon Culture Village',   'Day 2',     false, 1),
  (gen_random_uuid(), v_bd1, v_bu_s4, 'Gwangalli Beach at night',   'Day 2 Eve', false, 2);

-- Busan — Jun 1–2 (Temple + Market)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_bd2, v_bu_s3, 'Haedong Yonggungsa Temple', 'Morning',   false, 0),
  (gen_random_uuid(), v_bd2, v_bu_f1, 'Jagalchi Market feast',     'Afternoon', false, 1),
  (gen_random_uuid(), v_bd2, v_bu_s1, 'Chill at Haeundae',         'Last day',  false, 2);

-- Singapore — Jun 4 (Arrive Singapore)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_sgd1, NULL,    'Fly in from Seoul',           'Morning',   true,  0),
  (gen_random_uuid(), v_sgd1, v_sg_s2, 'Marina Bay Sands + Merlion', 'Afternoon', false, 1),
  (gen_random_uuid(), v_sgd1, v_sg_s1, 'Gardens by the Bay',         'Evening',   false, 2),
  (gen_random_uuid(), v_sgd1, v_sg_n1, 'Clarke Quay',                'Night',     false, 3);

-- Singapore — Jun 5 (Food + Fly to Bali)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_sgd2, v_sg_f5, 'Kaya toast breakfast',                'Morning',   false, 0),
  (gen_random_uuid(), v_sgd2, v_sg_f1, 'Maxwell Hawker Centre (chicken rice)', 'Midday',    false, 1),
  (gen_random_uuid(), v_sgd2, NULL,    'Fly SIN → Bali (Denpasar)',            'Afternoon', true,  2);

-- Bali — Jun 5–7 (Arrive + South Bali)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_bald1, v_ba_s7, 'Settle into Seminyak/Canggu', 'Arrive', false, 0),
  (gen_random_uuid(), v_bald1, v_ba_n1, 'Potato Head sunset session',  'Day 2',  false, 1),
  (gen_random_uuid(), v_bald1, v_ba_s3, 'Tanah Lot Temple at sunset',  'Day 3',  false, 2);

-- Bali — Jun 8–10 (Ubud)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_bald2, v_ba_s1, 'Monkey Forest + Ubud market', 'Day 1', false, 0),
  (gen_random_uuid(), v_bald2, v_ba_f1, 'Babi guling at Ibu Oka',      'Day 1', false, 1),
  (gen_random_uuid(), v_bald2, v_ba_s2, 'Tegallalang Rice Terraces',   'Day 2', false, 2);

-- Bali — Jun 11–13 (Uluwatu)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_bald3, v_ba_s4, 'Uluwatu Temple fire dance',      'Day 1', false, 0),
  (gen_random_uuid(), v_bald3, v_ba_n2, 'Single Fin Sunday session',      'Day 2', false, 1),
  (gen_random_uuid(), v_bald3, v_ba_s5, 'Mount Batur sunrise hike (3 AM)','Day 3', false, 2);

-- Bali — Jun 14–17 (Canggu + Wind Down)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_bald4, v_ba_s6, 'Surf at Echo Beach, Canggu',    'Daily',     false, 0),
  (gen_random_uuid(), v_bald4, v_ba_n3, 'La Favela, beach clubs, relax', 'Last days', false, 1);

-- Hanoi — Jun 18 (Arrive Hanoi Late)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_hnd1, NULL, 'Fly Bali → HCMC → Hanoi', 'Night',  true, 0),
  (gen_random_uuid(), v_hnd1, NULL, 'Check in Old Quarter',     'Arrive', true, 1);

-- Hanoi — Jun 19–22 (Ha Giang Loop)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_hnd2, v_hn_s5, 'Hanoi → Ha Giang by bus',                     'Day 1',    false, 0),
  (gen_random_uuid(), v_hnd2, v_hn_s5, 'Ha Giang Loop: Ma Pi Leng Pass, Dong Van',    'Days 2–3', false, 1),
  (gen_random_uuid(), v_hnd2, v_hn_s5, 'Return to Hanoi',                              'Day 4',    false, 2);

-- Hanoi — Jun 23–24 (Hanoi City Days)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_hnd3, v_hn_f1, 'Phở Thìn breakfast',           'Morning',   false, 0),
  (gen_random_uuid(), v_hnd3, v_hn_s1, 'Hoan Kiem Lake + Old Quarter', 'Morning',   false, 1),
  (gen_random_uuid(), v_hnd3, v_hn_s3, 'Ho Chi Minh Mausoleum',        'Afternoon', false, 2),
  (gen_random_uuid(), v_hnd3, v_hn_f3, 'Egg coffee + bia hơi corner',  'Evening',   false, 3);

-- Da Nang — Jun 25 (Fly In + Hoi An)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_dnd1, NULL,    'Fly Hanoi → Da Nang',                'Morning',   true,  0),
  (gen_random_uuid(), v_dnd1, v_dn_s2, 'My Khe Beach',                       'Afternoon', false, 1),
  (gen_random_uuid(), v_dnd1, v_dn_s3, 'Golden Bridge (Ba Na Hills)',         'Afternoon', false, 2),
  (gen_random_uuid(), v_dnd1, v_dn_s1, 'Hoi An Ancient Town + lanterns',     'Evening',   false, 3),
  (gen_random_uuid(), v_dnd1, v_dn_f1, 'Cao lầu + white rose dumplings',     'Dinner',    false, 4);

-- Da Nang — Jun 26 (Fly to HCMC)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_dnd2, v_dn_f4, 'Mi Quang breakfast',                        'Morning',   false, 0),
  (gen_random_uuid(), v_dnd2, NULL,    'Evening flight Da Nang → Ho Chi Minh City', 'Afternoon', true,  1);

-- HCMC — Jun 26 (Arrive HCMC)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_hcd1, NULL,    'Arrive from Da Nang',     'Morning',   true,  0),
  (gen_random_uuid(), v_hcd1, v_hc_s1, 'War Remnants Museum',    'Afternoon', false, 1),
  (gen_random_uuid(), v_hcd1, v_hc_s4, 'Reunification Palace',   'Afternoon', false, 2),
  (gen_random_uuid(), v_hcd1, v_hc_n1, 'Bui Vien street scene',  'Evening',   false, 3);

-- HCMC — Jun 27 (Last Day — Fly to Taipei)
INSERT INTO schedule_day_items (id, day_id, checklist_item_id, name, time, done, sort_order) VALUES
  (gen_random_uuid(), v_hcd2, v_hc_s3, 'Cu Chi Tunnels day tour',    'Morning',   false, 0),
  (gen_random_uuid(), v_hcd2, v_hc_f2, 'Ben Thanh Market + bánh mì', 'Afternoon', false, 1),
  (gen_random_uuid(), v_hcd2, NULL,    'Fly HCMC → Taipei ✈️',       'Night',     true,  2);

-- ── Bookings ─────────────────────────────────────────────────
INSERT INTO bookings (id, trip_id, name, notes, is_urgent, completed, is_transport, sort_order) VALUES
  (gen_random_uuid(), v_trip_id, 'Japan Rail Pass (JR Pass)',          'Buy before leaving — can''t buy in Japan', true,  true, false,  0),
  (gen_random_uuid(), v_trip_id, 'teamLab Borderless tickets',         'Sells out weeks ahead',                    true,  true, false,  1),
  (gen_random_uuid(), v_trip_id, 'Tokyo DisneySea tickets',            'Date-specific entry',                      true,  true, false,  2),
  (gen_random_uuid(), v_trip_id, 'Universal Studios Japan 🎟',         'Harry Potter express pass',                false, true, false,  3),
  (gen_random_uuid(), v_trip_id, 'Ha Giang Loop guide/motorbike',      'Book 1–2 weeks ahead',                    false, true, false,  4),
  (gen_random_uuid(), v_trip_id, 'Mount Batur sunrise hike guide',     'Mandatory guided hike',                   false, true, false,  5),
  (gen_random_uuid(), v_trip_id, 'Gardens by the Bay (Cloud Forest)', '',                                         false, true, false,  6),
  (gen_random_uuid(), v_trip_id, 'Cu Chi Tunnels tour',                'Half day from HCMC',                      false, true, false,  7);

-- ── Transport ────────────────────────────────────────────────
INSERT INTO bookings (id, trip_id, name, notes, is_urgent, completed, is_transport, sort_order) VALUES
  (gen_random_uuid(), v_trip_id, '✈️ FLL → Montreal → Tokyo (Narita)', 'May 13–14, long travel day',          false, true, true,  0),
  (gen_random_uuid(), v_trip_id, '🚄 Shinkansen Tokyo → Kyoto',         'May 18, ~2h 20m Nozomi',             false, true, true,  1),
  (gen_random_uuid(), v_trip_id, '🚄 Train Kyoto → Osaka',              'May 21, ~15 min JR or Hankyu',       false, true, true,  2),
  (gen_random_uuid(), v_trip_id, '🚄 Shinkansen Osaka → Tokyo',         'May 25, return for last Tokyo days',  false, true, true,  3),
  (gen_random_uuid(), v_trip_id, '✈️ Tokyo → Seoul (Incheon)',          'May 28',                              false, true, true,  4),
  (gen_random_uuid(), v_trip_id, '🚄 KTX Seoul → Busan',                'May 30, ~2h 40m',                    false, true, true,  5),
  (gen_random_uuid(), v_trip_id, '🚄 KTX Busan → Seoul',                'Jun 3, return',                      false, true, true,  6),
  (gen_random_uuid(), v_trip_id, '✈️ Seoul → Singapore',                'Jun 4',                               false, true, true,  7),
  (gen_random_uuid(), v_trip_id, '✈️ Singapore → Bali (Denpasar)',      'Jun 5',                               false, true, true,  8),
  (gen_random_uuid(), v_trip_id, '✈️ Bali → Ho Chi Minh City → Hanoi', 'Jun 18, long travel day',             false, true, true,  9),
  (gen_random_uuid(), v_trip_id, '✈️ Hanoi → Da Nang',                  'Jun 25 morning',                     false, true, true, 10),
  (gen_random_uuid(), v_trip_id, '✈️ Da Nang → Ho Chi Minh City',      'Jun 25 evening',                      false, true, true, 11),
  (gen_random_uuid(), v_trip_id, '✈️ Ho Chi Minh City → Taipei',       'Jun 27, onward to home',              false, true, true, 12);

END $$;
