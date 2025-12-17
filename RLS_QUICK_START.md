# 🚀 Quick Start: Enable Data Isolation

## What You Need to Do RIGHT NOW:

### 1. Get Your User ID (30 seconds)
```
Supabase Dashboard → Authentication → Users → Copy your ID
```

### 2. Run the SQL Script (2 minutes)
1. Open `supabase-rls-setup.sql`
2. Find lines 25-26, replace `YOUR_USER_ID_HERE` with your actual ID
3. Remove the `--` at the start of those lines
4. Copy entire file
5. Supabase Dashboard → SQL Editor → New Query → Paste → Run

### 3. Restart Your App
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 4. Test It
- Sign in → You should see your data
- Sign out → Sign in with different Google account → Should see ZERO data
- Each user now has their own isolated workspace!

## Files Created:
- ✅ `supabase-rls-setup.sql` - The SQL migration script
- ✅ `RLS_SETUP_GUIDE.md` - Detailed instructions
- ✅ `client/src/lib/supabase.ts` - Updated with user_id support

## That's It!
Your app now has complete data isolation. Each user only sees their own candidates and jobs.
