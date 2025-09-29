# Deployment Guide

This guide covers the complete deployment process for Kylee's Blog, including database setup, migrations, and seeding.

## Overview

The application uses a comprehensive deployment system that handles:

- Database migrations and schema updates
- Seed data for initial setup
- Admin user creation
- Environment-specific configurations
- Deployment verification

## Prerequisites

Before deploying, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **PostgreSQL database** (local or cloud)
4. **Environment variables** configured

## Environment Variables

### Required Variables

```bash
# Database
POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/kylee_blog"

# Authentication (for production)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# Environment
NODE_ENV="production"
```

### Optional Variables

```bash
# Logging
VERBOSE="true"

# Development
SKIP_ENV_VALIDATION="true"
```

## Deployment Methods

### 1. Vercel Deployment (Recommended)

The `vercel.json` configuration automatically handles:

- Database setup during build
- Environment variable injection
- Function optimization

```bash
# Deploy to Vercel
vercel --prod
```

### 2. Manual Deployment

Step-by-step manual deployment:

```bash
# 1. Install dependencies
npm install

# 2. Setup database (production)
npm run setup:production

# 3. Build application
npm run build

# 4. Start application
npm start
```

### 3. Local Testing

Use the provided deployment script for local testing:

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```


## Database Setup

### Development Setup

```bash
# Quick setup for development
npm run setup

# Or step by step
npm run migrate
npm run seed
```

### Production Setup

```bash
# Production setup with migrations
npm run setup:production

# Or step by step
npm run migrate:deploy
npm run seed
```

## Scripts Reference

### Core Scripts

| Script             | Description                      | Usage                      |
| ------------------ | -------------------------------- | -------------------------- |
| `setup`            | Complete development setup       | `npm run setup`            |
| `setup:production` | Production setup with migrations | `npm run setup:production` |
| `seed`             | Seed database with sample data   | `npm run seed`             |
| `migrate`          | Push schema changes (dev)        | `npm run migrate`          |
| `migrate:deploy`   | Deploy migrations (prod)         | `npm run migrate:deploy`   |

### Verification Scripts

| Script              | Description              | Usage                          |
| ------------------- | ------------------------ | ------------------------------ |
| `verify-admin`      | Verify admin user setup  | `node scripts/verify-admin.js` |
| `verify-deployment` | Verify deployment status | `npm run verify-deployment`    |

## Database Schema

The application includes the following models:

- **User** - Admin and user accounts
- **Post** - Blog posts and content
- **Tag** - Post categorization
- **Comment** - Post comments
- **Goal** - Ministry goals and targets
- **Donation** - Donation tracking
- **PrayerRequest** - Private prayer requests

## Seed Data

The seed script creates:

### Users

- Admin user: `kylee@example.com` / `admin123`

### Content

- Welcome blog post
- Sample Bible study post
- Ministry goals with progress
- Sample donations
- Prayer requests

### Features

- Responsive design
- Dark/light theme support
- Currency internationalization
- Prayer request system
- Donation tracking
- Admin dashboard

## Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check database URL
echo $POSTGRES_PRISMA_URL

# Test connection
node scripts/verify-admin.js
```

#### Migration Failed

```bash
# Reset database (development only)
npx prisma db push --force-reset

# Re-run setup
npm run setup
```

#### Build Failed

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

#### Admin Login Issues

```bash
# Verify admin user
node scripts/verify-admin.js

# Recreate admin
node scripts/create-admin.js
```

### Logs and Debugging

Enable verbose logging:

```bash
VERBOSE=true npm run setup
```

Check deployment status:

```bash
npm run verify-deployment
```

## Security Considerations

### Production Checklist

- [ ] Change default admin password
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure `NEXTAUTH_URL`
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Review environment variables

### Admin Security

Default admin credentials:

- Email: `kylee@example.com`
- Password: `admin123`

**⚠️ Change these immediately after deployment!**

## Monitoring

### Health Checks

The application includes health check endpoints:

- `/api/health` - Basic health status
- `/api/status` - Detailed system status

### Database Monitoring

Monitor database performance:

```bash
# Check database status
node scripts/verify-admin.js

# View table counts
npx prisma studio
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
pg_dump $POSTGRES_PRISMA_URL > backup.sql

# Restore backup
psql $POSTGRES_PRISMA_URL < backup.sql
```

### Application Backup

```bash
# Backup application files
tar -czf kylee-blog-backup.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .
```

## Support

For deployment issues:

1. Check the logs for error messages
2. Verify environment variables
3. Test database connectivity
4. Review the troubleshooting section
5. Check the application health endpoints

## Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Run migrations
npm run migrate:deploy

# Restart application
npm restart
```

### Schema Changes

When adding new models or fields:

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Update seed script if needed
4. Test locally before deploying
5. Deploy with `npm run setup:production`
