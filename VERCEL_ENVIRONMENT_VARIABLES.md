# Vercel Environment Variables Setup

## Required Environment Variables for Vercel Deployment

Set these environment variables in your Vercel project dashboard under **Settings → Environment Variables**.

### Database Configuration

```bash
DATABASE_URL="postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
```

**Important Notes:**
- This is the production Neon PostgreSQL database
- SSL mode is required for security
- Connection includes built-in pooling for Vercel compatibility

### Authentication Configuration

```bash
# JWT Secret (minimum 32 characters)
JWT_SECRET="your-strong-jwt-secret-minimum-32-characters"

# NextAuth Secret (minimum 32 characters) 
NEXTAUTH_SECRET="your-strong-nextauth-secret-minimum-32-characters"

# Your deployed Vercel URL
NEXTAUTH_URL="https://your-app-name.vercel.app"
```

### Application Settings

```bash
# Environment mode
NODE_ENV="production"

# Optional: Skip environment validation during build
SKIP_ENV_VALIDATION="true"
```

### Admin Setup (Optional - for initial deployment only)

```bash
# Enable admin setup endpoint temporarily
ALLOW_ADMIN_SETUP="true"

# Admin user details
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="your-secure-admin-password"
ADMIN_NAME="Admin User"
```

## Environment Variable Setup Instructions

### 1. Using Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add each variable above with appropriate values
4. Deploy your application

### 2. Using Vercel CLI

```bash
# Set production environment variables
vercel env add DATABASE_URL production
# Paste: postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require

vercel env add JWT_SECRET production
# Generate: openssl rand -base64 32

vercel env add NEXTAUTH_SECRET production
# Generate: openssl rand -base64 32

vercel env add NEXTAUTH_URL production
# Enter: https://your-domain.vercel.app

vercel env add NODE_ENV production
# Enter: production
```

## Environment-Specific Configuration

### Production Environment
- Use all variables listed above
- Ensure `ALLOW_ADMIN_SETUP` is set to `"false"` after initial setup
- Strong secrets for JWT_SECRET and NEXTAUTH_SECRET

### Preview/Staging Environment
- Same variables as production
- Different NEXTAUTH_URL (preview domain)
- Can use same database or separate staging database
- Can keep `ALLOW_ADMIN_SETUP` as `"true"` for testing

### Development (Local)
- Create `.env.local` file with same variables
- NEXTAUTH_URL should be `"http://localhost:3000"`
- Can use `ALLOW_ADMIN_SETUP="true"` for convenience

## Security Best Practices

1. **Strong Secrets**: Use minimum 32-character random strings for JWT_SECRET and NEXTAUTH_SECRET
2. **Database Security**: The DATABASE_URL includes SSL mode for secure connections
3. **Admin Setup**: Disable `ALLOW_ADMIN_SETUP` after creating admin users
4. **Environment Isolation**: Use different secrets for different environments

## Generating Secure Secrets

```bash
# Generate secure random strings (32+ characters)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Verification

After setting up environment variables:

1. **Check Variables**: Visit Vercel project → Settings → Environment Variables
2. **Test Connection**: Deploy and visit `/api/db-test` for database diagnostics
3. **Verify Build**: Check Vercel build logs for any missing variables
4. **Test Admin Setup**: If enabled, visit `/admin` to create first admin user

## Troubleshooting

### Common Issues

1. **"Missing environment variables"**
   - Ensure all required variables are set in Vercel dashboard
   - Check variable names match exactly (case-sensitive)
   - Redeploy after adding variables

2. **"Database connection failed"**
   - Verify DATABASE_URL is correctly set
   - Ensure Neon database is active and accessible
   - Check connection string format

3. **"Authentication errors"**
   - Verify JWT_SECRET and NEXTAUTH_SECRET are set
   - Ensure secrets are minimum 32 characters
   - Check NEXTAUTH_URL matches your deployed domain

## Migration from POSTGRES_PRISMA_URL

If you previously used Vercel Postgres with `POSTGRES_PRISMA_URL`, the application now exclusively uses `DATABASE_URL` for the Neon PostgreSQL database. No migration is needed - just set the `DATABASE_URL` variable and remove any `POSTGRES_PRISMA_URL` references.
