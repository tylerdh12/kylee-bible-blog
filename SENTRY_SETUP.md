# Sentry Setup Guide

This document outlines the steps to complete the Sentry integration for the Kylee Blog project.

## 1. Create Sentry Project

1. Log in to your Sentry account at [https://sentry.io](https://sentry.io)
2. Navigate to Projects → Create Project
3. Select **JavaScript** as the platform
4. Choose **Next.js** as the framework
5. Assign the project to the **kylee-champion** team
6. Name the project: **kylee-blog**
7. Click "Create Project"

## 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file (or Vercel environment variables for production):

```bash
# Sentry Configuration
# Get your DSN from: https://sentry.io/settings/tyler-harper/projects/kylee-blog/keys/
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id

# Sentry Auth Token (for uploading source maps during build)
# Create at: https://sentry.io/settings/account/api/auth-tokens/
# Required permissions: project:releases, org:read
SENTRY_AUTH_TOKEN=your-sentry-auth-token-here
```

### Getting Your DSN:
1. Go to **Settings** → **Projects** → **kylee-blog**
2. Navigate to **Client Keys (DSN)**
3. Copy the DSN value

### Creating an Auth Token:
1. Go to **Settings** → **Account** → **API** → **Auth Tokens**
2. Click "Create New Token"
3. Name it: "kylee-blog-releases"
4. Select the following scopes:
   - `project:releases`
   - `org:read`
5. Click "Create Token" and copy the token value

## 3. Vercel Configuration

If deploying to Vercel, add the environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `NEXT_PUBLIC_SENTRY_DSN` (Production, Preview, Development)
   - `SENTRY_AUTH_TOKEN` (Production, Preview, Development)

## 4. Test the Integration

### Local Testing:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Trigger a test error by adding this to any page:
   ```javascript
   import * as Sentry from '@sentry/nextjs';
   
   // Add a button to trigger an error
   <button onClick={() => Sentry.captureException(new Error('Test Sentry Error'))}>
     Test Sentry
   </button>
   ```

3. Check your Sentry dashboard to confirm the error appears

### Production Testing:

1. Deploy to Vercel
2. Visit your production site
3. Trigger a test error
4. Check Sentry dashboard for the error

## 5. What's Already Configured

The following files have been created and configured:

- ✅ `sentry.client.config.ts` - Client-side Sentry configuration
- ✅ `sentry.server.config.ts` - Server-side Sentry configuration
- ✅ `sentry.edge.config.ts` - Edge runtime Sentry configuration
- ✅ `instrumentation.ts` - Server-side initialization
- ✅ `next.config.ts` - Updated with Sentry webpack plugin

## 6. Features Enabled

The Sentry integration includes the following features:

- **Error Tracking**: Automatic capture of errors and exceptions
- **Performance Monitoring**: Track application performance (100% sample rate in dev)
- **Session Replay**: Record user sessions for debugging (10% sample rate)
- **Source Maps**: Upload source maps for better error debugging
- **Release Tracking**: Track deployments and releases

## 7. Configuration Options

You can adjust the following settings in the Sentry config files:

### `sentry.client.config.ts`:
- `tracesSampleRate`: Percentage of transactions to track (0.0 to 1.0)
- `replaysSessionSampleRate`: Percentage of sessions to record (0.0 to 1.0)
- `replaysOnErrorSampleRate`: Percentage of error sessions to record (0.0 to 1.0)

### `sentry.server.config.ts`:
- `tracesSampleRate`: Percentage of server transactions to track (0.0 to 1.0)

## 8. Next Steps

1. [ ] Create the Sentry project in the Sentry UI
2. [ ] Add the `NEXT_PUBLIC_SENTRY_DSN` to your environment variables
3. [ ] Create and add the `SENTRY_AUTH_TOKEN` for source map uploads
4. [ ] Test the integration locally
5. [ ] Deploy to Vercel with the environment variables configured
6. [ ] Test in production

## 9. Troubleshooting

### Source Maps Not Uploading:
- Ensure `SENTRY_AUTH_TOKEN` is set correctly
- Check that the token has the correct permissions (`project:releases`, `org:read`)
- Verify the `org` and `project` names in `next.config.ts` match your Sentry project

### Errors Not Appearing:
- Verify `NEXT_PUBLIC_SENTRY_DSN` is set correctly
- Check browser console for Sentry initialization errors
- Ensure the DSN is publicly accessible (starts with `NEXT_PUBLIC_`)

### Build Errors:
- If you encounter peer dependency issues, the package was installed with `--legacy-peer-deps`
- This is normal for Next.js 15 as Sentry is catching up with support

## 10. Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io/organizations/tyler-harper/projects/kylee-blog/)
- [Sentry Performance Monitoring](https://docs.sentry.io/platforms/javascript/guides/nextjs/performance/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/guides/nextjs/session-replay/)

