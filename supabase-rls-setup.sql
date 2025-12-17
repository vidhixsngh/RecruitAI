-- ============================================
-- SUPABASE ROW LEVEL SECURITY (RLS) SETUP
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================

-- STEP 1: Add user_id columns to tables
-- ============================================

-- Add user_id to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 2: Create indexes for better performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);

-- STEP 3: Update existing data with your current user ID
-- ============================================
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- Find your user ID in: Supabase Dashboard → Authentication → Users → Copy your ID

UPDATE candidates SET user_id = '9e6044fa-bc25-402d-9763-3280cfbdf4da' WHERE user_id IS NULL;
UPDATE jobs SET user_id = '9e6044fa-bc25-402d-9763-3280cfbdf4da' WHERE user_id IS NULL;

-- STEP 4: Enable Row Level Security
-- ============================================

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create RLS Policies for CANDIDATES table
-- ============================================

-- Policy: Users can view only their own candidates
CREATE POLICY "Users can view their own candidates"
ON candidates
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own candidates
CREATE POLICY "Users can insert their own candidates"
ON candidates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own candidates
CREATE POLICY "Users can update their own candidates"
ON candidates
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own candidates
CREATE POLICY "Users can delete their own candidates"
ON candidates
FOR DELETE
USING (auth.uid() = user_id);

-- STEP 6: Create RLS Policies for JOBS table
-- ============================================

-- Policy: Users can view only their own jobs
CREATE POLICY "Users can view their own jobs"
ON jobs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own jobs
CREATE POLICY "Users can insert their own jobs"
ON jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own jobs
CREATE POLICY "Users can update their own jobs"
ON jobs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own jobs
CREATE POLICY "Users can delete their own jobs"
ON jobs
FOR DELETE
USING (auth.uid() = user_id);

-- STEP 7: Allow public job applications (candidates can apply to any job)
-- ============================================

-- Policy: Anyone can view published jobs (for public job board)
CREATE POLICY "Anyone can view published jobs"
ON jobs
FOR SELECT
USING (status = 'open');

-- ============================================
-- VERIFICATION QUERIES (Run these to check)
-- ============================================

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('candidates', 'jobs');

-- Check policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('candidates', 'jobs');

-- ============================================
-- DONE! 
-- Next: Update your app code to include user_id
-- ============================================
