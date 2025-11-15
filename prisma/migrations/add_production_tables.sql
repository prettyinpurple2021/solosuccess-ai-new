-- Migration: Add Production-Ready Tables
-- Description: Adds missing tables for usage tracking, alerts, security events, and cancellation feedback
-- Date: 2024

-- UsageTracking table for optimized subscription usage monitoring
CREATE TABLE "UsageTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usageType" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "month" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageTracking_pkey" PRIMARY KEY ("id")
);

-- Alert table for competitor tracking alerts
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "importance" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "sentEmail" BOOLEAN NOT NULL DEFAULT false,
    "sentPush" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- SecurityEvent table for security monitoring and audit logs
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "resource" TEXT,
    "action" TEXT,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CancellationFeedback table for subscription cancellation insights
CREATE TABLE "CancellationFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CancellationFeedback_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for UsageTracking
CREATE UNIQUE INDEX "UsageTracking_userId_usageType_month_key" ON "UsageTracking"("userId", "usageType", "month");

-- Create indexes for UsageTracking
CREATE INDEX "UsageTracking_userId_month_idx" ON "UsageTracking"("userId", "month");

-- Create indexes for Alert
CREATE INDEX "Alert_userId_read_idx" ON "Alert"("userId", "read");
CREATE INDEX "Alert_userId_createdAt_idx" ON "Alert"("userId", "createdAt");
CREATE INDEX "Alert_competitorId_idx" ON "Alert"("competitorId");

-- Create indexes for SecurityEvent
CREATE INDEX "SecurityEvent_type_severity_timestamp_idx" ON "SecurityEvent"("type", "severity", "timestamp");
CREATE INDEX "SecurityEvent_userId_timestamp_idx" ON "SecurityEvent"("userId", "timestamp");
CREATE INDEX "SecurityEvent_ip_timestamp_idx" ON "SecurityEvent"("ip", "timestamp");

-- Create indexes for CancellationFeedback
CREATE INDEX "CancellationFeedback_userId_idx" ON "CancellationFeedback"("userId");
CREATE INDEX "CancellationFeedback_createdAt_idx" ON "CancellationFeedback"("createdAt");

-- Add foreign key constraints
ALTER TABLE "UsageTracking" ADD CONSTRAINT "UsageTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "CompetitorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CancellationFeedback" ADD CONSTRAINT "CancellationFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CancellationFeedback" ADD CONSTRAINT "CancellationFeedback_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
