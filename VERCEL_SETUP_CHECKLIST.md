# Vercel Setup Checklist

This comprehensive checklist ensures your Vercel deployment is properly configured for the Kylee Blog platform.

## 🗄️ Database Setup

### Step 1: Use Existing Neon PostgreSQL Database

1. **Database Already Configured**

   - The application uses a Neon PostgreSQL database
   - No need to create a new Vercel Postgres database
   - Connection details provided below

3. **Get Connection Strings**
   After creation, you'll see these environment variables:
   ```
   DATABASE_URL="postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
   ```

## 🔧 Environment Variables Setup

### Step 2: Configure Required Variables

Go to **Project Settings → Environment Variables** and add:

#### **Database (Required)**

```bash
DATABASE_URL="postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
```

> **Important**: This is the Neon PostgreSQL production database

#### **Authentication (Required)**

```bash
JWT_SECRET="your-32-character-or-longer-secret-key-here"
NEXTAUTH_SECRET="your-32-character-or-longer-nextauth-secret"
NEXTAUTH_URL="https://your-app-name.vercel.app"
```

#### **Admin Setup (For Initial Setup)**

```bash
ALLOW_ADMIN_SETUP="true"
ADMIN_SETUP_KEY="kylee-blog-setup-2024"  # Optional: custom key
```

### Step 3: Generate Secure Secrets

For JWT_SECRET and NEXTAUTH_SECRET, use strong random strings:

```bash
# Generate secure secrets (32+ characters)
openssl rand -base64 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🚀 Deployment Configuration

### Step 4: Verify Build Settings

Ensure your **vercel.json** has:

```json
{
	"version": 2,
	"buildCommand": "npm run vercel-build",
	"installCommand": "npm install --prefer-offline --no-audit",
	"framework": "nextjs",
	"regions": ["iad1"],
	"functions": {
		"src/app/api/**/*.ts": {
			"memory": 1024,
			"maxDuration": 30
		}
	}
}
```

### Step 5: Database Migration

After deployment, run database migrations:

#### **Option A: Automatic (Recommended)**

The build process should handle this, but if needed:

#### **Option B: Manual via Vercel CLI**

```bash
vercel env pull .env.local
npx prisma generate
npx prisma db push
```

## ✅ Verification Steps

### Step 6: Test Your Setup

#### **Test 1: Environment Check**

Visit: `https://your-app.vercel.app/api/db-test`

Should return:

```json
{
	"success": true,
	"message": "Database connection successful",
	"details": {
		"userCount": 0,
		"environment": "production"
	}
}
```

#### **Test 2: Admin Setup**

Visit: `https://your-app.vercel.app/setup`

Use:

- **Setup Key**: `kylee-blog-setup-2024` (or your custom key)
- **Email**: `kylee@blog.com`
- **Password**: Your secure password (8+ characters)
- **Name**: `Kylee Champion`

#### **Test 3: Admin Login**

After setup, visit: `https://your-app.vercel.app/admin`

Login with the credentials you just created.

## 🔧 Troubleshooting

### Common Issues

#### **"Database connection failed"**

1. **Check environment variables** are set correctly
2. **Verify connection string format** includes `sslmode=require`
3. **Ensure database is accessible** from Vercel region
4. **Try the verification script**: Run `npm run verify-vercel`

#### **"Invalid setup key"**

1. **Check ADMIN_SETUP_KEY** environment variable
2. **Default key** is `kylee-blog-setup-2024`
3. **Ensure ALLOW_ADMIN_SETUP=true** is set

#### **Build failures**

1. **Check Node.js version** compatibility (18+)
2. **Verify all dependencies** are in package.json
3. **Run build locally** first: `npm run vercel-build`

#### **Function timeouts**

1. **Database queries too slow** - check indexing
2. **Connection pool exhausted** - verify connection strings
3. **Memory issues** - increase function memory in vercel.json

### Debug Commands

#### **Local Testing**

```bash
# Check environment
npm run check-env

# Verify Vercel setup
npm run verify-vercel

# Test database locally
npm run create-admin
```

#### **Production Testing**

```bash
# Check deployment
curl https://your-app.vercel.app/api/db-test

# Test health endpoint
curl https://your-app.vercel.app/api/health
```

## 🎯 Final Checklist

- [ ] ✅ Vercel Postgres database created
- [ ] ✅ All environment variables set
- [ ] ✅ Secrets are 32+ characters
- [ ] ✅ NEXTAUTH_URL matches your domain
- [ ] ✅ Database connection test passes
- [ ] ✅ Admin user created successfully
- [ ] ✅ Admin login works
- [ ] ✅ ALLOW_ADMIN_SETUP disabled after setup

## 🔒 Security Recommendations

1. **After initial setup**:

   - Remove `ALLOW_ADMIN_SETUP=true`
   - Change `ADMIN_SETUP_KEY` to something unique

2. **Regular maintenance**:

   - Rotate JWT secrets periodically
   - Monitor database connection usage
   - Review admin user access

3. **Production best practices**:
   - Use strong passwords for admin accounts
   - Enable 2FA if available
   - Monitor application logs for security issues

## 📞 Support

If you encounter issues:

1. **Run diagnostics**: `npm run verify-vercel`
2. **Check logs**: Vercel Dashboard → Functions → View logs
3. **Test endpoints**: Use `/api/db-test` for detailed errors
4. **Verify environment**: Ensure all variables are set correctly

Your Vercel deployment should now be fully configured and ready to use! 🎉
