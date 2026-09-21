/*
# Seed BhoomiSetu Sample Data

Populates all tables with demonstration data for SIH26019:
- 12 Indian states as regions
- Land metrics for each state across years 2019-2026
- ~48 evidence/research items across 6 topics
- 6 government projects with progress
- Forecast data for 2026-2030
- 4 policy levers with effectiveness parameters
- Full-text search vectors for evidence items

All values are illustrative sample data.
*/

-- 1. Regions (12 Indian states)
INSERT INTO regions (name, lat, lng) VALUES
  ('Andhra Pradesh', 15.9129, 79.7400),
  ('Assam', 26.2006, 92.9376),
  ('Bihar', 25.0961, 85.3131),
  ('Gujarat', 22.2587, 71.1924),
  ('Karnataka', 15.3173, 75.7139),
  ('Kerala', 10.8505, 76.2711),
  ('Madhya Pradesh', 22.9734, 78.6569),
  ('Maharashtra', 19.7515, 75.7139),
  ('Odisha', 20.9517, 85.0985),
  ('Punjab', 31.1471, 75.3412),
  ('Rajasthan', 27.0238, 74.2179),
  ('Uttar Pradesh', 26.8467, 80.9462)
ON CONFLICT (name) DO NOTHING;

-- 2. Land metrics for each region, years 2019-2026
DO $$
DECLARE
  r RECORD;
  yr INTEGER;
  idx INTEGER := 0;
  base_digitized DOUBLE PRECISION;
  base_disputes INTEGER;
  base_resolution INTEGER;
  base_women DOUBLE PRECISION;
  base_climate DOUBLE PRECISION;
  base_builtup DOUBLE PRECISION;
BEGIN
  FOR r IN SELECT id, name FROM regions ORDER BY name LOOP
    idx := idx + 1;
    FOR yr IN 2019..2026 LOOP
      base_digitized := 45 + (idx * 2) + (yr - 2019) * 4 + (idx % 3) * 1.5;
      base_disputes := GREATEST(50000, 200000 - (idx * 12000) - (yr - 2019) * 8000);
      base_resolution := GREATEST(600, 1300 - (idx * 20) - (yr - 2019) * 30);
      base_women := 10 + (idx % 4) * 1.5 + (yr - 2019) * 0.8;
      base_climate := 0.45 + (idx % 5) * 0.05 + (yr - 2019) * 0.01;
      base_builtup := 3.5 + (idx % 3) * 0.5 + (yr - 2019) * 0.3;

      INSERT INTO land_metrics (region_id, year, records_digitized_pct, pending_disputes, avg_resolution_days, women_owned_pct, climate_vuln_index, built_up_pct)
      VALUES (r.id, yr, ROUND(base_digitized::numeric, 1), base_disputes, base_resolution, ROUND(base_women::numeric, 1), ROUND(base_climate::numeric, 2), ROUND(base_builtup::numeric, 1))
      ON CONFLICT (region_id, year) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 3. Evidence items (48 items across 6 topics, 12 states)
DO $$
DECLARE
  topics TEXT[] := ARRAY[
    'Land records digitization',
    'Dispute resolution',
    'Women''s land rights',
    'Climate resilience',
    'Urban land use',
    'Tenancy and leasing'
  ];
  types TEXT[] := ARRAY['Policy brief', 'Dataset', 'Journal paper', 'Field study', 'Government report'];
  states TEXT[] := ARRAY[
    'Andhra Pradesh','Assam','Bihar','Gujarat','Karnataka','Kerala',
    'Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Uttar Pradesh'
  ];
  title_stems TEXT[][] := ARRAY[
    ARRAY['Survey record modernisation and cadastral accuracy in', 'Cost of record correction requests in', 'Digitised mutation turnaround times in'],
    ARRAY['Civil land litigation backlog patterns in', 'Mediation outcomes in boundary disputes in', 'Revenue court disposal rates in'],
    ARRAY['Joint titling uptake among rural households in', 'Inheritance recording practices for women in', 'Barriers to independent land titles for women in'],
    ARRAY['Flood exposure of agricultural holdings in', 'Drought risk and land use change in', 'Coastal erosion and tenure security in'],
    ARRAY['Peri-urban built-up expansion in', 'Master plan compliance of land conversions in', 'Informal settlement regularisation in'],
    ARRAY['Recorded tenancy arrangements among smallholders in', 'Lease formalisation and credit access in', 'Sharecropping documentation gaps in']
  ];
  t_idx INTEGER;
  i INTEGER;
  n INTEGER := 0;
  state_name TEXT;
  yr INTEGER;
  type_val TEXT;
  topic_val TEXT;
  title_val TEXT;
  summary_val TEXT;
  tags_val TEXT[];
  region_rec RECORD;
