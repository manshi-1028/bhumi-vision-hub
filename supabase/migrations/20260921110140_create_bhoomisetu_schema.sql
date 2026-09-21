/*
# BhoomiSetu Schema — Full Database Creation

## Overview
Creates all tables for the BhoomiSetu land governance platform (SIH26019).
This is a multi-user app with Supabase Auth: authenticated users submit research,
officials review submissions. Public pages (dashboard, library, about) are readable
by everyone including unauthenticated visitors.

## Tables Created
1. `regions` — Indian states/regions with coordinates
2. `land_metrics` — Yearly metrics per region (digitization, disputes, women-owned, climate, built-up)
3. `evidence` — Research repository items with full-text search support
4. `projects` — Government projects with progress tracking
5. `forecasts` — Forecasted metric values per region/year
6. `policy_levers` — Policy intervention options with effectiveness parameters
7. `profiles` — User profiles linked to auth.users with role (researcher/institution/official)
8. `submissions` — Research submissions pending review, linked to auth users

## Security (RLS)
- `regions`, `land_metrics`, `evidence`, `projects`, `forecasts`, `policy_levers`:
  Public read (anon + authenticated), no public write.
- `profiles`: Authenticated users can read all profiles (needed for role display).
  Users can update only their own profile.
- `submissions`: Authenticated users can create/read their own submissions.
  Officials can read all submissions and update status (approve/reject).
  A SECURITY DEFINER function enforces that only officials can change submission status.
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. regions
CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  lat double precision,
  lng double precision
);

-- 2. land_metrics
CREATE TABLE IF NOT EXISTS land_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  year integer NOT NULL,
  records_digitized_pct double precision,
  pending_disputes integer,
  avg_resolution_days integer,
  women_owned_pct double precision,
  climate_vuln_index double precision,
  built_up_pct double precision,
  UNIQUE(region_id, year)
);

-- 3. evidence
CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  type text,
  topic text,
  tags text[] DEFAULT '{}',
  region_id uuid REFERENCES regions(id) ON DELETE SET NULL,
  year integer,
  source text,
  created_at timestamptz DEFAULT now(),
  fts tsvector
);

-- 4. projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  agency text,
  scheme text,
  region_id uuid REFERENCES regions(id) ON DELETE SET NULL,
  status text,
  progress_pct integer,
  start_year integer
);

-- 5. forecasts
CREATE TABLE IF NOT EXISTS forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  metric text NOT NULL,
  year integer NOT NULL,
  value double precision,
  method text
);

-- 6. policy_levers
CREATE TABLE IF NOT EXISTS policy_levers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  eff_digitization double precision,
  eff_disputes_pct double precision,
  eff_resolution_days double precision,
  eff_women_owned double precision
);

-- 7. profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'researcher' CHECK (role IN ('researcher', 'institution', 'official')),
  created_at timestamptz DEFAULT now()
);

-- 8. submissions
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  topic text,
  body text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_land_metrics_region_year ON land_metrics(region_id, year);
CREATE INDEX IF NOT EXISTS idx_evidence_region ON evidence(region_id);
CREATE INDEX IF NOT EXISTS idx_evidence_topic ON evidence(topic);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence(type);
CREATE INDEX IF NOT EXISTS idx_evidence_fts ON evidence USING gin(fts);
CREATE INDEX IF NOT EXISTS idx_projects_region ON projects(region_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_region_year ON forecasts(region_id, year);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);

-- ===================== RLS =====================

-- regions: public read
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_regions" ON regions;
CREATE POLICY "public_read_regions" ON regions FOR SELECT TO anon, authenticated USING (true);

-- land_metrics: public read
ALTER TABLE land_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_land_metrics" ON land_metrics;
CREATE POLICY "public_read_land_metrics" ON land_metrics FOR SELECT TO anon, authenticated USING (true);

-- evidence: public read
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_evidence" ON evidence;
CREATE POLICY "public_read_evidence" ON evidence FOR SELECT TO anon, authenticated USING (true);

-- projects: public read
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT TO anon, authenticated USING (true);

-- forecasts: public read
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_forecasts" ON forecasts;
CREATE POLICY "public_read_forecasts" ON forecasts FOR SELECT TO anon, authenticated USING (true);

-- policy_levers: public read
ALTER TABLE policy_levers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_policy_levers" ON policy_levers;
CREATE POLICY "public_read_policy_levers" ON policy_levers FOR SELECT TO anon, authenticated USING (true);

-- profiles: authenticated can read all (needed for role display in UI), update own only
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_profiles" ON profiles;
CREATE POLICY "authenticated_read_profiles" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "user_update_own_profile" ON profiles;
CREATE POLICY "user_update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- submissions: users CRUD own; officials can read all and update status
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_select_own_submissions" ON submissions;
CREATE POLICY "user_select_own_submissions" ON submissions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "official_select_all_submissions" ON submissions;
CREATE POLICY "official_select_all_submissions" ON submissions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'official')
  );

DROP POLICY IF EXISTS "user_insert_own_submission" ON submissions;
CREATE POLICY "user_insert_own_submission" ON submissions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "official_update_submission_status" ON submissions;
CREATE POLICY "official_update_submission_status" ON submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'official')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'official')
  );

-- SECURITY DEFINER function: only officials can approve/reject submissions
-- This provides server-enforced access control beyond the RLS UPDATE policy
CREATE OR REPLACE FUNCTION approve_submission(p_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'official') THEN
    RAISE EXCEPTION 'Only officials can review submissions';
  END IF;
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE submissions SET status = p_status WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION approve_submission(uuid, text) TO authenticated;