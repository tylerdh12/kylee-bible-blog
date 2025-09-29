# Production Deployment Setup Checklist

This checklist will guide you through setting up the production deployment system step by step.

## ✅ Progress Tracker

- [x] Application code reviewed and tested
- [x] Production build tested successfully
- [x] Environment configuration files created
- [x] Deployment scripts created
- [x] CI/CD workflows configured
- [x] Documentation updated
- [x] Feature branch merged to main
- [x] Develop branch created
- [ ] GitHub authentication completed
- [ ] Branches pushed to GitHub
- [ ] Vercel authentication completed
- [ ] Vercel environment variables configured
- [ ] Staging database created
- [ ] Production admin user created
- [ ] Linear integration set up
- [ ] First deployment verified

---

## 📋 Step-by-Step Setup Guide

### Step 1: GitHub Authentication ⏳ IN PROGRESS

You need to authenticate with GitHub to push your branches.

**Action Required:**
1. Open: https://github.com/login/device
2. Enter code: `D6C7-7A91` (if expired, run `gh auth login --git-protocol https --web` again)
3. Authorize GitHub CLI

**Verification:**
```bash
gh auth status
```

---

### Step 2: Push Branches to GitHub

Once authenticated, push your branches:

```bash
# Push main branch
git push origin main

# Push develop branch
git push origin develop

# Verify branches
gh repo view --web
```

**Expected Result:**
- Both `main` and `develop` branches should appear on GitHub
- GitHub Actions workflows should start automatically

---

### Step 3: Vercel Authentication

Authenticate with Vercel to manage deployments:

```bash
# Login to Vercel
vercel login

# Link project (if not already linked)
vercel link

# Verify authentication
vercel whoami
```

---

### Step 4: Configure Vercel Environment Variables

You need to set up environment variables for **both** staging and production environments.

#### For Production (main branch):

```bash
# Set production environment variables
vercel env add DATABASE_URL production
# Paste your Neon production database URL
# Example: postgresql://user:pass@host.neon.tech:5432/kylee_blog_prod?sslmode=require

vercel env add JWT_SECRET production
# Generate a strong secret (min 32 characters)
# Example: openssl rand -base64 32

vercel env add NEXTAUTH_SECRET production
# Generate a strong secret (min 32 characters)
# Example: openssl rand -base64 32

vercel env add NEXTAUTH_URL production
# Enter: https://kylee-bible-blog.vercel.app

vercel env add ADMIN_EMAIL production
# Enter admin email (e.g., kylee@blog.com)

vercel env add ADMIN_PASSWORD production
# Enter a strong password (min 12 characters, mix of upper/lower/numbers/symbols)

vercel env add ADMIN_NAME production
# Enter admin name (e.g., Kylee Champion)
```

#### For Staging (develop branch):

```bash
# Set staging environment variables
vercel env add DATABASE_URL preview
# Paste your Neon staging database URL

vercel env add JWT_SECRET preview
# Generate a different secret than production

vercel env add NEXTAUTH_SECRET preview
# Generate a different secret than production

vercel env add NEXTAUTH_URL preview
# Enter your Vercel preview URL (e.g., https://kylee-blog-git-develop-username.vercel.app)

# Note: Admin setup is disabled in staging - use scripts to create admin users
```

#### Generate Secure Secrets:

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

### Step 5: Create Staging Database

Create a separate database in Neon for staging:

1. **Go to Neon Console**: https://console.neon.tech
2. **Create new database**:
   - Name: `kylee_blog_staging`
   - Region: Same as production for consistency
3. **Copy connection string**
4. **Add to Vercel staging environment** (done in Step 4)

**Database Connection String Format:**
```
postgresql://user:password@host.neon.tech:5432/kylee_blog_staging?sslmode=require
```

---

### Step 6: Verify Environment Variables

Check that all variables are set correctly:

```bash
# List production environment variables
vercel env ls production

# List preview/staging environment variables
vercel env ls preview
```

**Required Variables:**
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL
- ✅ ADMIN_EMAIL (production only)
- ✅ ADMIN_PASSWORD (production only)
- ✅ ADMIN_NAME (production only)

---

### Step 7: Deploy to Staging

Push to develop branch to trigger staging deployment:

```bash
# Make sure you're on develop
git checkout develop

# Create a test commit to trigger deployment
git commit --allow-empty -m "chore: trigger staging deployment"
git push origin develop
```

**Monitor deployment:**
```bash
# View recent deployments
vercel ls

# View logs for specific deployment
vercel logs [deployment-url]
```

---

### Step 8: Create Production Admin User

After production deploys, create the admin user:

```bash
# Pull production environment variables
vercel env pull .env.production.local

# Create admin user
source .env.production.local
npm run create-admin
```

