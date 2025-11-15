-- CreateTable
CREATE TABLE "IntelAcademyIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intelAcademyUserId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntelAcademyIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelAcademyCourse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "courseDescription" TEXT,
    "thumbnailUrl" TEXT,
    "enrollmentDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "lastAccessedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntelAcademyCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelAcademyAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "achievementName" TEXT NOT NULL,
    "achievementType" TEXT NOT NULL,
    "description" TEXT,
    "badgeUrl" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntelAcademyAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "CancellationFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CancellationFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntelAcademyIntegration_userId_key" ON "IntelAcademyIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IntelAcademyIntegration_intelAcademyUserId_key" ON "IntelAcademyIntegration"("intelAcademyUserId");

-- CreateIndex
CREATE INDEX "IntelAcademyIntegration_userId_idx" ON "IntelAcademyIntegration"("userId");

-- CreateIndex
CREATE INDEX "IntelAcademyIntegration_intelAcademyUserId_idx" ON "IntelAcademyIntegration"("intelAcademyUserId");

-- CreateIndex
CREATE INDEX "IntelAcademyCourse_userId_status_idx" ON "IntelAcademyCourse"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "IntelAcademyCourse_userId_courseId_key" ON "IntelAcademyCourse"("userId", "courseId");

-- CreateIndex
CREATE INDEX "IntelAcademyAchievement_userId_earnedAt_idx" ON "IntelAcademyAchievement"("userId", "earnedAt");

-- CreateIndex
CREATE UNIQUE INDEX "IntelAcademyAchievement_userId_achievementId_key" ON "IntelAcademyAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "WebhookEvent_source_status_createdAt_idx" ON "WebhookEvent"("source", "status", "createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_retryCount_idx" ON "WebhookEvent"("status", "retryCount");

-- CreateIndex
CREATE INDEX "UsageTracking_userId_month_idx" ON "UsageTracking"("userId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "UsageTracking_userId_usageType_month_key" ON "UsageTracking"("userId", "usageType", "month");

-- CreateIndex
CREATE INDEX "Alert_userId_read_idx" ON "Alert"("userId", "read");

-- CreateIndex
CREATE INDEX "Alert_userId_createdAt_idx" ON "Alert"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Alert_competitorId_idx" ON "Alert"("competitorId");

-- CreateIndex
CREATE INDEX "SecurityEvent_type_severity_timestamp_idx" ON "SecurityEvent"("type", "severity", "timestamp");

-- CreateIndex
CREATE INDEX "SecurityEvent_userId_timestamp_idx" ON "SecurityEvent"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "SecurityEvent_ip_timestamp_idx" ON "SecurityEvent"("ip", "timestamp");

-- CreateIndex
CREATE INDEX "CancellationFeedback_userId_idx" ON "CancellationFeedback"("userId");

-- CreateIndex
CREATE INDEX "CancellationFeedback_createdAt_idx" ON "CancellationFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "UsageTracking" ADD CONSTRAINT "UsageTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "CompetitorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationFeedback" ADD CONSTRAINT "CancellationFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationFeedback" ADD CONSTRAINT "CancellationFeedback_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
