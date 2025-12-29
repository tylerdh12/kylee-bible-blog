# Site Content Management Setup Guide

This guide will help you set up and use the Site Content Management feature.

## Overview

The Site Content Management system allows you to manage all static content on your home and about pages through the admin panel. This includes:

- **Home Page**: Hero title/description, section titles
- **About Page**: Page title/subtitle, journey content, mission statement, and more

## Setup Steps

### 1. Run Database Migration

First, you need to add the `SiteContent` table to your database. Run one of these commands:

```bash
# For development (uses db push)
npm run migrate

# Or manually
npx prisma db push

# For production (uses migrations)
npx prisma migrate deploy
```

### 2. Seed Default Content (Optional)

To populate the database with default content, run:

```bash
npm run seed
```

Or manually:

```bash
node scripts/seed-database.js
```

This will create all the default content items that match what's currently on your pages.

### 3. Access the Admin Panel

1. Log in to your admin panel at `/admin`
2. Navigate to **Content** → **Site Content** in the sidebar
3. You'll see tabs for **Home Page** and **About Page**

## Using the Site Content Manager

### Home Page Content

The Home Page tab allows you to edit:

- **Hero Section**
  - Title: Main heading on the home page
  - Description: Subtitle/description text below the title

- **Recent Posts Section**
  - Section Title: Heading for the recent posts section

- **Goals Section**
  - Section Title: Heading for the goals section

### About Page Content

The About Page tab allows you to edit:

- **Page Header**
  - Page Title: Main heading
  - Subtitle: Subheading below the title

- **My Journey Card**
  - Card Title: Title of the journey card
  - Card Content: Full text content (supports multiple paragraphs)

- **What You'll Find Here Card**
  - Card Title: Title of the card
  - List Items: One item per line (each line becomes a bullet point)

- **My Mission Card**
  - Card Title: Title of the mission card
  - Card Content: Full text content (supports quotes and multiple paragraphs)

- **Get Involved Card**
  - Card Title: Title of the card
  - Join the Conversation: Text for the first section
  - Support the Ministry: Text for the second section

## How It Works

1. **Default Content**: The admin page includes default content that matches your current static pages
2. **Database Storage**: When you save, content is stored in the `SiteContent` table
3. **Dynamic Display**: The home and about pages automatically fetch and display content from the database
4. **Fallback**: If content doesn't exist in the database, pages fall back to default values

## API Endpoints

### Admin Endpoints (Requires Authentication)

- `GET /api/admin/site-content` - Get all site content
- `GET /api/admin/site-content?page=home` - Get content for a specific page
- `POST /api/admin/site-content` - Create or update site content

### Public Endpoints

- `GET /api/site-content?page=home` - Get public site content
- `GET /api/site-content?key=home.hero.title` - Get specific content item

## Troubleshooting

### Content Not Showing Up

1. **Check Database**: Make sure the migration ran successfully
   ```bash
   npx prisma studio
   ```
   Look for the `SiteContent` table

2. **Check Permissions**: Make sure you're logged in as an admin user

3. **Check Console**: Open browser dev tools and check for API errors

### Migration Issues

If you get migration errors:

```bash
# Reset and push schema (WARNING: This will delete data in development)
npx prisma migrate reset

# Or just push the schema
npx prisma db push
```

### Content Not Saving

1. Check browser console for errors
2. Verify you have `write:content` permission (ADMIN or DEVELOPER roles)
3. Check network tab to see if API calls are failing

## Technical Details

### Database Schema

```prisma
model SiteContent {
  id          String   @id @default(cuid())
  key         String   @unique
  page        String   // 'home' or 'about'
  section     String   // 'hero', 'recent-posts', 'goals', etc.
  title       String?
  content     String   @default("")
  contentType String   @default("text") // 'text', 'html', 'list'
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Content Keys

Content is identified by unique keys in the format: `{page}.{section}.{field}`

Examples:
- `home.hero.title`
- `home.hero.description`
- `about.journey.content`
- `about.mission.title`

## Next Steps

After setting up:

1. Run the migration: `npm run migrate`
2. Seed default content: `npm run seed` (optional)
3. Visit `/admin/site-content` to start editing
4. Make changes and click "Save All Changes"
5. Visit your home and about pages to see the updates

## Support

If you encounter any issues, check:
- Database connection is working
- Prisma client is generated (`npx prisma generate`)
- You're logged in with proper permissions
- API routes are accessible
