# Neon Database Setup for Kylee Blog

## 🎯 **Exact Configuration for Your Neon Database**

This guide provides the exact configuration needed for your specific Neon PostgreSQL database.

### **Database Details**
- **Provider**: Neon (Serverless PostgreSQL)
- **Host**: `ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech`
- **Database**: `neondb`
- **User**: `neondb_owner`
- **Region**: US West 2 (AWS)
- **Connection Pooling**: Enabled (pooler endpoint)

---

## 🔧 **Vercel Environment Variables**

### **Required Environment Variables**

Set these **exact** variables in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

#### **Database Configuration**
```bash
DATABASE_URL="postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
```

#### **Authentication & Security**
```bash
JWT_SECRET="your-secure-32-character-jwt-secret-here"
NEXTAUTH_SECRET="your-secure-32-character-nextauth-secret"
NEXTAUTH_URL="https://your-app-name.vercel.app"
```

#### **Admin Setup (Temporary)**
```bash
ALLOW_ADMIN_SETUP="true"
```

#### **Optional Build Optimizations**
```bash
NODE_OPTIONS="--max-old-space-size=4096"
PRISMA_GENERATE_SKIP_AUTOINSTALL="true"
```

---

## 🧪 **Testing Your Configuration**

### **Step 1: Test Database Connection Locally**

Run the Neon-specific connection test:

```bash
node scripts/test-neon-connection.js
```

**Expected Output:**
```
🔗 Testing Neon Database Connection...
🔌 Attempting to connect to Neon database...
✅ Connection successful!
🧪 Testing basic query...
✅ Query successful!
📊 Database Info:
   Time: 2024-01-XX XX:XX:XX
   Version: PostgreSQL 16.x
   Database: neondb
   User: neondb_owner
✅ User table accessible - Count: 0
🎉 All tests passed! Neon database is properly configured.
```

### **Step 2: Test Production Database Connection**

After deployment, visit:
```
https://your-app.vercel.app/api/db-test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "details": {
    "userCount": 0,
    "environment": "production"
  },
  "duration": "45ms",
  "dbUrl": "postgresql://neondb_owner:***@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
}
```

---

## 🚀 **Deployment Steps**

### **Step 1: Set Environment Variables**

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Navigate to Settings → Environment Variables**
4. **Add each variable** from the list above
5. **Set for**: Production, Preview, and Development

### **Step 2: Deploy**

```bash
git add -A
git commit -m "Configure Neon database with correct environment variables"
git push origin main
```

### **Step 3: Run Database Migrations**

After successful deployment:

```bash
# Option 1: Use Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Option 2: Use the admin setup route (first time only)
# Visit: https://your-app.vercel.app/setup
```

---

## 👤 **Admin User Setup**

### **Using the Setup Route** (Recommended)

1. **Visit**: `https://your-app.vercel.app/setup`
2. **Enter**:
   - **Setup Key**: `kylee-blog-setup-2024`
   - **Email**: `kylee@blog.com`
   - **Password**: Your secure password
   - **Name**: `Kylee Champion`
3. **Submit**

### **Using Production Script** (Alternative)

```bash
npm run create-admin
```

---

## 🔍 **Troubleshooting**

### **Common Issues & Solutions**

#### **"Database connection failed"**
- ✅ Verify `DATABASE_URL` is exactly as shown above
- ✅ Check Vercel environment variables are saved
- ✅ Redeploy after changing environment variables

#### **"prisma:// protocol error"**
- ✅ Run: `npm run postinstall` (regenerates Prisma client)
- ✅ Verify schema uses `url = env("DATABASE_URL")`
- ✅ Clear cache: `rm -rf node_modules/.prisma`

#### **"No admin user found"**
- ✅ Run database migrations: `npx prisma db push`
- ✅ Use setup route: `/setup`
- ✅ Check `ALLOW_ADMIN_SETUP="true"` is set

#### **Build failures**
- ✅ Verify Node.js version ≥ 18
- ✅ Check all dependencies are in `dependencies` (not `devDependencies`)
- ✅ Set `NODE_OPTIONS="--max-old-space-size=4096"`

---

## 📋 **Verification Checklist**

- [ ] `DATABASE_URL` set with exact Neon connection string
- [ ] `JWT_SECRET` and `NEXTAUTH_SECRET` generated (32+ characters)
- [ ] `NEXTAUTH_URL` points to your Vercel app
- [ ] `ALLOW_ADMIN_SETUP="true"` set temporarily
- [ ] `/api/db-test` returns success
- [ ] `/api/status` returns healthy status
- [ ] `/setup` creates admin user successfully
- [ ] Admin can log in at `/admin`

---

## 🔐 **Security Notes**

1. **After creating admin user**, remove `ALLOW_ADMIN_SETUP` environment variable
2. **Use strong passwords** for JWT secrets (generate with `openssl rand -hex 32`)
3. **Change default setup key** if needed (set `ADMIN_SETUP_KEY` env var)
4. **Enable two-factor authentication** once admin user is created
5. **Regularly rotate secrets** and database passwords

---

## 📞 **Support**

If you encounter issues:

1. **Check logs**: Vercel Dashboard → Functions → View Function Logs
2. **Test connection**: Run `node scripts/test-neon-connection.js`
3. **Verify env vars**: Visit `/api/status` for environment validation
4. **Database diagnostics**: Visit `/api/db-test` for detailed connection info

Your Neon database is now properly configured for production! 🎉
