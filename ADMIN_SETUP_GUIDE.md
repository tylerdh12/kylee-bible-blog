# Admin Setup Guide

This guide explains how to create admin users for the Kylee Blog application in both development and production environments.

## Production Setup (Recommended)

### Method 1: Environment Variables + Script (Preferred)

1. **Set Environment Variables in Vercel:**

   ```
   ADMIN_EMAIL=kylee@blog.com
   ADMIN_PASSWORD=your-secure-password
   ADMIN_NAME=Kylee Champion
   ```

2. **Run the Admin Creation Script:**
   ```bash
   npm run create-admin
   ```

### Method 2: Web Interface

1. **Enable Web Setup in Production:**
   Set this environment variable in Vercel:

   ```
   ALLOW_ADMIN_SETUP=true
   ```

2. **Optional: Custom Setup Key:**

   ```
   ADMIN_SETUP_KEY=your-custom-setup-key
   ```

   (Default: `kylee-blog-setup-2024`)

3. **Access Setup Page:**
   Visit: `https://your-app.vercel.app/setup`

4. **Fill in the Form:**

   - Setup Key: `kylee-blog-setup-2024` (or your custom key)
   - Email: `kylee@blog.com`
   - Password: Your secure password
   - Name: `Kylee Champion`

5. **Security Note:**
   After setup, consider removing `ALLOW_ADMIN_SETUP=true` for additional security.

## Development Setup

For local development, the setup route is always available without additional configuration.

### Using the Web Interface

1. **Start Development Server:**

   ```bash
   npm run dev
   ```

2. **Visit Setup Page:**
   Open: `http://localhost:3000/setup`

3. **Use Default Credentials:**
   - Setup Key: `kylee-blog-setup-2024`
   - Email: `kylee@blog.com`
   - Password: Your choice (8+ characters)
   - Name: `Kylee Champion`

### Using the Script

```bash
ADMIN_PASSWORD="your-password" npm run create-admin
```

## API Testing

You can also test the setup API directly:

```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kylee@blog.com",
    "password": "your-password",
    "name": "Kylee Champion",
    "setupKey": "kylee-blog-setup-2024"
  }'
```

## Troubleshooting

### Common Issues

1. **"Admin setup not allowed in production"**

   - Solution: Set `ALLOW_ADMIN_SETUP=true` in your environment variables

2. **"Invalid setup key"**

   - Check that you're using the correct setup key
   - Default is `kylee-blog-setup-2024`
   - Or set `ADMIN_SETUP_KEY` environment variable

3. **"Database connection failed"**

   - **First, test your database connection:** Visit `/api/db-test` for detailed diagnostics
   - **Check environment variables:** Ensure `DATABASE_URL` is set in Vercel
   - **Verify database format:** Should be `postgresql://username:password@hostname:port/database`
   - **For Neon Database:** Use the production connection string provided
   - **Connection pooling:** Ensure your database allows sufficient connections
   - **Network access:** Verify database allows connections from Vercel's IP ranges

4. **"User already exists"**
   - This is normal! The system will update the existing user's password and ensure admin role

### Verifying Setup

After creating an admin user:

1. **Visit Admin Panel:**
   Go to: `https://your-app.vercel.app/admin`

2. **Login with Credentials:**
   Use the email and password you set during setup

3. **Check User Role:**
   The user should have `ADMIN` role and access to all admin features

## Security Best Practices

1. **Strong Passwords:**

   - Use at least 12 characters
   - Include uppercase, lowercase, numbers, and symbols

2. **Environment Variables:**

   - Never commit passwords to version control
   - Use Vercel's secure environment variable storage

3. **Disable Web Setup:**

   - Remove `ALLOW_ADMIN_SETUP=true` after initial setup
   - Use the script method for additional admin users

4. **Custom Setup Key:**
   - Set `ADMIN_SETUP_KEY` to a unique value
   - Keep it secure and don't share publicly

## Admin User Features

Once logged in as admin, you can:

- ✅ Create, edit, and delete blog posts
- ✅ Manage user comments and approve/reject them
- ✅ View and manage prayer requests
- ✅ Set up and track donation goals
- ✅ View site statistics and analytics
- ✅ Manage other users and their roles
- ✅ Configure site settings

## Multiple Admin Users

To create additional admin users:

1. **Use the Script Multiple Times:**

   ```bash
   ADMIN_EMAIL="second@admin.com" ADMIN_PASSWORD="password" npm run create-admin
   ```

2. **Or Use the Web Interface:**
   Visit `/setup` with different email addresses

3. **Through Admin Panel:**
   Existing admins can promote other users to admin role

## Maintenance

- **Regular Password Updates:** Change admin passwords periodically
- **Audit Admin Users:** Review who has admin access regularly
- **Monitor Login Activity:** Check admin login patterns for security
