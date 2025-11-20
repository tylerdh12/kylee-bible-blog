# Migration Notes

## Security & Build Improvements - January 2025

This document outlines the changes made in this release and migration steps for existing deployments.

### 🔒 Critical Security Fixes

This release includes **10 critical security fixes** that should be deployed immediately:

1. **Removed Diagnostic Endpoints** - Deleted `/api/database-diagnostic` and `/api/db-test` routes
2. **Protected Prayer Requests** - Added authentication and RBAC to admin prayer requests endpoint
3. **Rate Limiting** - Implemented rate limiting on login endpoint to prevent brute force attacks
4. **Removed Hardcoded Secrets** - Eliminated fallback setup key from admin setup route
5. **RBAC Enforcement** - Added role-based access control to all admin endpoints
6. **XSS Prevention** - Implemented DOMPurify sanitization for all user-generated content
7. **Password Strength** - Enforced strong password requirements (12+ chars, complexity)
8. **Dependency Updates** - Resolved TipTap version conflicts and updated to 3.5.3
9. **Build Validation** - Enabled TypeScript and ESLint strict checking
10. **Font Loading** - Removed network-dependent Google Fonts, using system fonts

### 📦 New Dependencies

Add the following dependency to your project:

```bash
npm install isomorphic-dompurify@2.32.0
```

### 🔄 Breaking Changes

#### 1. Authentication Token Name Changed

**Old**: `auth_token` cookie
**New**: `auth-token` cookie

**Impact**: Users will be logged out after deployment and need to log in again.

#### 2. Password Requirements

New minimum requirements for all passwords:
- Minimum 12 characters (was 8)
- Must contain: lowercase, uppercase, number, special character
- Cannot use common passwords

**Action Required**: Existing users may need to reset passwords if they don't meet new requirements.

#### 3. TipTap Version Update

**Old**: Mixed versions (2.x and 3.x)
**New**: Standardized on 3.5.3

**Action Required**: Update all TipTap extensions:

```bash
npm install @tiptap/extension-history@3.5.3 \
  @tiptap/extension-placeholder@3.5.3 \
  @tiptap/extension-text-style@3.5.3
```

#### 4. Environment Variables

**Required** environment variables (must be set before deployment):

```env
# JWT Secret (minimum 32 characters)
JWT_SECRET="your-secure-jwt-secret-minimum-32-characters"

# Admin Setup Key (for initial admin creation)
ADMIN_SETUP_KEY="your-secure-setup-key"
```

**Action Required**:
- Generate secure random strings for both variables
- Add to your deployment platform's environment variables
- Remove any hardcoded values from your code

### 🚀 Deployment Steps

#### For Existing Deployments

1. **Backup Your Database**
   ```bash
   # Create a backup before deploying
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

2. **Update Environment Variables**
   ```bash
   # Generate secure JWT secret (32+ characters)
   openssl rand -base64 32

   # Add to your deployment platform:
   # Vercel: vercel env add JWT_SECRET
   # Railway: railway variables set JWT_SECRET=...
   # Netlify: netlify env:set JWT_SECRET ...
   ```

3. **Update Dependencies**
   ```bash
   npm install
   ```

4. **Run Database Migration** (if needed)
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Build and Test Locally**
   ```bash
   npm run build
   npm run lint
   ```

6. **Deploy**
   ```bash
   # Vercel
   vercel --prod

   # Or push to your git branch
   git push origin main
   ```

7. **Verify Deployment**
   - Test login functionality
   - Verify admin endpoints require authentication
   - Check that posts display correctly with sanitized content

#### For New Deployments

Follow the standard deployment guide in [DEPLOYMENT.md](./DEPLOYMENT.md).

### 🔍 What Changed

#### Files Modified

**Security Fixes:**
- `src/app/api/admin/prayer-requests/route.ts` - Added authentication
- `src/app/api/auth/login/route.ts` - Added rate limiting
- `src/app/api/admin/setup/route.ts` - Removed hardcoded key, added password validation
- `src/app/api/posts/route.ts` - Added content sanitization
- `src/lib/auth.ts` - Updated token validation and password hashing

**New Files:**
- `src/lib/utils/sanitize.ts` - XSS prevention utilities
- `src/lib/validation/password.ts` - Password strength validation
- `src/lib/rbac.ts` - Role-based access control

**Deleted Files:**
- `src/app/api/database-diagnostic/route.ts` - Security risk
- `src/app/api/db-test/route.ts` - Security risk

**Build Fixes:**
- `src/components/rich-text-editor.tsx` - Fixed TipTap imports and config
- `src/app/layout.tsx` - Removed Google Fonts
- `tailwind.config.js` - Added system font fallbacks
- `package.json` - Updated TipTap dependencies
- `next.config.ts` - Enabled strict validation

#### Configuration Changes

**next.config.ts:**
```typescript
eslint: { ignoreDuringBuilds: false },  // Enabled
typescript: { ignoreBuildErrors: false }  // Enabled
```

**package.json:**
```json
"@tiptap/extension-history": "3.5.3",
"@tiptap/extension-placeholder": "3.5.3",
"@tiptap/extension-text-style": "3.5.3",
"isomorphic-dompurify": "2.32.0"
```

### ⚠️ Important Notes

1. **User Sessions**: All active sessions will be invalidated due to cookie name change
2. **Admin Access**: Ensure you have access to create a new admin user if needed
3. **Password Reset**: Some users may need to reset passwords to meet new requirements
4. **Build Time**: First build may take longer due to dependency updates
5. **Monitoring**: Watch error logs for 24-48 hours after deployment

### 📊 Testing Checklist

After deployment, verify:

- [ ] Admin login works correctly
- [ ] Posts are created and displayed with proper sanitization
- [ ] Rate limiting triggers after multiple failed login attempts
- [ ] All admin endpoints require authentication
- [ ] Prayer requests are protected
- [ ] New passwords meet strength requirements
- [ ] Rich text editor works correctly
- [ ] Font rendering is correct (system fonts)

### 🆘 Rollback Procedure

If issues arise:

1. **Revert to Previous Version**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Restore Database** (if needed)
   ```bash
   psql $DATABASE_URL < backup-YYYYMMDD.sql
   ```

3. **Report Issues**
   - Document the error
   - Check logs for details
   - Open an issue on GitHub

### 📚 Additional Resources

- [SECURITY_ISSUES_AND_FIXES.md](./SECURITY_ISSUES_AND_FIXES.md) - Detailed security analysis
- [APPLICATION_REVIEW.md](./APPLICATION_REVIEW.md) - Complete application review
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [README.md](./README.md) - Updated with security features

### 🤝 Support

If you encounter any issues during migration:

1. Check this document for common issues
2. Review the security documentation
3. Open an issue on GitHub with:
   - Deployment platform
   - Error messages
   - Steps to reproduce

---

**Migration Date**: January 2025
**Version**: Security & Build Improvements Release
**Severity**: Critical - Deploy immediately
