# Database Setup Guide

## PostgreSQL Database (Neon)

This application uses a PostgreSQL database hosted on Neon. All environments (development, staging, and production) use the same Neon database for consistency.

### Database Details
- **Provider**: Neon (Serverless PostgreSQL)
- **Host**: `ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech`
- **Database**: `neondb`
- **User**: `neondb_owner`
- **Region**: US West 2 (AWS)
- **Connection Pooling**: Enabled (pooler endpoint)

## Environment Configuration

### Required Environment Variable

Set the following environment variable in your deployment platform (Vercel, etc.):

```bash
DATABASE_URL="postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
```

### For Local Development

If you need to run the application locally, create a `.env.local` file in the root directory:

```bash
# .env.local
DATABASE_URL="postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-development-jwt-secret-minimum-32-characters"
NEXTAUTH_SECRET="your-development-nextauth-secret-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"
ALLOW_ADMIN_SETUP="true"
NODE_ENV="development"
```

### For Production Deployment

In your Vercel dashboard, add the following environment variables:

1. **DATABASE_URL**: `postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require`
2. **JWT_SECRET**: Generate a secure random string (minimum 32 characters)
3. **NEXTAUTH_SECRET**: Generate a secure random string (minimum 32 characters)
4. **NODE_ENV**: `production`
5. **ALLOW_ADMIN_SETUP**: `false` (security)

## Database Setup Commands

### Initialize Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Create Admin User

```bash
# Create admin user (production)
ADMIN_EMAIL="admin@yourdomain.com" \
ADMIN_PASSWORD="YourStrongPassword123!" \
ADMIN_NAME="Admin User" \
npm run create-admin
```

## Verification

### Test Database Connection

```bash
# Check database connection
npm run check-env
```

### Verify Database Setup

```bash
# Run database setup script
npm run setup
```

## Notes

- **No SQLite**: This application no longer uses SQLite. All environments use PostgreSQL.
- **Single Database**: All environments connect to the same production database for data consistency.
- **Security**: The database connection uses SSL mode for secure connections.
- **Connection Pooling**: The Neon database URL includes connection pooling for optimal performance.
