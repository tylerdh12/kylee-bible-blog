# Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables (Required in Vercel)

Set these in **Vercel Dashboard → Settings → Environment Variables**:

#### Database
```bash
DATABASE_URL="postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
```

#### Authentication (Better Auth)
```bash
# Required for Better Auth
BETTER_AUTH_SECRET="your-strong-secret-minimum-32-characters"
BETTER_AUTH_URL="https://your-domain.vercel.app"

# Required for client-side auth (React components)
NEXT_PUBLIC_BETTER_AUTH_URL="https://your-domain.vercel.app"
```

**Note**: 
- If `BETTER_AUTH_SECRET` is not set, the app will use `JWT_SECRET` as fallback, but it's recommended to set `BETTER_AUTH_SECRET` explicitly.
- `NEXT_PUBLIC_BETTER_AUTH_URL` must match `BETTER_AUTH_URL` exactly (no trailing slashes).
- Both should match your production domain exactly.

#### Email Service (Resend)
```bash
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="noreply@yourdomain.com"
# OR
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

**Note**: Resend is the email service used by this application. Free tier includes 3,000 emails/month.

#### Application Settings
```bash
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://your-domain.vercel.app"
```

**Note**: `NEXT_PUBLIC_SITE_URL` is used in settings and should match your production domain.

#### Legacy Support (Optional - for backward compatibility)
```bash
JWT_SECRET="your-strong-secret-minimum-32-characters"
NEXTAUTH_SECRET="your-strong-secret-minimum-32-characters"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### 2. Database Setup

#### Verify Database Connection
- ✅ Database URL is set correctly
- ✅ Database is accessible from Vercel's region
- ✅ SSL mode is enabled (`sslmode=require`)

#### Run Migrations
After first deployment, ensure Prisma migrations are applied:
```bash
# This runs automatically during build via postinstall script
# But verify in Vercel build logs that Prisma generated successfully
```

### 3. Build Configuration

#### Verify Build Settings
- ✅ `vercel.json` is configured correctly
- ✅ Build command: `npm run vercel-build`
- ✅ Install command includes `--legacy-peer-deps` for compatibility
- ✅ Node.js version: >=20.0.0 (specified in package.json)

#### Check Build Scripts
```json
{
  "vercel-build": "SKIP_ENV_VALIDATION=true NODE_OPTIONS='--max-old-space-size=4096' prisma generate && SKIP_ENV_VALIDATION=true NODE_OPTIONS='--max-old-space-size=4096' next build"
}
```

### 4. Email Configuration

#### Resend Setup (Recommended)
1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. Get your API key from dashboard
3. Add domain and verify ownership
4. Set `RESEND_API_KEY` in Vercel
5. Set `EMAIL_FROM` or `RESEND_FROM_EMAIL` to your verified domain

#### Testing Email
- Password reset emails will use Resend if configured
- In development, emails log to console with clickable links
- In production without email service, warnings are logged but app continues
- Sign up at [resend.com](https://resend.com) to get your API key

### 5. Security Checklist

- [ ] `BETTER_AUTH_SECRET` is set (minimum 32 characters)
- [ ] `BETTER_AUTH_URL` matches your production domain
- [ ] Database connection uses SSL (`sslmode=require`)
- [ ] No hardcoded secrets in code
- [ ] Admin user passwords are strong
- [ ] Rate limiting is configured (if needed)
- [ ] CORS is properly configured
- [ ] Security headers are set (configured in vercel.json)

### 6. Admin User Setup

#### Option 1: Via Admin Page (Recommended)
1. Deploy to production
2. Visit `/admin` page
3. Create admin account through the UI

#### Option 2: Via Script (After Deployment)
```bash
# Pull production env vars locally
vercel env pull .env.production.local

# Create admin user
ADMIN_EMAIL="admin@yourdomain.com" \
ADMIN_PASSWORD="YourStrongPassword123!" \
ADMIN_NAME="Admin User" \
npm run create-admin
```

### 7. Post-Deployment Verification

#### Health Checks
- [ ] Visit `/api/health` - should return 200 OK
- [ ] Visit `/api/auth/status` - should work correctly
- [ ] Test login flow at `/admin`
- [ ] Test password reset flow (if email is configured)

#### Functionality Tests
- [ ] Admin dashboard loads correctly
- [ ] Can create/edit posts
- [ ] Can manage users
- [ ] Can manage comments
- [ ] Can manage subscribers
- [ ] Can manage goals and donations
- [ ] Can access settings page

#### Performance Checks
- [ ] Pages load quickly
- [ ] API routes respond within timeout limits (30s)
- [ ] No memory issues in function logs
- [ ] Database queries are optimized

### 8. Monitoring Setup

#### Vercel Logs
- Monitor build logs for any errors
- Check function logs for runtime issues
- Set up alerts for failed deployments

#### Error Tracking (Optional)
- Consider setting up Sentry or similar
- Monitor for unhandled errors
- Track performance metrics

## 🚨 Common Production Issues & Solutions

### Issue: Build Fails with "Module not found"
**Solution**: 
- Ensure `resend` is in dependencies (already installed ✅)
- Check that `--legacy-peer-deps` is in install command (already configured ✅)

### Issue: Database Connection Fails
**Solution**:
- Verify `DATABASE_URL` is set correctly
- Check database is accessible (not paused)
- Verify SSL mode is `require`
- Check Neon dashboard for connection issues

### Issue: Authentication Not Working
**Solution**:
- Verify `BETTER_AUTH_SECRET` is set
- Check `BETTER_AUTH_URL` matches production domain exactly
- Ensure no trailing slashes in URLs
- Check session cookies are being set

### Issue: Email Not Sending
**Solution**:
- Verify `RESEND_API_KEY` is set correctly
- Check `EMAIL_FROM` domain is verified in Resend dashboard
- Ensure domain is verified in Resend (required for sending)
- Review Resend dashboard for sending limits (free tier: 3,000/month)
- Check function logs for email errors
- Verify email address format is correct

### Issue: Admin Can't Access Pages
**Solution**:
- Verify user role is `ADMIN` in database
- Check `isActive` is `true` for admin user
- Review RBAC permissions
- Check authentication status endpoint

## 📋 Quick Deployment Steps

1. **Set Environment Variables** in Vercel Dashboard
   - Database: `DATABASE_URL`
   - Auth: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`
   - Email: `RESEND_API_KEY`, `EMAIL_FROM` (or `RESEND_FROM_EMAIL`)
   - App: `NODE_ENV=production`, `NEXT_PUBLIC_SITE_URL`
   
   **Important**: `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` must match your production domain exactly (no trailing slashes)

2. **Push to Main Branch**
   ```bash
   git push origin main
   ```

3. **Monitor Build**
   - Watch Vercel dashboard for build progress
   - Check build logs for any errors
   - Verify Prisma generates successfully

4. **Verify Deployment**
   - Visit your production URL
   - Test `/api/health` endpoint
   - Test admin login
   - Create admin user if needed

5. **Post-Deployment**
   - Test critical functionality
   - Monitor logs for errors
   - Set up monitoring/alerts

## 🔗 Important Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Resend Dashboard**: https://resend.com/dashboard
- **Neon Dashboard**: https://console.neon.tech
- **Health Check**: `https://your-domain.vercel.app/api/health`

## 📝 Notes

- All environment variables are case-sensitive
- URLs must match exactly (no trailing slashes)
- Secrets should be minimum 32 characters
- Database migrations run automatically during build
- Email service is optional but recommended for production
- Admin users can be created via UI after deployment

