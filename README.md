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
- **🔐 Authentication**: Secure JWT-based admin login system
- **🧪 Full Test Coverage**: Unit, integration, and E2E tests
- **⚡ Performance**: Optimized with Next.js 15 and Turbopack
- **🚀 Production Ready**: Complete CI/CD pipeline and deployment configurations

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + ShadCN UI components
- **Editor**: TipTap rich text editor
- **Authentication**: Custom JWT auth with bcryptjs
- **Testing**: Jest + React Testing Library + Playwright
- **Language**: TypeScript
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

Copy `.env.example` to `.env.local` and update the values:

```env
# Database Configuration
DATABASE_URL="postgresql://neondb_owner:npg_f3GNjX2Bruhl@ep-gentle-river-afq83ggv-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"

# Authentication (Generate strong secrets for production)
JWT_SECRET="your-super-secure-jwt-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Next.js Configuration
NODE_ENV="development"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Admin Configuration
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-this-password"
```

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

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
2. Default login: `kylee@example.com` (set up your own admin user)
3. Create and manage blog posts, goals, and view donations

### Content Management

- **Posts**: Create rich-text blog posts with tags and excerpts
- **Goals**: Set fundraising goals with descriptions and deadlines
- **Donations**: Track donations and link them to specific goals

### Customization

- **Branding**: Update site name and description in `src/app/layout.tsx`
- **Styling**: Modify colors and themes in `src/app/globals.css`
- **Content**: Update the About page in `src/app/about/page.tsx`

## Database Schema

The app includes the following main models:

- **User**: Admin users with authentication
- **Post**: Blog posts with rich content and metadata
- **Goal**: Fundraising goals with progress tracking
- **Donation**: Individual donations linked to goals
- **Tag**: Organizational tags for posts

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
