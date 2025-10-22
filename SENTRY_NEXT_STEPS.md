# Sentry Integration - Next Steps

## ✅ What's Been Completed

1. **Sentry SDK Installation**
   - Installed `@sentry/nextjs` version 7.114.0
   - Used `--legacy-peer-deps` flag for Next.js 15 compatibility

2. **Configuration Files Created**
   - `sentry.client.config.ts` - Client-side configuration with Session Replay
   - `sentry.server.config.ts` - Server-side configuration
   - `sentry.edge.config.ts` - Edge runtime configuration
   - `instrumentation.ts` - Server-side initialization
   - Updated `next.config.ts` with Sentry webpack plugin

3. **Documentation**
   - Created `SENTRY_SETUP.md` with complete setup instructions
   - Updated `README.md` with Sentry information
   - Added environment variable documentation

4. **Testing Tools**
   - Created `/sentry-test` page for manual testing
   - Created `/api/sentry-test-error` API route for server error testing

5. **Code Committed and Pushed**
   - All changes committed to Git
   - Pushed to main branch

## 🔲 What You Need to Do

### 1. Create Sentry Project (5 minutes)

Visit [https://sentry.io](https://sentry.io) and create the project:

1. **Log in** to your Sentry account
2. Click **Projects** → **Create Project**
3. Select:
   - Platform: **JavaScript**
   - Framework: **Next.js**
   - Team: **kylee-champion**
   - Project name: **kylee-blog**
4. Click **Create Project**

### 2. Get Your DSN (2 minutes)

After creating the project:

1. Copy the DSN that appears (format: `https://xxx@xxx.sentry.io/xxx`)
2. Or find it later at: **Settings** → **Projects** → **kylee-blog** → **Client Keys (DSN)**

### 3. Create Auth Token (3 minutes)

For source map uploads during builds:

1. Go to **Settings** → **Account** → **API** → **Auth Tokens**
2. Click **Create New Token**
3. Name: `kylee-blog-releases`
4. Scopes: Select:
   - ✅ `project:releases`
   - ✅ `org:read`
5. Click **Create Token**
6. **Copy the token** (you won't see it again!)

### 4. Add Environment Variables

#### For Local Development:

Create a `.env.local` file in the project root:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=your-dsn-from-step-2
SENTRY_AUTH_TOKEN=your-token-from-step-3
```

#### For Vercel (Production):

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables for **Production, Preview, and Development**:
   - `NEXT_PUBLIC_SENTRY_DSN` = (your DSN)
   - `SENTRY_AUTH_TOKEN` = (your auth token)

### 5. Test the Integration (5 minutes)

#### Local Testing:

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Visit: [http://localhost:3000/sentry-test](http://localhost:3000/sentry-test)

3. Click each test button and verify errors appear in Sentry

4. Check your Sentry dashboard:
   - Go to [https://tyler-harper.sentry.io/projects/kylee-blog/](https://tyler-harper.sentry.io/projects/kylee-blog/)
   - Look for the test errors in the **Issues** tab

#### Production Testing:

1. Deploy to Vercel (environment variables must be set!)
2. Visit your production URL + `/sentry-test`
3. Test the error buttons
4. Verify errors appear in Sentry

### 6. Clean Up (Optional)

After testing, you may want to:

1. Delete the test page: `src/app/sentry-test/page.tsx`
2. Delete the test API route: `src/app/api/sentry-test-error/route.ts`

Or keep them for future testing!

## 📊 What Sentry Will Track

Once configured, Sentry will automatically capture:

- ✅ **Unhandled JavaScript errors** in the browser
- ✅ **Unhandled promise rejections** 
- ✅ **API route errors** on the server
- ✅ **Performance metrics** (page load, API calls, etc.)
- ✅ **Session replays** (10% of sessions, 100% of error sessions)
- ✅ **Release information** (linked to your Git commits)

## 🎯 Recommended Configuration Adjustments

After testing, consider adjusting these values in production:

### In `sentry.client.config.ts`:

```typescript
tracesSampleRate: 0.1, // Sample 10% of transactions (not 100%)
replaysSessionSampleRate: 0.05, // Sample 5% of sessions
```

### In `sentry.server.config.ts`:

```typescript
tracesSampleRate: 0.1, // Sample 10% of server transactions
```

This will reduce your Sentry event usage while still catching errors.

## 📚 Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Your Sentry Dashboard](https://tyler-harper.sentry.io/organizations/tyler-harper/projects/kylee-blog/)
- [Session Replay Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/session-replay/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/guides/nextjs/performance/)

## ❓ Need Help?

If you encounter any issues:

1. Check `SENTRY_SETUP.md` for detailed instructions
2. Verify environment variables are set correctly
3. Check the browser console for Sentry initialization messages
4. Review the [Sentry Next.js troubleshooting guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/troubleshooting/)

---

**Time Estimate**: ~15-20 minutes total to complete all steps

**Status**: Ready for you to create the Sentry project and add environment variables! 🚀

