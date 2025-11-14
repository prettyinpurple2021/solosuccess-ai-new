-- CreateTable
CREATE TABLE "ShadowSelfAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "totalSteps" INTEGER NOT NULL DEFAULT 0,
    "responses" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShadowSelfAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShadowSelfReport" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "identifiedBiases" JSONB NOT NULL,
    "blindSpots" JSONB NOT NULL,
    "decisionPatterns" JSONB NOT NULL,
    "impactExamples" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "overallScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShadowSelfReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShadowSelfCoachingPrompt" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "promptType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "targetBias" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "userResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShadowSelfCoachingPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShadowSelfReassessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "previousAssessmentId" TEXT NOT NULL,
    "currentAssessmentId" TEXT NOT NULL,
    "comparisonData" JSONB NOT NULL,
    "progressMetrics" JSONB NOT NULL,
    "evolutionPatterns" JSONB NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShadowSelfReassessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "jurisdictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "businessTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "previewUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "customizations" JSONB,
    "jurisdiction" TEXT,
    "businessType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "disclaimerAccepted" BOOLEAN NOT NULL DEFAULT false,
    "disclaimerAcceptedAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "docxUrl" TEXT,
    "shareToken" TEXT,
    "shareExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "changes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentComment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "position" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShadowSelfAssessment_userId_status_idx" ON "ShadowSelfAssessment"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ShadowSelfReport_assessmentId_key" ON "ShadowSelfReport"("assessmentId");

-- CreateIndex
CREATE INDEX "ShadowSelfReport_assessmentId_idx" ON "ShadowSelfReport"("assessmentId");

-- CreateIndex
CREATE INDEX "ShadowSelfCoachingPrompt_assessmentId_deliveredAt_idx" ON "ShadowSelfCoachingPrompt"("assessmentId", "deliveredAt");

-- CreateIndex
CREATE INDEX "ShadowSelfReassessment_userId_scheduledDate_idx" ON "ShadowSelfReassessment"("userId", "scheduledDate");

-- CreateIndex
CREATE INDEX "DocumentTemplate_category_isActive_idx" ON "DocumentTemplate"("category", "isActive");

-- CreateIndex
CREATE INDEX "DocumentTemplate_documentType_idx" ON "DocumentTemplate"("documentType");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedDocument_shareToken_key" ON "GeneratedDocument"("shareToken");

-- CreateIndex
CREATE INDEX "GeneratedDocument_userId_status_idx" ON "GeneratedDocument"("userId", "status");

-- CreateIndex
CREATE INDEX "GeneratedDocument_templateId_idx" ON "GeneratedDocument"("templateId");

-- CreateIndex
CREATE INDEX "GeneratedDocument_shareToken_idx" ON "GeneratedDocument"("shareToken");

-- CreateIndex
CREATE INDEX "DocumentVersion_documentId_version_idx" ON "DocumentVersion"("documentId", "version");

-- CreateIndex
CREATE INDEX "DocumentComment_documentId_resolved_idx" ON "DocumentComment"("documentId", "resolved");

-- AddForeignKey
ALTER TABLE "ShadowSelfReport" ADD CONSTRAINT "ShadowSelfReport_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "ShadowSelfAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShadowSelfCoachingPrompt" ADD CONSTRAINT "ShadowSelfCoachingPrompt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "ShadowSelfAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
