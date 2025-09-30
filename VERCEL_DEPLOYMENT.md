# Vercel Deployment Guide

This guide covers the complete deployment process for Kylee's Blog on Vercel, including troubleshooting common build issues.

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** - Install globally: `npm install -g vercel`
3. **PostgreSQL Database** - Set up on Vercel Postgres, Supabase, or another provider
4. **Environment Variables** - Configure in Vercel dashboard

## Environment Variables

### Required Variables

Set these in your Vercel project settings:

```bash
# Database
DATABASE_URL="postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Environment
NODE_ENV="production"
```

### Optional Variables

```bash
# Development
SKIP_ENV_VALIDATION="true"
```

## Deployment Methods

### 1. Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 2. GitHub Integration

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Push to main branch for automatic deployment

### 3. Manual Upload

1. Run `npm run build` locally
2. Upload the `.next` folder to Vercel

## Build Configuration

### Package.json Scripts

```json
{
	"scripts": {
		"vercel-build": "node scripts/build-check.js && prisma generate && SKIP_ENV_VALIDATION=true next build",
		"postinstall": "prisma generate",
		"build": "prisma generate && next build"
	}
}
```

### Vercel.json Configuration

```json
{
	"version": 2,
	"buildCommand": "npm run vercel-build",
	"installCommand": "npm install",
	"framework": "nextjs",
	"regions": ["iad1"],
	"env": {
		"NODE_ENV": "production"
	},
	"build": {
		"env": {
			"NODE_ENV": "production",
			"SKIP_ENV_VALIDATION": "true"
		}
	}
}
```

## Common Build Issues & Solutions

### 1. Database Connection Issues

**Error**: `Database URL not found`

**Solution**:

- Ensure `DATABASE_URL` is set in Vercel environment variables
- Check database connection string format
- Verify database is accessible from Vercel

### 2. Prisma Client Generation Issues

**Error**: `Prisma Client not generated`

**Solution**:

- Ensure `postinstall` script runs `prisma generate`
- Check Prisma schema is valid
- Verify `@prisma/client` is in dependencies

### 3. TypeScript Compilation Errors

**Error**: `Type error in route handlers`

**Solution**:

- Update API route parameter types for Next.js 15
- Use `params: Promise<{ id: string }>` instead of `params: { id: string }`
- Add `await params` in route handlers

### 4. Missing Dependencies

**Error**: `Module not found`

**Solution**:

- Check all imports are correct
- Ensure dependencies are in `package.json`
- Run `npm install` locally to verify

### 5. Environment Variable Issues

**Error**: `Environment variable not found`

**Solution**:

- Set all required environment variables in Vercel dashboard
- Use `SKIP_ENV_VALIDATION=true` for build if needed
- Check variable names match exactly

## Build Process

### 1. Pre-build Validation

The `build-check.js` script validates:

- Node.js version (>=18.17.0)
- Required dependencies
- Prisma schema exists
- Next.js config exists

### 2. Prisma Client Generation

```bash
prisma generate
```

### 3. Next.js Build

```bash
SKIP_ENV_VALIDATION=true next build
```

## Database Setup

### First Deployment

1. Deploy to Vercel
2. Set environment variables
3. Run database migrations manually:
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

### Subsequent Deployments

Database migrations run automatically if configured in build process.

## Monitoring & Debugging

### 1. Build Logs

Check Vercel dashboard for:

- Build logs
- Function logs
- Error messages

### 2. Local Testing

```bash
# Test build locally
npm run vercel-build

# Test with Vercel CLI
vercel build
```

### 3. Environment Variables

```bash
# Pull environment variables
vercel env pull .env.local

# Test locally with production env
NODE_ENV=production npm run build
```

## Performance Optimization

### 1. Function Configuration

```json
{
	"functions": {
		"src/app/api/**/*.ts": {
			"memory": 1024,
			"maxDuration": 15
		}
	}
}
```

### 2. Caching

```json
{
	"headers": [
		{
			"source": "/api/(.*)",
			"headers": [
				{
					"key": "Cache-Control",
					"value": "no-cache, no-store, must-revalidate"
				}
			]
		}
	]
}
```

## Security

### 1. Environment Variables

- Never commit sensitive data to git
- Use Vercel's environment variable system
- Rotate secrets regularly

### 2. Headers

```json
{
	"headers": [
		{
			"source": "/(.*)",
			"headers": [
				{
					"key": "X-Frame-Options",
					"value": "DENY"
				},
				{
					"key": "X-Content-Type-Options",
					"value": "nosniff"
				}
			]
		}
	]
}
```

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Verify environment variables
3. Test build locally
4. Check Node.js version compatibility

### Runtime Errors

1. Check function logs
2. Verify database connection
3. Check API route implementations
4. Validate environment variables

### Performance Issues

1. Monitor function execution time
2. Check memory usage
3. Optimize database queries
4. Review caching strategy

## Support

For additional help:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
3. Check [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
4. Contact Vercel Support for platform issues
