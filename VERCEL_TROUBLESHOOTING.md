# Vercel Deployment Troubleshooting Guide

## Build Issues Resolution

### 1. Environment Variables
Ensure these environment variables are set in Vercel dashboard:

**Required for Runtime:**
- `DATABASE_URL` - Your PostgreSQL database connection string
- `JWT_SECRET` - 32+ character secret for JWT tokens
- `NEXTAUTH_SECRET` - 32+ character secret for NextAuth.js
- `NEXTAUTH_URL` - Your Vercel app URL (e.g., https://your-app.vercel.app)

**Optional:**
- `ADMIN_EMAIL` - Admin user email
- `ADMIN_PASSWORD` - Admin user password

### 2. Node.js Version
- Ensure Vercel is using Node.js 18 or higher
- Check `.nvmrc` file is present with version `20`

### 3. Build Command
The build should use: `npm run vercel-build`

### 4. Common Build Errors & Solutions

#### Error: "Cannot find module '@prisma/client'"
**Solution:** Ensure Prisma generates during build:
```bash
prisma generate && next build
```

#### Error: "Environment variable validation failed"
**Solution:** Set `SKIP_ENV_VALIDATION=true` in Vercel build environment

#### Error: "Type errors in dynamic routes"
**Solution:** Ensure Next.js 15 async params are handled correctly

#### Error: "Database connection failed during build"
**Solution:** Database connections should only happen at runtime, not build time

### 5. Vercel Configuration
Check `vercel.json`:
- Build command is correct
- Node.js version is specified
- Function memory/timeout settings
- Environment variables in build section

### 6. Debug Build Issues
1. Check Vercel build logs for specific errors
2. Test locally with: `NODE_ENV=production npm run vercel-build`
3. Use the build-check script: `node scripts/build-check.js`

### 7. Quick Fixes Checklist
- [ ] All environment variables set in Vercel dashboard
- [ ] Node.js version 18+ specified
- [ ] Build command uses `npm run vercel-build`
- [ ] No build-time database connections
- [ ] TypeScript compilation passes
- [ ] All dependencies in package.json

### 8. Health Check Endpoints
After deployment, verify:
- `/api/health` - Basic health check
- `/api/status` - Comprehensive status check

### 9. Contact Information
If build still fails, provide:
1. Complete Vercel build logs
2. Environment variables list (names only, no values)
3. Node.js version being used
4. Specific error messages