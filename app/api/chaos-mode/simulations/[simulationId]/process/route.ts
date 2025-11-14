import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chaosModeService } from '@/lib/services/chaos-mode-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const { simulationId } = await params;

    // Fetch simulation
    const simulation = await prisma.preMortemSimulation.findUnique({
      where: { id: simulationId },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }

    if (simulation.status === 'completed') {
      return NextResponse.json(
        { error: 'Simulation already completed' },
        { status: 400 }
      );
    }

    // Generate failure scenarios using AI
    const generatedScenarios = await chaosModeService.generateFailureScenarios({
      initiativeTitle: simulation.initiativeTitle,
      description: simulation.description || '',
      context: simulation.context as any,
      parameters: simulation.parameters as any,
    });

    // Rank scenarios by risk score
    const rankedScenarios = chaosModeService.rankScenarios(generatedScenarios);

    // Save scenarios to database
    const scenarioPromises = rankedScenarios.map((scenario) => {
      const riskScore = chaosModeService.calculateRiskScore(
        scenario.likelihood,
        scenario.impact
      );

      return prisma.failureScenario.create({
        data: {
          simulationId: simulation.id,
          title: scenario.title,
          description: scenario.description,
          category: scenario.category,
          likelihood: scenario.likelihood,
          impact: scenario.impact,
          riskScore,
          detailedAnalysis: scenario.detailedAnalysis,
        },
      });
    });

    await Promise.all(scenarioPromises);

    // Update simulation status
    await prisma.preMortemSimulation.update({
      where: { id: simulationId },
      data: {
        status: 'scenarios_generated',
      },
    });

    // Trigger mitigation strategy generation
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/chaos-mode/simulations/${simulationId}/generate-mitigations`,
      {
        method: 'POST',
      }
    ).catch((error) => {
      console.error('Error triggering mitigation generation:', error);
    });

    return NextResponse.json({
      success: true,
      scenariosGenerated: rankedScenarios.length,
    });
  } catch (error) {
    console.error('Error processing simulation:', error);

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
      { error: 'Failed to process simulation' },
      { status: 500 }
    );
  }
}
