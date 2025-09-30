# Deployment Guide

This document describes the complete deployment process for the Kylee Bible Blog application across different environments.

## 📋 Table of Contents

- [Environments](#environments)
- [Branching Strategy](#branching-strategy)
- [Deployment Process](#deployment-process)
- [Environment Setup](#environment-setup)
- [Database Management](#database-management)
- [Linear Integration](#linear-integration)
- [Troubleshooting](#troubleshooting)

## 🌍 Environments

The application supports three environments:

### 1. Development

- **Branch**: `feature/*`, local development
- **Purpose**: Local development and testing
- **Database**: PostgreSQL (production database)
- **URL**: http://localhost:3000
- **Auto-deploy**: No

### 2. Staging

- **Branch**: `develop`
- **Purpose**: Pre-production testing and QA
- **Database**: PostgreSQL (Neon - staging instance)
- **URL**: https://staging-kylee-blog.vercel.app
- **Auto-deploy**: Yes (on push to `develop`)

### 3. Production

- **Branch**: `main`
- **Purpose**: Live production environment
- **Database**: PostgreSQL (Neon - production instance)
- **URL**: https://kylee-bible-blog.vercel.app
- **Auto-deploy**: Yes (on push to `main`)

## 🌿 Branching Strategy

### Branch Structure

```
main (production)
├── develop (staging)
│   ├── feature/feature-name
│   ├── bugfix/bug-name
│   └── hotfix/critical-fix
```

### Branch Naming Conventions

- **Feature branches**: `feature/short-description`
  - Example: `feature/user-authentication`
- **Bug fixes**: `bugfix/short-description`
  - Example: `bugfix/login-error`
- **Hotfixes**: `hotfix/short-description`
  - Example: `hotfix/security-patch`

### Creating a New Feature Branch

Use the automated script:

```bash
npm run branch:create feature-name "Feature description"
```

Or manually:

```bash
git checkout main
git pull origin main
git checkout -b feature/feature-name
```

## 🚀 Deployment Process

### 1. Development Workflow

1. Create a feature branch from `main`:

   ```bash
   npm run branch:create my-feature "Add new feature"
   ```

2. Make your changes and test locally:

   ```bash
   npm run dev
   ```

3. Run tests:

   ```bash
   npm run test:all
   ```

4. Commit changes:

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. Push to remote:
   ```bash
   git push -u origin feature/my-feature
   ```

### 2. Staging Deployment

1. Create a Pull Request from your feature branch to `develop`
2. Wait for CI checks to pass
3. Get code review approval
4. Merge to `develop`
5. Automatic deployment to staging triggers
6. Test on staging environment
7. Monitor logs and verify functionality

### 3. Production Deployment

1. Create a Pull Request from `develop` to `main`
2. Ensure all staging tests pass
3. Get final approval from maintainers
4. Merge to `main`
5. Automatic deployment to production triggers
6. Monitor production logs
7. Verify deployment health

### Emergency Hotfix Process

For critical production issues:

1. Create hotfix branch from `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue
   ```

2. Fix the issue and test thoroughly

3. Create PR directly to `main` (bypass staging)

4. Get emergency approval

5. Merge and deploy

6. Backport fix to `develop`:
   ```bash
   git checkout develop
   git merge main
   git push origin develop
   ```

## ⚙️ Environment Setup

### Local Development Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd kylee-bible-blog
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. Set up the database:

   ```bash
   npm run setup
   ```

5. Create an admin user:

   ```bash
   ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="SecurePass123!" ADMIN_NAME="Admin User" npm run create-admin
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

### Vercel Environment Variables

Configure these in Vercel Dashboard for each environment:

#### All Environments

- `NODE_ENV`: Set to `production` for staging and production
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random string (min 32 characters)
- `NEXTAUTH_SECRET`: Strong random string
- `NEXTAUTH_URL`: Full URL of the deployment

#### Production Only

- `ADMIN_EMAIL`: Initial admin email
- `ADMIN_PASSWORD`: Strong admin password
- `ADMIN_NAME`: Admin display name

### Environment-Specific Deployments

#### Deploy to Development

```bash
npm run deploy:dev
```

#### Deploy to Staging

```bash
npm run deploy:staging
```

#### Deploy to Production

```bash
npm run deploy:production
```

## 🗄️ Database Management

### Schema Migrations

The application uses Prisma for database management.

#### Development

```bash
# Push schema changes (for rapid development)
npm run migrate

# Generate Prisma client
npx prisma generate
```

#### Production

```bash
# Deploy migrations (safe for production)
npm run migrate:deploy
```

### Creating Admin Users

#### Local/Development

```bash
ADMIN_EMAIL="admin@local.com" ADMIN_PASSWORD="DevPass123!" ADMIN_NAME="Dev Admin" npm run create-admin
```

#### Production (via Vercel CLI)

```bash
# Pull environment variables from Vercel
vercel env pull .env.production.local

# Create admin user
ADMIN_EMAIL="admin@production.com" ADMIN_PASSWORD="StrongPass123!" ADMIN_NAME="Admin" npm run create-admin
```

### Database Seeding

To seed the database with sample data:

```bash
npm run seed
```

## 🎯 Linear Integration

### Setup

1. Install Linear CLI:

   ```bash
   npm install -g @linear/cli
   ```

2. Authenticate:
   ```bash
   linear auth
   ```

### Creating Issues

#### Using the script

```bash
npm run linear:create-issue "Issue title" "Description"
```

#### Direct Linear CLI

```bash
linear issue create --title "Feature name" --description "Description"
```

### Listing Issues

```bash
npm run linear:list
```

### Workflow

1. Create a Linear issue for each task
2. Create a feature branch linked to the issue
3. Reference the issue in commit messages: `feat: implement feature (LIN-123)`
4. Update issue status as you progress
5. Close issue when PR is merged

### Best Practices

- Create issues before starting work
- Link commits to issues using issue IDs
- Update issue status regularly
- Use issue descriptions for acceptance criteria
- Close issues only after deployment verification

## 🔍 Monitoring and Verification

### Health Checks

- **Health endpoint**: `/api/health`
- **Database diagnostic**: `/api/database-diagnostic`
- **Status endpoint**: `/api/status`

### Vercel Deployment Verification

```bash
npm run verify-deployment
```

### Log Monitoring

View deployment logs in Vercel Dashboard:

1. Go to your project in Vercel
2. Click on "Deployments"
3. Select the deployment
4. View "Build Logs" and "Runtime Logs"

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures

**Issue**: Prisma generation fails
**Solution**:

```bash
# Clear Prisma cache
rm -rf node_modules/.prisma
npm run migrate
```

**Issue**: Out of memory during build
**Solution**: Already configured in package.json with `NODE_OPTIONS='--max-old-space-size=4096'`

#### Database Connection Issues

**Issue**: Cannot connect to database
**Solution**:

1. Check DATABASE_URL is set correctly
2. Verify database is accessible from Vercel's region
3. Check database credentials and SSL settings
4. Review firewall rules (Neon should allow all by default)

#### Deployment Not Updating

**Issue**: Changes not reflecting after deployment
**Solution**:

1. Check deployment logs in Vercel
2. Verify build completed successfully
3. Clear browser cache
4. Check if correct branch was deployed

### Support

For additional support:

- Check GitHub Issues
- Review Vercel deployment logs
- Check Linear for known issues
- Contact development team

## 📚 Scripts Reference

### Deployment Scripts

- `npm run deploy:dev` - Build and test for development
- `npm run deploy:staging` - Deploy to staging environment
- `npm run deploy:production` - Deploy to production environment

### Branch Management

- `npm run branch:create <name> <description>` - Create new feature branch

### Linear Integration

- `npm run linear:create-issue <title> <description>` - Create Linear issue
- `npm run linear:list` - List all Linear issues
- `npm run linear:help` - Show Linear integration help

### Database

- `npm run setup` - Setup development database
- `npm run setup:production` - Setup production database
- `npm run migrate` - Push schema changes (dev)
- `npm run migrate:deploy` - Deploy migrations (production)
- `npm run seed` - Seed database with sample data
- `npm run create-admin` - Create admin user

### Testing

- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:all` - Run all tests

### Build and Development

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run linter

## 📝 Commit Message Conventions

Follow conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add user authentication (LIN-123)`

## 🔒 Security Checklist

### Before Production Deployment

- [ ] Change default admin credentials
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Configure correct NEXTAUTH_URL
- [ ] Enable HTTPS in production
- [ ] Set up database backups
- [ ] Review all environment variables
- [ ] Test authentication flow
- [ ] Verify database connection security
- [ ] Enable rate limiting if needed

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Linear Documentation](https://linear.app/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
