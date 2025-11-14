import { prisma } from '@/lib/prisma';

export interface CoachingPrompt {
  id: string;
  assessmentId: string;
  promptType: string;
  title: string;
  content: string;
  targetBias: string | null;
  deliveredAt: Date | null;
  completedAt: Date | null;
  userResponse: string | null;
}

export class CoachingPromptService {
  /**
   * Generate coaching prompts based on identified biases
   */
  static async generatePromptsForAssessment(
    assessmentId: string,
    biases: any[]
  ): Promise<void> {
    const prompts = [];

    // Generate reflection prompts for top biases
    for (const bias of biases.slice(0, 3)) {
      prompts.push({
        assessmentId,
        promptType: 'reflection',
        title: `Reflect on ${this.formatBiasName(bias.biasType)}`,
        content: this.generateReflectionPrompt(bias.biasType),
        targetBias: bias.biasType,
      });

      prompts.push({
        assessmentId,
        promptType: 'exercise',
        title: `Exercise: Counter ${this.formatBiasName(bias.biasType)}`,
        content: this.generateExercisePrompt(bias.biasType),
        targetBias: bias.biasType,
      });
    }

    // Generate general awareness prompts
    prompts.push({
      assessmentId,
      promptType: 'awareness',
      title: 'Daily Decision Check-In',
      content: 'Before making an important decision today, pause and ask: What assumptions am I making? What evidence contradicts my view? What would I advise a friend in this situation?',
      targetBias: null,
    });

    await prisma.shadowSelfCoachingPrompt.createMany({
      data: prompts,
    });
  }

