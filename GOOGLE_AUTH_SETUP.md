# Google Authentication Setup Guide

## Prerequisites
- Supabase project created
- Google Cloud Console account

## Step 1: Configure Google OAuth in Supabase

1. **Go to your Supabase Dashboard**
   - Navigate to: Authentication → Providers
   - Find "Google" in the list of providers

2. **Enable Google Provider**
   - Toggle "Enable Sign in with Google"
   - You'll need to add your Google OAuth credentials

## Step 2: Set up Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to: APIs & Services → Library
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to: APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Recruit AI" (or your app name)

4. **Configure Authorized Redirect URIs**
   Add these URLs:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   http://localhost:5000/dashboard (for local development)
   ```
   
   Replace `[YOUR-PROJECT-REF]` with your actual Supabase project reference.

5. **Copy Credentials**
   - Copy the "Client ID"
   - Copy the "Client Secret"

## Step 3: Add Credentials to Supabase

1. **Return to Supabase Dashboard**
   - Go to: Authentication → Providers → Google

2. **Paste Credentials**
   - Client ID: [paste your Google Client ID]
   - Client Secret: [paste your Google Client Secret]

3. **Save Changes**

## Step 4: Update Your .env File

Update your `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

You can find these values in:
- Supabase Dashboard → Settings → API

## Step 5: Test the Authentication

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Navigate to the login page**
   - Go to: http://localhost:5000/

3. **Click "Sign in with Google"**
   - You should be redirected to Google's OAuth consent screen
   - After signing in, you'll be redirected back to your dashboard

## Troubleshooting

### Issue: "Redirect URI mismatch"
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches:
```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

### Issue: "Access blocked: This app's request is invalid"
**Solution**: 
1. Make sure Google+ API is enabled
2. Verify OAuth consent screen is configured
3. Check that your app is not in "Testing" mode (or add your email as a test user)

### Issue: User data not showing correctly
**Solution**: The app will use the Google account's:
- Full name as username
- Email address
- Default company name and role (can be customized later)

## Security Notes

1. **Never commit your .env file** - It's already in .gitignore
2. **Use environment variables** for production deployment
3. **Keep your Supabase keys secure**
4. **Configure RLS policies** in Supabase for production use

## Next Steps

After authentication is working:
1. Set up Row Level Security (RLS) policies in Supabase
2. Customize user profile fields
3. Add role-based access control
4. Configure email templates in Supabase

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify all credentials are correct
4. Ensure redirect URIs match exactly
