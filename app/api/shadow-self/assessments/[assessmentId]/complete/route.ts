import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BiasDetectionService } from '@/lib/services/bias-detection';

export async function POST(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { responses } = body;

    // Verify assessment exists and belongs to user
    const assessment = await prisma.shadowSelfAssessment.findFirst({
      where: {
        id: params.assessmentId,
        userId: session.user.id,
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (assessment.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Assessment is not in progress' },
        { status: 400 }
      );
    }

    // Analyze responses using bias detection service
    const analysis = BiasDetectionService.analyzeResponses(responses);

    // Generate impact examples for each bias
    const impactExamples = analysis.biases.slice(0, 5).map((bias) => ({
      biasType: bias.biasType,
      severity: bias.severity,
      examples: generateImpactExamples(bias.biasType),
    }));

    // Generate recommendations
    const recommendations = generateRecommendations(analysis);

    // Update assessment status
    const updatedAssessment = await prisma.shadowSelfAssessment.update({
      where: {
        id: params.assessmentId,
      },
      data: {
        status: 'completed',
        responses,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create report
    const report = await prisma.shadowSelfReport.create({
      data: {
        assessmentId: params.assessmentId,
        identifiedBiases: analysis.biases,
        blindSpots: analysis.blindSpots,
        decisionPatterns: analysis.decisionPatterns,
        impactExamples,
        recommendations,
        overallScore: analysis.overallRiskScore,
      },
    });

    // Schedule initial coaching prompts
    await scheduleCoachingPrompts(params.assessmentId, analysis);

    // Auto-schedule quarterly reassessment
    const { ReassessmentService } = await import('@/lib/services/reassessment-service');
    await ReassessmentService.autoScheduleQuarterlyReassessment(
      session.user.id,
      params.assessmentId
    );

    return NextResponse.json({
      assessment: updatedAssessment,
      report,
    });
  } catch (error) {
    console.error('Error completing assessment:', error);
    return NextResponse.json(
      { error: 'Failed to complete assessment' },
      { status: 500 }
    );
  }
}

function generateImpactExamples(biasType: string): string[] {
  const examples: Record<string, string[]> = {
    confirmation_bias: [
      'You might dismiss negative customer feedback because it contradicts your product vision',
      'You could overlook competitor advantages by focusing only on their weaknesses',
      'You may miss market shifts by only reading news that confirms your strategy',
    ],
    sunk_cost_fallacy: [
      'Continuing to invest in a failing marketing channel because you\'ve already spent $10k',
      'Keeping an underperforming employee because of the time invested in training',
      'Pursuing a product feature that customers don\'t want because development is 80% complete',
    ],
    optimism_bias: [
      'Underestimating project timelines by 50% consistently',
      'Launching without adequate testing because "it will probably be fine"',
      'Ignoring cash flow warnings because you expect sales to pick up soon',
    ],
    overconfidence: [
      'Entering a new market without sufficient research because you "know" it will work',
      'Ignoring expert advice because you believe your intuition is superior',
      'Taking on too many projects simultaneously and delivering poor quality',
    ],
    loss_aversion: [
      'Holding onto a declining investment hoping it will recover',
      'Avoiding necessary price increases for fear of losing customers',
      'Staying in a bad partnership to avoid the "loss" of ending it',
    ],
  };

  return examples[biasType] || [
    'This bias may affect your business decisions in subtle but significant ways',
    'Consider how this pattern might influence your strategic choices',
    'Awareness of this bias is the first step to mitigating its impact',
  ];
}

function generateRecommendations(analysis: any): any[] {
  const recommendations = [];

  // Top 3 biases get specific recommendations
  analysis.biases.slice(0, 3).forEach((bias: any) => {
    recommendations.push({
      biasType: bias.biasType,
      priority: bias.severity,
      title: `Address ${bias.biasType.replace(/_/g, ' ')}`,
      actions: getRecommendedActions(bias.biasType),
      resources: [
        'Daily reflection exercises',
        'Decision-making frameworks',
        'Peer accountability check-ins',
      ],
    });
  });

  // General recommendations
  recommendations.push({
    biasType: 'general',
    priority: 'medium',
    title: 'Build Self-Awareness Practices',
    actions: [
      'Keep a decision journal to track your reasoning',
      'Seek diverse perspectives before major decisions',
      'Schedule regular self-reflection sessions',
      'Use pre-mortem analysis for important initiatives',
    ],
    resources: ['Shadow Self coaching prompts', 'Weekly reflection templates'],
  });

  return recommendations;
}

function getRecommendedActions(biasType: string): string[] {
  const actions: Record<string, string[]> = {
    confirmation_bias: [
      'Actively seek information that contradicts your assumptions',
      'Assign someone to play devil\'s advocate in important decisions',
      'Use structured decision-making frameworks',
      'Set up alerts for contradicting data points',
    ],
    sunk_cost_fallacy: [
      'Evaluate decisions based on future value, not past investment',
      'Set clear kill criteria for projects before starting',
      'Practice the "fresh eyes" test: Would you start this today?',
      'Celebrate smart pivots, not just persistence',
    ],
    optimism_bias: [
      'Use reference class forecasting (compare to similar past projects)',
      'Add 50% buffer to all time and cost estimates',
      'Conduct pre-mortem analysis before launching',
      'Track your prediction accuracy over time',
    ],
    overconfidence: [
      'Seek expert advice even when you feel confident',
      'Use probabilistic thinking (ranges instead of point estimates)',
      'Keep a "mistakes journal" to build humility',
      'Test assumptions with small experiments first',
    ],
  };

  return actions[biasType] || [
    'Increase awareness through daily reflection',
    'Seek feedback from trusted advisors',
    'Use decision-making frameworks',
  ];
}

async function scheduleCoachingPrompts(assessmentId: string, analysis: any) {
  const prompts = [];

  // Create prompts for top 3 biases
  for (let i = 0; i < Math.min(3, analysis.biases.length); i++) {
    const bias = analysis.biases[i];
    
    prompts.push({
      assessmentId,
      promptType: 'reflection',
      title: `Reflect on ${bias.biasType.replace(/_/g, ' ')}`,
      content: `Take a moment to think about a recent business decision. Did ${bias.biasType.replace(/_/g, ' ')} influence your choice? How might you approach it differently?`,
      targetBias: bias.biasType,
    });
  }

  // Create initial coaching prompts
  if (prompts.length > 0) {
    await prisma.shadowSelfCoachingPrompt.createMany({
      data: prompts,
    });
  }
}
