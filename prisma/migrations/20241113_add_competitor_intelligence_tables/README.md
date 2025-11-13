# Migration: Add Competitor Intelligence Tables

**Date:** November 13, 2024  
**Task:** 2.4 Create competitor intelligence tables  
**Requirements:** 3.1, 3.2

## Overview

This migration adds the competitor intelligence feature tables to support the Competitor Stalker functionality. This allows users to track competitors, monitor their activities, and receive intelligence briefings.

## Tables Created

### CompetitorProfile

Stores information about competitors that users want to track.

**Fields:**
- `id` (UUID) - Primary key
- `userId` (UUID) - Foreign key to User table
- `name` (String) - Competitor name
- `website` (String, optional) - Competitor website URL
- `industry` (String, optional) - Industry classification
- `description` (String, optional) - Description of the competitor
- `trackingSources` (JSONB) - Configuration for tracking sources (websites, social media, etc.)
- `metadata` (JSONB, optional) - Additional metadata
- `isActive` (Boolean) - Whether tracking is active (default: true)
- `createdAt` (DateTime) - Record creation timestamp
- `updatedAt` (DateTime) - Record update timestamp

**Relationships:**
- Belongs to User (CASCADE delete)
- Has many CompetitorActivity records

**Indexes:**
- `[userId, isActive]` - Optimized for querying active competitors by user

### CompetitorActivity

Stores detected competitor activities and events.

**Fields:**
- `id` (UUID) - Primary key
- `competitorId` (UUID) - Foreign key to CompetitorProfile table
- `activityType` (String) - Type of activity (e.g., "product_launch", "blog_post", "social_media")
- `title` (String) - Activity title
- `description` (String, optional) - Detailed description
- `sourceUrl` (String, optional) - URL where activity was detected
- `detectedAt` (DateTime) - When the activity was detected
- `importance` (String) - Importance level: "low", "medium", "high", "critical" (default: "medium")
- `metadata` (JSONB, optional) - Additional tracking metadata
- `createdAt` (DateTime) - Record creation timestamp

**Relationships:**
- Belongs to CompetitorProfile (CASCADE delete)

**Indexes:**
- `[competitorId, detectedAt]` - Optimized for querying activities by competitor and time

## Features Enabled

This migration enables the following features:

1. **Competitor Tracking** (Requirement 3.1)
   - Users can add up to 10 competitors to track
   - Configure tracking sources (websites, social media, public data)
   - Store competitor profiles with business context

2. **Activity Monitoring** (Requirement 3.2)
   - Detect and log competitor activities
   - Track activity types and importance levels
   - Store source URLs for reference
   - Generate daily intelligence briefings

3. **Efficient Querying**
   - Composite indexes for fast lookups
   - Optimized for time-based queries (recent activities)
   - Efficient filtering by user and active status

## Usage Example

```typescript
// Create a competitor profile
const competitor = await prisma.competitorProfile.create({
  data: {
    userId: user.id,
    name: "Acme Corp",
    website: "https://acmecorp.com",
    industry: "SaaS",
    description: "Direct competitor in the AI tools space",
    trackingSources: {
      website: true,
      twitter: "@acmecorp",
      linkedin: "acme-corp"
    },
    isActive: true
  }
});

// Log a competitor activity
const activity = await prisma.competitorActivity.create({
  data: {
    competitorId: competitor.id,
    activityType: "product_launch",
    title: "Acme Corp launches new AI feature",
    description: "Competitor announced AI-powered analytics",
    sourceUrl: "https://acmecorp.com/blog/new-feature",
    detectedAt: new Date(),
    importance: "high",
    metadata: {
      sentiment: "positive",
      keywords: ["AI", "analytics", "automation"]
    }
  }
});

// Query recent high-importance activities
const recentActivities = await prisma.competitorActivity.findMany({
  where: {
    competitor: {
      userId: user.id,
      isActive: true
    },
    importance: "high",
    detectedAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    }
  },
  include: {
    competitor: true
  },
  orderBy: {
    detectedAt: 'desc'
  }
});
```

## Running the Migration

When the database is connected, run:

```bash
npm run prisma:migrate
```

Or manually:

```bash
npx prisma migrate deploy
```

## Verification

After running the migration, verify the tables exist:

```bash
npx prisma studio
```

Check for:
- ✅ CompetitorProfile table
- ✅ CompetitorActivity table
- ✅ Foreign key relationships
- ✅ Indexes on userId/isActive and competitorId/detectedAt

## Next Steps

After this migration:

1. Implement competitor tracking service (Task 10.2)
2. Build web scraping functionality
3. Create intelligence briefing system (Task 10.3)
4. Implement alert system (Task 10.4)
5. Build spy-themed UI (Task 10.5)