  /**
   * Get pending prompts for a user
   */
  static async getPendingPrompts(userId: string): Promise<CoachingPrompt[]> {
    const assessments = await prisma.shadowSelfAssessment.findMany({
      where: {
        userId,
        status: 'completed',
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 1,
    });

    if (assessments.length === 0) {
      return [];
    }

    const prompts = await prisma.shadowSelfCoachingPrompt.findMany({
      where: {
        assessmentId: assessments[0].id,
        completedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 5,
    });

    return prompts as CoachingPrompt[];
  }

  /**
   * Deliver next prompt to user
   */
  static async deliverNextPrompt(assessmentId: string): Promise<CoachingPrompt | null> {
    const prompt = await prisma.shadowSelfCoachingPrompt.findFirst({
      where: {
        assessmentId,
        deliveredAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!prompt) {
      return null;
    }

    const updatedPrompt = await prisma.shadowSelfCoachingPrompt.update({
      where: {
        id: prompt.id,
      },
      data: {
        deliveredAt: new Date(),
      },
    });

    return updatedPrompt as CoachingPrompt;
  }

  /**
   * Complete a prompt with user response
   */
  static async completePrompt(
    promptId: string,
    userResponse: string
  ): Promise<CoachingPrompt> {
    const prompt = await prisma.shadowSelfCoachingPrompt.update({
      where: {
        id: promptId,
      },
      data: {
        completedAt: new Date(),
        userResponse,
      },
    });

    return prompt as CoachingPrompt;
  }

  /**
   * Track progress over time
   */
  static async getProgressMetrics(userId: string): Promise<any> {
    const assessments = await prisma.shadowSelfAssessment.findMany({
      where: {
        userId,
        status: 'completed',
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    if (assessments.length === 0) {
      return null;
    }

    const latestAssessment = assessments[0];
    const prompts = await prisma.shadowSelfCoachingPrompt.findMany({
      where: {
        assessmentId: latestAssessment.id,
      },
    });

    const completedPrompts = prompts.filter((p) => p.completedAt !== null);
    const completionRate = prompts.length > 0 ? (completedPrompts.length / prompts.length) * 100 : 0;

    return {
      totalPrompts: prompts.length,
      completedPrompts: completedPrompts.length,
      completionRate: Math.round(completionRate),
      lastCompletedAt: completedPrompts.length > 0
        ? completedPrompts[completedPrompts.length - 1].completedAt
        : null,
    };
  }

  /**
   * Generate decision-making warnings based on context
   */
  static generateDecisionWarning(
    biasType: string,
    decisionContext: string
  ): string {
    const warnings: Record<string, string> = {
      confirmation_bias: `⚠️ Confirmation Bias Alert: Are you only considering information that supports your current view? Try actively seeking contradicting evidence before proceeding.`,
      sunk_cost_fallacy: `⚠️ Sunk Cost Alert: Are you continuing because of past investment rather than future value? Evaluate this decision as if you were starting fresh today.`,
      optimism_bias: `⚠️ Optimism Bias Alert: Your timeline or cost estimate may be too optimistic. Consider adding a 50% buffer based on historical data.`,
      overconfidence: `⚠️ Overconfidence Alert: Are you certain enough to bet on this? Consider seeking expert input or running a small test first.`,
      loss_aversion: `⚠️ Loss Aversion Alert: Are you avoiding this decision because you fear losing what you have? Consider the opportunity cost of inaction.`,
    };

    return warnings[biasType] || `⚠️ Bias Alert: Consider how your cognitive biases might be influencing this decision.`;
  }

  private static formatBiasName(biasType: string): string {
    return biasType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private static generateReflectionPrompt(biasType: string): string {
    const prompts: Record<string, string> = {
      confirmation_bias: `Think about a recent business decision you made. Did you actively seek out information that contradicted your initial belief? What sources of contradicting evidence did you ignore or dismiss? How might the outcome have been different if you'd given equal weight to opposing views?`,
      sunk_cost_fallacy: `Reflect on a project or initiative you're currently pursuing. If you were starting from scratch today with no prior investment, would you still choose to pursue it? What would you do differently? What's holding you back from making that change now?`,
      optimism_bias: `Review your last 3 project estimates (time, cost, or outcomes). How accurate were they? What patterns do you notice? What factors did you consistently underestimate? How can you adjust your estimation process?`,
      overconfidence: `Think about a time when you were very confident about a decision that didn't turn out as expected. What signals did you miss? What would have helped you be more realistic? How can you build in more humility to your decision-making?`,
      loss_aversion: `Identify an opportunity you've been avoiding because it involves risk or potential loss. What's the worst that could happen? What's the best that could happen? What's the cost of not taking action? How would you advise a friend in this situation?`,
    };

    return prompts[biasType] || `Reflect on how ${this.formatBiasName(biasType)} might be affecting your recent business decisions.`;
  }

  private static generateExercisePrompt(biasType: string): string {
    const exercises: Record<string, string> = {
      confirmation_bias: `Exercise: For your next important decision, create two lists: "Evidence For" and "Evidence Against." Spend equal time researching both sides. Share both lists with a trusted advisor and ask them to challenge your "Evidence For" list.`,
      sunk_cost_fallacy: `Exercise: List all your current projects and initiatives. For each one, answer: "If I were starting today with no prior investment, would I start this project?" For any "no" answers, create a plan to wind down or pivot.`,
      optimism_bias: `Exercise: Take your next project estimate and multiply time by 1.5x and costs by 1.3x. This is your "realistic" estimate. Track actual vs. estimated over the next 3 projects to calibrate your estimation accuracy.`,
      overconfidence: `Exercise: Before your next major decision, write down your confidence level (0-100%) and your reasoning. Then, identify 3 experts or advisors and get their input. After the outcome is known, review your initial confidence and learn from any gaps.`,
      loss_aversion: `Exercise: Identify one "safe" decision you're making to avoid potential loss. Calculate the opportunity cost of playing it safe. Then, design a small, low-risk experiment to test the alternative approach.`,
    };

    return exercises[biasType] || `Practice identifying and countering ${this.formatBiasName(biasType)} in your daily decisions.`;
  }
}
