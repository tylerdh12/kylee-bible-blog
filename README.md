# Kylee's Bible Blog Platform

A modern, production-ready blog platform built specifically for Bible study enthusiasts with comprehensive donation tracking and goal management capabilities.

## 🌟 Features

- **📝 Rich Text Editor**: User-friendly WYSIWYG editor with TipTap
- **🎯 Goal Tracking**: Set and track ministry/donation goals with visual progress bars
- **💰 Donation System**: Accept donations with optional goal targeting
- **🏷️ Tag System**: Organize posts with custom tags
- **📱 Responsive Design**: Beautiful, mobile-first UI that works on all devices
- **🌙 Dark Mode**: Built-in theme switching with system preference detection
- **👨‍💼 Admin Dashboard**: Comprehensive admin interface for content management
- **🔐 Authentication**: Better Auth with role-based access control
- **🧪 Full Test Coverage**: Unit, integration, and E2E tests
- **⚡ Performance**: Optimized with Next.js 15 and Turbopack
- **🚀 Production Ready**: Complete CI/CD pipeline and deployment configurations

## 🔒 Security

This application implements comprehensive security measures:

### Authentication & Authorization
- **JWT-based authentication** with secure httpOnly cookies
- **Role-Based Access Control (RBAC)** for admin endpoints
- **Password strength validation** (minimum 12 characters, complexity requirements)
- **Bcrypt password hashing** with 12 salt rounds
- **Rate limiting** on login endpoints to prevent brute force attacks

### Input Validation & Sanitization
- **XSS prevention** with DOMPurify sanitization for all user-generated content
- **Input validation** for all API endpoints
- **Secure file upload** handling with type validation

### API Security
- **Authentication middleware** protecting all admin routes
- **Permission checks** on sensitive operations
- **No diagnostic endpoints** exposed in production
- **Secure error handling** without information leakage

### Database Security
- **Parameterized queries** via Prisma ORM
- **SQL injection prevention**
- **Environment-based credentials** (no hardcoded secrets)

### Production Best Practices
- **Security headers** configured in Next.js
- **HTTPS enforcement** in production
- **Environment variable validation**
- **Secure session management**

For detailed security documentation, see [SECURITY_ISSUES_AND_FIXES.md](./SECURITY_ISSUES_AND_FIXES.md).

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + ShadCN UI components
- **Editor**: TipTap 3.x rich text editor
- **Authentication**: Better Auth with email/password and session management
- **Security**: DOMPurify for XSS prevention, RBAC, rate limiting
- **Error Monitoring**: Sentry for error tracking and performance monitoring
- **Testing**: Jest + React Testing Library + Playwright
- **Language**: TypeScript with strict mode
- **Deployment**: Vercel optimized with security headers

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd kylee-blog
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Create your admin user (optional - will be created automatically):

   ```bash
   npx prisma studio
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

This project includes comprehensive testing:

### Unit Tests

```bash
npm test                # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### End-to-End Tests

```bash
npm run test:e2e        # Run Playwright E2E tests
npm run test:e2e:ui     # Run E2E tests with UI
```

### Run All Tests

```bash
npm run test:all        # Run both unit and E2E tests
```

## 🌍 Environment Variables

**⚠️ Security Notice**: All scripts now require proper environment variables to prevent hardcoded secrets. Copy `.env.example` to `.env.local` and update the values:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/kylee_blog"

# Authentication (Better Auth - REQUIRED)
BETTER_AUTH_SECRET="your-super-secure-secret-key-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Legacy support (optional - for backward compatibility)
JWT_SECRET="your-super-secure-jwt-secret-key-minimum-32-characters"
NEXTAUTH_SECRET="your-nextauth-secret-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Admin Configuration (REQUIRED for scripts)
ADMIN_DEFAULT_PASSWORD="your-secure-admin-password-here"

# Mock Database (for development/testing only)
MOCK_ADMIN_PASSWORD_HASH="$2b$12$vTCWqUKNTGANclWDOkqXe.yKfRI/J1mIbtn5JjbL57oD71KTooBm."

# Next.js Configuration
NODE_ENV="development"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Email Service (Optional - Resend)
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="noreply@yourdomain.com"

# Sentry Configuration (Optional)
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn-here"
SENTRY_AUTH_TOKEN="your-sentry-auth-token-here"
```

**Important Security Notes**:

- `BETTER_AUTH_SECRET` is **required** - generate a secure random string (minimum 32 characters)
- Never commit `.env.local` to version control
- Use strong, unique passwords for production
- Generate secure random strings for all secrets (use `openssl rand -base64 32`)

For production deployment, see [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) and [PRODUCTION_READY.md](./PRODUCTION_READY.md) for detailed instructions.
For database setup, see [DATABASE_SETUP.md](./DATABASE_SETUP.md).
For admin user creation, see [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md).

## 🚀 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/kylee-blog)

### Manual Deployment

1. **Set up environment variables** in your hosting platform
2. **Configure database** (PostgreSQL for production)
3. **Run build and deployment**:
   ```bash
   npm run build
   npm start
   ```

### Supported Platforms

- **Vercel** ⭐ (Recommended - optimized configuration included)
- **Netlify**
- **Cloudflare Pages**
- **Traditional VPS/Server**
- **Docker** (Dockerfile included)

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Usage

### Admin Access

1. Visit `/admin` to access the admin dashboard
2. Create your first admin user using the setup script (see [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md))
3. Create and manage blog posts, goals, users, and view donations

### Content Management

- **Posts**: Create rich-text blog posts with tags and excerpts
- **Goals**: Set fundraising goals with descriptions and deadlines
- **Donations**: Track donations and link them to specific goals

### Customization

- **Branding**: Update site name and description in `src/app/layout.tsx`
- **Styling**: Modify colors and themes in `src/app/globals.css`
- **Content**: Update the About page in `src/app/about/page.tsx`

## Database Schema

The app uses Prisma with PostgreSQL and includes the following main models:

- **User**: Users with Better Auth authentication (roles: ADMIN, DEVELOPER, SUBSCRIBER)
- **Session**: Active user sessions (Better Auth)
- **Account**: User accounts for authentication (Better Auth)
- **Post**: Blog posts with rich content and metadata
- **Comment**: User comments on posts
- **Goal**: Fundraising goals with progress tracking
- **Donation**: Individual donations linked to goals
- **Tag**: Organizational tags for posts
- **SiteContent**: Static site content management

See `prisma/schema.prisma` for the complete schema definition.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or need help with deployment, please open an issue on GitHub.

---

Built with ❤️ for ministry and community building.
