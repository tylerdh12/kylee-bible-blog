# Deployment Guide for Kylee's Bible Blog

## Prerequisites

1. **Node.js 18+** installed
2. **Git** installed
3. **Vercel Account** (recommended) or other hosting provider
4. **PostgreSQL Database** (for production)

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following variables:

### Required Variables

```env
# Database
DATABASE_URL="your-production-database-url"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# Next.js
NODE_ENV="production"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# Admin Credentials
ADMIN_EMAIL="your-admin-email@domain.com"
ADMIN_PASSWORD="your-secure-admin-password"
```

### Optional Variables

```env
# Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Error Tracking
SENTRY_DSN="https://your-sentry-dsn"
```

## Database Setup

### Development (SQLite)
```bash
npm run setup
```

### Production (PostgreSQL)

1. Create a PostgreSQL database
2. Update `DATABASE_URL` in your environment variables
3. Run migrations:
```bash
npx prisma db push
npm run setup
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required environment variables

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Option 2: Traditional VPS/Server

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

4. **Set up reverse proxy** (nginx/Apache)
5. **Set up SSL certificate**
6. **Configure domain**

### Option 3: Docker

1. **Create Dockerfile** (example):
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t kylee-blog .
   docker run -p 3000:3000 --env-file .env kylee-blog
   ```

## Post-Deployment Checklist

### 1. Admin Account Setup
- [ ] Admin user created successfully
- [ ] Can log into `/admin`
- [ ] All admin features working

### 2. Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] JWT secret is secure and unique
- [ ] Admin password is strong

### 3. Performance
- [ ] Site loads quickly
- [ ] Images optimized
- [ ] Database queries optimized

### 4. Testing
- [ ] All unit tests pass: `npm test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Manual testing completed

### 5. Monitoring
- [ ] Error tracking configured (optional)
- [ ] Analytics configured (optional)
- [ ] Uptime monitoring set up

## Maintenance

### Database Backups
Set up regular database backups, especially for production.

### Updates
```bash
# Update dependencies
npm update

# Run tests
npm run test:all

# Deploy
git push origin main  # If using auto-deploy
# or
npx vercel --prod
```

### Monitoring

Monitor the following:
- Application errors
- Performance metrics
- Database performance
- User analytics (if configured)

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Ensure database connection
   - Verify Node.js version

2. **Admin Login Issues**
   - Verify JWT_SECRET is set
   - Check admin credentials
   - Ensure database has admin user

3. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database server status
   - Verify network connectivity

4. **Performance Issues**
   - Enable database query logging
   - Check server resources
   - Optimize images and assets

### Getting Help

1. Check the logs for error messages
2. Verify all environment variables
3. Test locally with production settings
4. Review this deployment guide

## Security Best Practices

1. **Use HTTPS everywhere**
2. **Strong JWT secrets** (minimum 256 bits)
3. **Secure admin passwords**
4. **Regular security updates**
5. **Environment variable security**
6. **Database security**
7. **Regular backups**

Remember to never commit sensitive information like passwords or secrets to version control!