**Alternative - Direct creation:**
```bash
ADMIN_EMAIL="admin@yourdomain.com" \
ADMIN_PASSWORD="YourStrongPassword123!" \
ADMIN_NAME="Admin User" \
DATABASE_URL="your-production-database-url" \
npm run create-admin
```

---

### Step 9: Test Production Deployment

Verify the production deployment is working:

```bash
# Run verification script
npm run verify-deployment
```

**Manual checks:**
1. Visit: https://kylee-bible-blog.vercel.app
2. Try logging in with admin credentials
3. Check `/api/health` endpoint
4. Verify database connection at `/api/status`

---

### Step 10: Set Up Linear (Optional)

If you want to use Linear for task management:

```bash
# Install Linear CLI globally
npm install -g @linear/cli

# Authenticate
linear auth

# Test it
npm run linear:list
```

**Create your first issue:**
```bash
npm run linear:create-issue "Setup production monitoring" "Add monitoring and alerting for production"
```

---

## 🔍 Verification Commands

Run these to verify everything is working:

```bash
# 1. Check Git status
git status
git branch -a

# 2. Check GitHub authentication
gh auth status

# 3. Check Vercel authentication
vercel whoami

# 4. Check Vercel project
vercel ls

# 5. Check environment variables
vercel env ls production
vercel env ls preview

# 6. Test local build
npm run build

# 7. Run all tests
npm run test:all

# 8. Check deployment health
curl https://kylee-bible-blog.vercel.app/api/health
```

---

## 🚨 Troubleshooting

### GitHub Push Fails

**Problem:** `fatal: could not read Username`

**Solution:**
```bash
gh auth status
# If not authenticated, run:
gh auth login --git-protocol https --web
```

---

### Vercel Deployment Fails

**Problem:** Build fails on Vercel

**Solution:**
1. Check build logs in Vercel Dashboard
2. Verify environment variables are set
3. Check DATABASE_URL is accessible from Vercel
4. Ensure all required variables exist

---

### Database Connection Fails

**Problem:** Cannot connect to database

**Solution:**
1. Verify DATABASE_URL format
2. Check Neon database is active
3. Ensure IP allowlist is configured (should be open for Vercel)
4. Test connection locally:
```bash
DATABASE_URL="your-url" npm run setup
```

---

### Admin Login Fails

**Problem:** Cannot log in with admin credentials

**Solution:**
1. Verify admin user was created:
```bash
DATABASE_URL="your-url" node scripts/verify-admin.js
```

2. Recreate admin user if needed:
```bash
DATABASE_URL="your-url" \
ADMIN_EMAIL="admin@domain.com" \
ADMIN_PASSWORD="StrongPass123!" \
ADMIN_NAME="Admin" \
npm run create-admin
```

---

## 📚 Quick Reference

### Deployment Commands
```bash
# Deploy to staging
git push origin develop

# Deploy to production
git push origin main

# Manual Vercel deployment
vercel --prod
```

### Branch Management
```bash
# Create feature branch
npm run branch:create feature-name "Description"

# Switch branches
git checkout main
git checkout develop
git checkout feature/feature-name
```

### Database Management
```bash
# Setup database
npm run setup

# Run migrations
npm run migrate:deploy

# Create admin user
npm run create-admin

# Seed database
npm run seed
```

### Monitoring
```bash
# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Check health
curl https://your-app.vercel.app/api/health
```

---

## 🎉 Success Criteria

Your setup is complete when:

- [x] Code is committed and branches exist locally
- [ ] Main and develop branches pushed to GitHub
- [ ] GitHub Actions workflows passing
- [ ] Vercel project linked and authenticated
- [ ] Environment variables configured for staging and production
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Admin user can log in
- [ ] Database operations working
- [ ] Health endpoints responding
- [ ] CI/CD pipeline working automatically

---

## 📞 Next Steps After Setup

Once everything is working:

1. **Create your first feature:**
   ```bash
   npm run branch:create welcome-page "Add welcome page content"
   ```

2. **Make changes and deploy:**
   ```bash
   # Work on your feature
   git add .
   git commit -m "feat: add welcome page"
   git push origin feature/welcome-page
   ```

3. **Create PR to develop:**
   - Go to GitHub
   - Create Pull Request to `develop`
   - Wait for CI to pass
   - Merge to trigger staging deployment

4. **Promote to production:**
   - After testing on staging
   - Create PR from `develop` to `main`
   - Merge to trigger production deployment

5. **Monitor and maintain:**
   - Check Vercel dashboard regularly
   - Monitor error logs
   - Keep dependencies updated
   - Review security alerts

---

## 📖 Documentation Links

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow
- [README.md](./README.md) - Project overview
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Linear Docs](https://linear.app/docs)