BEGIN
  FOR t_idx IN 1..6 LOOP
    topic_val := topics[t_idx];
    FOR i IN 0..7 LOOP
      n := n + 1;
      state_name := states[((n * 5) % 12) + 1];
      yr := 2017 + ((n * 3) % 9);
      type_val := types[(n % 5) + 1];
      title_val := title_stems[t_idx][(i % 3) + 1] || ' ' || state_name || ', ' || yr;
      summary_val := 'This ' || LOWER(type_val) || ' examines ' || LOWER(topic_val) || ' in ' || state_name ||
        ' using sample administrative records collected between ' || (yr - 2) || ' and ' || yr ||
        '. It reports district level variation, identifies the administrative steps that add the most delay, and lists options available to state revenue departments. All figures are illustrative sample data prepared for the SIH26019 prototype.';
      tags_val := ARRAY[
        SPLIT_PART(topic_val, ' ', 1),
        SPLIT_PART(state_name, ' ', 1),
        yr::TEXT,
        SPLIT_PART(type_val, ' ', 1)
      ];

      SELECT id INTO region_rec FROM regions WHERE name = state_name LIMIT 1;

      INSERT INTO evidence (title, summary, type, topic, tags, region_id, year, source, fts)
      VALUES (
        title_val,
        summary_val,
        type_val,
        topic_val,
        tags_val,
        region_rec.id,
        yr,
        'BhoomiSetu sample data',
        to_tsvector('english', title_val || ' ' || summary_val || ' ' || array_to_string(tags_val, ' '))
      )
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 4. Projects (6 government projects)
INSERT INTO projects (title, agency, scheme, region_id, status, progress_pct, start_year)
SELECT
  'Digital Land Records Modernisation Phase ' || v.num::TEXT,
  CASE v.num WHEN 1 THEN 'Department of Land Resources' WHEN 2 THEN 'Ministry of Rural Development' WHEN 3 THEN 'State Revenue Department' WHEN 4 THEN 'Ministry of Agriculture' WHEN 5 THEN 'Ministry of Environment' ELSE 'NITI Aayog' END,
  CASE v.num WHEN 1 THEN 'DILRMP' WHEN 2 THEN 'SVAMITVA' WHEN 3 THEN 'Land Pooling Scheme' WHEN 4 THEN 'Soil Health Card' WHEN 5 THEN 'Green India Mission' ELSE 'Digital India Land' END,
  r.id,
  CASE v.num WHEN 1 THEN 'active' WHEN 2 THEN 'active' WHEN 3 THEN 'planning' WHEN 4 THEN 'active' WHEN 5 THEN 'active' ELSE 'planning' END,
  CASE v.num WHEN 1 THEN 86 WHEN 2 THEN 72 WHEN 3 THEN 35 WHEN 4 THEN 64 WHEN 5 THEN 48 ELSE 12 END,
  CASE v.num WHEN 1 THEN 2016 WHEN 2 THEN 2020 WHEN 3 THEN 2024 WHEN 4 THEN 2018 WHEN 5 THEN 2019 ELSE 2025 END
FROM (VALUES (1),(2),(3),(4),(5),(6)) AS v(num)
JOIN regions r ON r.name = (ARRAY['Uttar Pradesh','Maharashtra','Bihar','Karnataka','Odisha','Rajasthan'])[v.num]
ON CONFLICT (id) DO NOTHING;

-- 5. Forecasts for 2026-2030 (digitization trend per region)
DO $$
DECLARE
  r RECORD;
  yr INTEGER;
  base_val DOUBLE PRECISION;
BEGIN
  FOR r IN SELECT id FROM regions ORDER BY name LOOP
    base_val := 85;
    FOR yr IN 2026..2030 LOOP
      base_val := base_val + 1.5;
      INSERT INTO forecasts (region_id, metric, year, value, method)
      VALUES (r.id, 'records_digitized_pct', yr, LEAST(99, ROUND(base_val::numeric, 1)), 'linear projection')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO forecasts (region_id, metric, year, value, method)
      VALUES (r.id, 'built_up_pct', yr, ROUND((7.0 + (yr - 2026) * 0.4)::numeric, 1), 'linear projection')
      ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 6. Policy levers (4 levers)
INSERT INTO policy_levers (name, description, eff_digitization, eff_disputes_pct, eff_resolution_days, eff_women_owned) VALUES
  ('Land records digitization', 'Accelerate survey record digitisation and mutation automation across states.', 22, -8, -120, 2),
  ('Dispute resolution fast-track', 'Establish dedicated revenue courts and mediation panels for land disputes.', 5, -34, -380, 1),
  ('Women''s land title drive', 'Joint titling mandates and subsidies for women-owned land registration.', 3, -5, -60, 42),
  ('Climate-resilient zoning', 'Flood and drought risk zoning integrated into land use approvals.', 2, -3, -40, 1)
ON CONFLICT (id) DO NOTHING;