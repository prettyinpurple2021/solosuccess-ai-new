import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chaosModeService } from '@/lib/services/chaos-mode-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const { simulationId } = await params;

    // Fetch simulation with scenarios
    const simulation = await prisma.preMortemSimulation.findUnique({
      where: { id: simulationId },
      include: {
        scenarios: {
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

    const initiativeContext = {
      initiativeTitle: simulation.initiativeTitle,
      description: simulation.description || '',
      context: simulation.context,
    };

    // Generate mitigations for each scenario
    let totalMitigations = 0;

    for (const scenario of simulation.scenarios) {
      try {
        const generatedMitigations =
          await chaosModeService.generateMitigationStrategies(
            {
              title: scenario.title,
              description: scenario.description,
              category: scenario.category,
              likelihood: scenario.likelihood,
              impact: scenario.impact,
              detailedAnalysis: scenario.detailedAnalysis || undefined,
            },
            initiativeContext
          );

        // Prioritize mitigations
        const prioritizedMitigations =
          chaosModeService.prioritizeMitigations(generatedMitigations);

        // Save mitigations to database
        const mitigationPromises = prioritizedMitigations.map((mitigation) =>
          prisma.mitigationStrategy.create({
            data: {
              scenarioId: scenario.id,
              title: mitigation.title,
              description: mitigation.description,
              priority: mitigation.priority,
              estimatedCost: mitigation.estimatedCost,
              estimatedTime: mitigation.estimatedTime,
              effectiveness: mitigation.effectiveness,
              resourceRequirements: mitigation.resourceRequirements,
            },
          })
        );

        await Promise.all(mitigationPromises);
        totalMitigations += prioritizedMitigations.length;

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `Error generating mitigations for scenario ${scenario.id}:`,
          error
        );
        // Continue with other scenarios even if one fails
      }
    }

    // Update simulation status
    await prisma.preMortemSimulation.update({
      where: { id: simulationId },
      data: {
        status: 'mitigations_generated',
      },
    });

    // Trigger report generation
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/chaos-mode/simulations/${simulationId}/generate-report`,
      {
        method: 'POST',
      }
    ).catch((error) => {
      console.error('Error triggering report generation:', error);
    });

    return NextResponse.json({
      success: true,
      mitigationsGenerated: totalMitigations,
    });
  } catch (error) {
    console.error('Error generating mitigations:', error);

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
      { error: 'Failed to generate mitigations' },
      { status: 500 }
    );
  }
}
