# Vercel Production Deployment Guide

## Quick Deployment

1. **Connect Repository to Vercel**
   - Import project from GitHub in Vercel dashboard
   - Select the repository: `tylerdh12/kylee-bible-blog`

2. **Environment Variables (Required)**
   Set these in Vercel dashboard under Settings > Environment Variables:

   ```bash
   # Database (Required for production)
   POSTGRES_PRISMA_URL=your_postgres_connection_string
   
   # Security (Required)
   NEXTAUTH_SECRET=your_secret_here
   NEXTAUTH_URL=https://your-domain.vercel.app
   
   # Admin (Required for first setup)
   ADMIN_PASSWORD=your_admin_password
   
   # Optional
   NODE_ENV=production
   ```

3. **Deploy**
   - Push to main branch or trigger manual deploy in Vercel dashboard

## Database Setup

### After First Deployment

1. **Run Database Migrations**
   ```bash
   # In Vercel Functions or local with production DATABASE_URL
   npx prisma migrate deploy
   ```

2. **Create Admin User**
   ```bash
   # Access your deployed site /admin to create first admin
   # Or run setup script locally with production DATABASE_URL
   npm run setup:production
   ```

## Troubleshooting

### Common Build Issues

1. **Missing Environment Variables**
   - Ensure `POSTGRES_PRISMA_URL` is set in Vercel
   - Check environment variable names match exactly

2. **Prisma Client Errors**
   - Client is auto-generated during build
   - Check database connection string format

3. **Memory/Timeout Issues**
   - API functions have 30s timeout and 1GB memory
   - Increase if needed in `vercel.json`

4. **Node.js Version**
   - Requires Node.js >=20.0.0
   - Specified in `package.json` engines

### Build Command Override

If needed, override build command in Vercel dashboard:
```bash
npm run vercel-build
```

### Function Configuration

Current settings in `vercel.json`:
- Memory: 1024MB
- Timeout: 30 seconds
- Runtime: Node.js 20.x

## Performance Optimization

- Static pages cached for 5 minutes
- API responses not cached
- Optimized bundle splitting
- Prisma client optimized for serverless

## Security Headers

Configured in `vercel.json`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: enabled
- Strict-Transport-Security: enabled

## Monitoring

- Check Vercel dashboard for build logs
- Function logs available in Vercel dashboard
- Health check endpoint: `/api/health`

## Support

For deployment issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test build locally with `npm run vercel-build`
4. Check database connectivity
