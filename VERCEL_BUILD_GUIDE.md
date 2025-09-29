# Vercel Build Configuration Guide

This document outlines the Vercel deployment configuration and troubleshooting steps for the Kylee Blog application.

## Environment Variables Required

Set the following environment variables in your Vercel project settings:

### Database

- `POSTGRES_PRISMA_URL` - Your PostgreSQL connection string (for Vercel Postgres)
- Or `DATABASE_URL` - Alternative PostgreSQL connection string

### Authentication

- `JWT_SECRET` - JWT signing secret (minimum 32 characters)
- `NEXTAUTH_SECRET` - NextAuth.js secret (minimum 32 characters)
- `NEXTAUTH_URL` - Your deployed app URL (e.g., `https://your-app.vercel.app`)

### Optional

- `NEXT_PUBLIC_BASE_URL` - Public base URL for the app
- `ALLOW_ADMIN_SETUP` - Set to `"true"` to allow admin setup in production
- `SKIP_ENV_VALIDATION` - Set to `"true"` to skip environment validation during build

## Build Configuration

The project uses a custom build command defined in `vercel.json`:

```json
{
	"buildCommand": "npm run vercel-build"
}
```

This runs:

1. `scripts/build-check.js` - Pre-build validation
2. `scripts/vercel-setup.js` - Vercel-specific setup with Prisma optimization
3. `next build` - Next.js build with environment validation skipped and memory optimization

## Troubleshooting Common Issues

### 1. Environment Variable Issues

- **Error**: "Missing required environment variables"
- **Solution**: Ensure all required environment variables are set in Vercel project settings
- **Check**: Visit your Vercel project → Settings → Environment Variables

### 2. Database Connection Issues

- **Error**: Database connection failed during build
- **Solution**: Vercel builds with `SKIP_ENV_VALIDATION=true`, so database issues won't fail the build
- **Note**: Database connection is only tested at runtime, not during build

### 3. Prisma Generation Issues

- **Error**: Prisma client generation failed
- **Solution**: Ensure `POSTGRES_PRISMA_URL` or `DATABASE_URL` is properly formatted
- **Format**: `postgresql://username:password@hostname:port/database`
- **Fallback**: If optimized generation fails, the script automatically retries with standard flags

### 4. Next.js Build Issues

- **Error**: TypeScript or ESLint errors
- **Solution**: The build is configured to ignore TypeScript and ESLint errors
- **Config**: See `next.config.ts` for `ignoreBuildErrors` and `ignoreDuringBuilds` settings

### 5. Memory Issues / Build Timeouts

- **Error**: Build fails silently or with memory errors
- **Solution**: Optimized with increased memory allocation and package import optimization
- **Memory Limit**: Set to 4GB via `NODE_OPTIONS='--max-old-space-size=4096'`
- **Fallback Build**: Use `npm run vercel-build-simple` if main build fails

### 6. Network/Download Issues

- **Error**: Package installation timeouts
- **Solution**: Optimized with `.npmrc` configuration for faster installs
- **Features**: Offline-first, no audit, faster binary downloads

## Build Scripts

### `npm run build`

Standard build for local development.

### `npm run vercel-build`

Vercel-optimized build with:

- Pre-build validation
- Environment setup
- Skipped environment validation

## Function Configuration

API routes are configured with:

- Memory: 1024MB
- Max Duration: 30 seconds
- Region: iad1 (US East)

See `vercel.json` for complete configuration.

## Database Setup

For production deployment:

1. Create a Vercel Postgres database
2. Copy the `POSTGRES_PRISMA_URL` to your environment variables
3. Run database migrations separately (not during build)
4. Use the admin setup endpoint to create your first admin user

## Security Headers

The application includes security headers configured in `vercel.json`:

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Strict-Transport-Security: max-age=31536000; includeSubDomains

## Performance Optimizations

- API routes are cached appropriately
- Static pages are pregenerated where possible
- Images are optimized with Next.js Image component
- Prisma client is generated during build for optimal performance
