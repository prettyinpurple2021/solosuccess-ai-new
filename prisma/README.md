# Database Setup Guide

## Prerequisites

1. **PostgreSQL Database**: You need a running PostgreSQL instance
   - Local installation, or
   - Cloud provider (AWS RDS, Supabase, Neon, etc.)

2. **Database Connection**: Update the `DATABASE_URL` in your `.env` file with your actual database credentials

## Database Schema

The schema includes the following models:

### Users and Authentication
- `User` - Core user accounts with authentication
- `UserProfile` - Extended user profile with business information

### AI Conversations and Content
- `Conversation` - AI agent chat history
- `MissionControlSession` - Collaborative AI sessions
- `GeneratedContent` - AI-created content storage

### Business Plans and Goals
- `BusinessPlan` - Business plans with versioning
- `Goal` - Goal tracking with progress metrics

### Competitor Intelligence
- `CompetitorProfile` - Competitor tracking profiles
- `CompetitorActivity` - Competitor activity logs

### Subscriptions and Billing
- `Subscription` - Stripe subscription management

## Setup Instructions

### 1. Configure Database Connection

Update your `.env` file with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

Example for local PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/solosuccess?schema=public"
```

### 2. Run Migrations

Create and apply the database schema:

```bash
npm run prisma:migrate
```

This will:
- Create all tables with proper relationships
- Set up indexes for performance optimization
- Apply the schema to your database

### 3. Generate Prisma Client

Generate the Prisma Client for type-safe database access:

```bash
npm run prisma:generate
```

### 4. Seed Initial Data (Optional)

Run the seed script to populate initial data:

```bash
npm run prisma:seed
```

Note: Agent definitions and subscription tiers are managed in application code, not in the database.

### 5. Verify Setup

Open Prisma Studio to verify your database:

```bash
npm run prisma:studio
```

This will open a browser interface at `http://localhost:5555` where you can view and manage your data.

## Common Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Run seed script
- `npx prisma migrate reset` - Reset database (WARNING: deletes all data)
- `npx prisma db push` - Push schema changes without creating migration

## Troubleshooting

### Connection Issues

If you get authentication errors:
1. Verify your DATABASE_URL is correct
2. Ensure PostgreSQL is running
3. Check that the database exists
4. Verify user credentials and permissions

### Migration Issues

If migrations fail:
1. Check database connection
2. Ensure you have proper permissions
3. Review migration logs for specific errors
4. Consider using `npx prisma migrate reset` to start fresh (development only)

## Production Considerations

1. **Backups**: Set up automated backups (requirement 13.3 specifies every 6 hours)
2. **Indexes**: All performance-critical indexes are included in the schema
3. **Scaling**: Schema supports read replicas and horizontal scaling
4. **Security**: Use strong passwords and restrict database access
5. **Monitoring**: Set up database monitoring and alerting

## Schema Updates

When making schema changes:

1. Update `schema.prisma`
2. Run `npx prisma migrate dev --name description_of_change`
3. Review the generated migration file
4. Test thoroughly before deploying to production
5. For production: `npx prisma migrate deploy`
