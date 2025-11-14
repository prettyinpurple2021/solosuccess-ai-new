-- CreateTable
CREATE TABLE "PreMortemSimulation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "initiativeTitle" TEXT NOT NULL,
    "description" TEXT,
    "context" JSONB NOT NULL,
    "parameters" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreMortemSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FailureScenario" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "detailedAnalysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FailureScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MitigationStrategy" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "estimatedCost" TEXT,
    "estimatedTime" TEXT,
    "resourceRequirements" JSONB,
    "effectiveness" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MitigationStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreMortemReport" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "riskMatrix" JSONB NOT NULL,
    "topRisks" JSONB NOT NULL,
    "mitigationPlan" JSONB NOT NULL,
    "contingencyPlans" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreMortemReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PreMortemSimulation_userId_status_idx" ON "PreMortemSimulation"("userId", "status");

-- CreateIndex
CREATE INDEX "FailureScenario_simulationId_riskScore_idx" ON "FailureScenario"("simulationId", "riskScore");

-- CreateIndex
CREATE INDEX "MitigationStrategy_scenarioId_priority_idx" ON "MitigationStrategy"("scenarioId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "PreMortemReport_simulationId_key" ON "PreMortemReport"("simulationId");

-- CreateIndex
CREATE INDEX "PreMortemReport_simulationId_idx" ON "PreMortemReport"("simulationId");

-- AddForeignKey
ALTER TABLE "FailureScenario" ADD CONSTRAINT "FailureScenario_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "PreMortemSimulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MitigationStrategy" ADD CONSTRAINT "MitigationStrategy_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "FailureScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreMortemReport" ADD CONSTRAINT "PreMortemReport_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "PreMortemSimulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
