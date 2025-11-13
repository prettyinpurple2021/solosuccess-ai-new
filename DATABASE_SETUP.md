# Database Setup - Quick Start Guide

This guide will help you set up the PostgreSQL database for SoloSuccess AI.

## Quick Setup (3 Steps)

### Step 1: Install PostgreSQL

Choose one option:

**Option A: Local PostgreSQL**
- Download from [postgresql.org](https://www.postgresql.org/download/)
- Install and remember your password
- Default runs on `localhost:5432`

**Option B: Cloud Database (Recommended for beginners)**
- [Supabase](https://supabase.com/) - Free tier available
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Railway](https://railway.app/) - Easy deployment

### Step 2: Configure Connection

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `DATABASE_URL` in `.env` with your connection string:

   **For local PostgreSQL:**
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/solosuccess?schema=public"
   ```

   **For cloud providers:**
   - Copy the connection string from your provider's dashboard
   - Paste it as the `DATABASE_URL` value

### Step 3: Run Migrations

```bash
npm run prisma:migrate
```

This creates all database tables automatically.

## Verify Setup

Run the verification script to ensure everything is working:

```bash
npm run prisma:verify
```

You should see ✅ checkmarks for all tables.

## View Your Database

Open Prisma Studio to see your database in a visual interface:

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

## Troubleshooting

### "Authentication failed" error
- Check your username and password in DATABASE_URL
- Ensure PostgreSQL is running
- Verify the database exists

### "Connection refused" error
- PostgreSQL might not be running
- Check the host and port in DATABASE_URL
- For local: ensure PostgreSQL service is started

### "Database does not exist" error
Create the database first:
```sql
CREATE DATABASE solosuccess;
```

## What's Created?

The migration creates these tables:

✅ **Users & Auth**: User, UserProfile  
✅ **AI Features**: Conversation, MissionControlSession, GeneratedContent  
✅ **Business**: BusinessPlan, Goal  
✅ **Intelligence**: CompetitorProfile, CompetitorActivity  
✅ **Billing**: Subscription  

All tables include:
- Proper relationships and foreign keys
- Performance indexes
- Timestamps (createdAt, updatedAt)

## Next Steps

After database setup:

1. ✅ Database is ready
2. 🚀 Start development: `npm run dev`
3. 📝 Begin implementing features

For detailed information, see `prisma/README.md`
