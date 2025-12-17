# Row Level Security (RLS) Setup Guide

## 🎯 What This Does
Sets up data isolation so each user only sees their own candidates and jobs.

## 📋 Step-by-Step Instructions

### Step 1: Get Your User ID
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `ylwlgahsilakiuyrxwfp`
3. Click **Authentication** → **Users**
4. Find your email and **copy your User ID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 2: Run the SQL Migration
1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase-rls-setup.sql` in this project
4. **IMPORTANT:** Find these two lines (around line 25-26):
   ```sql
   -- UPDATE candidates SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;
   -- UPDATE jobs SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;
   ```
5. **Replace `YOUR_USER_ID_HERE` with your actual User ID** from Step 1
6. **Remove the `--` at the start** of both lines to uncomment them
7. Copy the ENTIRE SQL file content
8. Paste it into the Supabase SQL Editor
9. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify It Worked
Run these verification queries in the SQL Editor:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('candidates', 'jobs');
```

You should see `rowsecurity = true` for both tables.

```sql
-- Check your data has user_id
SELECT id, name, user_id FROM candidates LIMIT 5;
SELECT id, title, user_id FROM jobs LIMIT 5;
```

All rows should now have your user_id.

### Step 4: Test in Your App
1. Restart your dev server (if running)
2. Sign in to your app
3. You should see all your existing data
4. Create a new job or candidate - it will automatically include your user_id

### Step 5: Test with a Second User (Optional)
1. Sign out from your app
2. Sign in with a different Google account
3. You should see ZERO candidates and jobs (empty state)
4. Create some test data
5. Sign out and sign back in with your original account
6. You should NOT see the second user's data

## ✅ What's Protected Now

- ✅ Each user only sees their own candidates
- ✅ Each user only sees their own jobs
- ✅ Users cannot modify other users' data
- ✅ New candidates/jobs automatically get the user_id
- ✅ Public job applications still work (anyone can view open jobs)

## 🔧 Troubleshooting

### "No data showing after RLS setup"
- Make sure you ran the UPDATE queries with YOUR user ID
- Check if your user_id matches: Run `SELECT auth.uid()` in SQL Editor while logged in

### "Permission denied" errors
- RLS policies require authentication
- Make sure you're signed in
- Check browser console for auth errors

### "Still seeing other users' data"
- Clear browser cache and localStorage
- Sign out and sign back in
- Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('candidates', 'jobs')`

## 📝 What Changed in the Code

### Updated Files:
1. **client/src/lib/supabase.ts**
   - Added `user_id` to type definitions
   - `createJobInSupabase()` now automatically adds user_id
   - All queries now filtered by user_id (handled by RLS)

### Database Changes:
1. Added `user_id` column to `candidates` table
2. Added `user_id` column to `jobs` table
3. Enabled Row Level Security on both tables
4. Created policies for SELECT, INSERT, UPDATE, DELETE

## 🚀 Next Steps

After RLS is working:
- [ ] Test creating new jobs
- [ ] Test creating new candidates (via job applications)
- [ ] Test with a second user account
- [ ] Consider adding team/organization support later
