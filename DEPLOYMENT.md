# Deployment Guide

## Environment Variables

Before deploying to production, ensure the following environment variables are set:

### Required for Production
- `DATABASE_URL` - Your production database connection string
- `JWT_SECRET` - A secure random string (at least 32 characters)
- `ADMIN_EMAIL` - Email address for the admin user (default: kylee@blog.com)
- `ADMIN_PASSWORD` - Secure password for the admin user (minimum 8 characters)
- `ADMIN_NAME` - Display name for the admin user (default: Kylee)

### Optional
- `NEXTAUTH_URL` - Your production domain (auto-detected on Vercel)
- `NEXTAUTH_SECRET` - Additional secret for NextAuth (if using)

## Production Setup

### 1. Deploy to Vercel

```bash
# Deploy to Vercel
npx vercel --prod

# Or use the Vercel dashboard for GitHub integration
```

### 2. Set Environment Variables

In your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required environment variables above
3. Redeploy to apply changes

### 3. Setup Database and Admin User

After deployment, run the production setup:

```bash
# Set your environment variables locally for the setup
export ADMIN_EMAIL="your-email@example.com"
export ADMIN_PASSWORD="your-secure-password"
export ADMIN_NAME="Your Name"
export DATABASE_URL="your-production-database-url"

# Run production setup
npm run setup:production
```

**Note**: Make sure to use a strong password and keep credentials secure!

### 4. Access Admin Panel

Once setup is complete, you can access the admin panel at:
```
https://your-domain.vercel.app/admin
```

Login with the credentials you set in the environment variables.

## Security Considerations

- **Never commit passwords or secrets to the repository**
- Use strong, unique passwords for production
- Regularly rotate JWT secrets and admin passwords
- Consider using a password manager for credential management
- Monitor admin access logs

## Database Setup

This project uses Prisma with SQLite for development and can be configured for PostgreSQL in production.

### For Vercel Postgres:
1. Add Vercel Postgres to your project
2. Copy the connection string to `DATABASE_URL`
3. Run the setup script

### For other databases:
1. Configure your database connection string
2. Ensure the database is accessible from Vercel
3. Run the setup script

## Troubleshooting

### Admin User Issues
- Ensure `ADMIN_PASSWORD` is at least 8 characters
- Check that environment variables are properly set in Vercel
- Verify database connection is working

### Build Issues
- Check that all dependencies are installed
- Verify environment variables are set
- Check Vercel build logs for specific errors

### Database Issues
- Verify `DATABASE_URL` is correct
- Ensure database is accessible
- Check Prisma schema migrations

## Monitoring

Consider setting up:
- Error monitoring (Sentry, etc.)
- Performance monitoring
- Admin access logging
- Database performance monitoring