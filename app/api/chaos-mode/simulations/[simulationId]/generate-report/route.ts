import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reportGenerator } from '@/lib/services/chaos-mode-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const { simulationId } = await params;

    // Fetch simulation with all related data
    const simulation = await prisma.preMortemSimulation.findUnique({
      where: { id: simulationId },
      include: {
        scenarios: {
          include: {
            mitigationStrategies: true,
          },
          orderBy: { riskScore: 'desc' },
        },
      },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }

    if (simulation.scenarios.length === 0) {
      return NextResponse.json(
        { error: 'No scenarios found for this simulation' },
        { status: 400 }
      );
    }

    // Generate comprehensive report
    const reportData = await reportGenerator.generatePreMortemReport(
      {
        initiativeTitle: simulation.initiativeTitle,
        description: simulation.description,
        context: simulation.context,
        parameters: simulation.parameters,
      },
      simulation.scenarios as any
    );

    // Save report to database
    const report = await prisma.preMortemReport.upsert({
      where: { simulationId: simulation.id },
      create: {
        simulationId: simulation.id,
        executiveSummary: reportData.executiveSummary,
        riskMatrix: reportData.riskMatrix,
        topRisks: reportData.topRisks,
        mitigationPlan: reportData.mitigationPlan,
        contingencyPlans: reportData.contingencyPlans,
        recommendations: reportData.recommendations,
      },
      update: {
        executiveSummary: reportData.executiveSummary,
        riskMatrix: reportData.riskMatrix,
        topRisks: reportData.topRisks,
        mitigationPlan: reportData.mitigationPlan,
        contingencyPlans: reportData.contingencyPlans,
        recommendations: reportData.recommendations,
      },
    });

    // Update simulation status to completed
    await prisma.preMortemSimulation.update({
      where: { id: simulationId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
    });
  } catch (error) {
    console.error('Error generating report:', error);

    // Update simulation status to failed
    try {
      const { simulationId } = await params;
      await prisma.preMortemSimulation.update({
        where: { id: simulationId },
        data: { status: 'failed' },
      });
    } catch (updateError) {
      console.error('Error updating simulation status:', updateError);
    }

    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
