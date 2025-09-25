# Kylee's Blog - Bible Study Platform

A modern, full-featured blog platform built for Bible study enthusiasts with donation tracking and goal management capabilities.

## Features

- **📝 Rich Text Editor**: User-friendly WYSIWYG editor for non-technical users
- **🎯 Goal Tracking**: Set and track ministry/donation goals with progress bars
- **💰 Donation System**: Accept donations with optional goal targeting
- **🏷️ Tag System**: Organize posts with custom tags
- **📱 Responsive Design**: Beautiful UI that works on all devices
- **🌙 Dark Mode**: Built-in theme switching
- **👨‍💼 Admin Dashboard**: Easy-to-use admin interface for content management
- **🔐 Authentication**: Secure admin login system

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS + ShadCN UI
- **Editor**: TipTap rich text editor
- **Authentication**: Custom auth with bcryptjs
- **Language**: TypeScript

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

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

For production, make sure to:
- Use a strong, random `NEXTAUTH_SECRET`
- Update `NEXTAUTH_URL` to your domain
- Consider using PostgreSQL instead of SQLite

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. For database, consider using:
   - PlanetScale (MySQL)
   - Supabase (PostgreSQL)
   - Railway (PostgreSQL)

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `.next`
4. Add environment variables in Cloudflare dashboard
5. For database, use:
   - Cloudflare D1 (SQLite)
   - External PostgreSQL service

### Database Migration for Production

If moving from SQLite to PostgreSQL/MySQL:

1. Update your `DATABASE_URL` in `.env`
2. Update `prisma/schema.prisma` provider
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

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