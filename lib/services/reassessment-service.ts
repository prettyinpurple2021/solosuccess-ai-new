import { prisma } from '@/lib/prisma';
import { BiasDetectionService } from './bias-detection';

export interface ReassessmentComparison {
  previousScore: number;
  currentScore: number;
  improvement: number;
  biasChanges: {
    biasType: string;
    previousScore: number;
    currentScore: number;
    change: number;
    trend: 'improved' | 'worsened' | 'stable';
  }[];
  newBiases: string[];
  resolvedBiases: string[];
  overallTrend: 'improving' | 'declining' | 'stable';
}

export class ReassessmentService {
  /**
   * Schedule a reassessment for a user
   */
  static async scheduleReassessment(
    userId: string,
    previousAssessmentId: string,
    scheduledDate: Date
  ): Promise<any> {
    // Get the previous assessment
    const previousAssessment = await prisma.shadowSelfAssessment.findFirst({
      where: {
        id: previousAssessmentId,
        userId,
      },
      include: {
        report: true,
      },
    });

    if (!previousAssessment) {
      throw new Error('Previous assessment not found');
    }

    // Check if reassessment already scheduled
    const existingReassessment = await prisma.shadowSelfReassessment.findFirst({
      where: {
        userId,
        previousAssessmentId,
        completedAt: null,
      },
    });

    if (existingReassessment) {
      return existingReassessment;
    }

    // Create reassessment record
    const reassessment = await prisma.shadowSelfReassessment.create({
      data: {
        userId,
        previousAssessmentId,
        currentAssessmentId: '', // Will be filled when user completes new assessment
        scheduledDate,
        comparisonData: {},
        progressMetrics: {},
        evolutionPatterns: {},
      },
    });

    return reassessment;
  }

  /**
   * Complete a reassessment and generate comparison
   */
  static async completeReassessment(
    reassessmentId: string,
    currentAssessmentId: string
  ): Promise<ReassessmentComparison> {
    const reassessment = await prisma.shadowSelfReassessment.findUnique({
      where: { id: reassessmentId },
    });

    if (!reassessment) {
      throw new Error('Reassessment not found');
    }

    // Get both assessments with reports
    const [previousAssessment, currentAssessment] = await Promise.all([
      prisma.shadowSelfAssessment.findUnique({
        where: { id: reassessment.previousAssessmentId },
        include: { report: true },
      }),
      prisma.shadowSelfAssessment.findUnique({
        where: { id: currentAssessmentId },
        include: { report: true },
      }),
    ]);

    if (!previousAssessment?.report || !currentAssessment?.report) {
      throw new Error('Assessment reports not found');
    }

    // Generate comparison
    const comparison = this.compareAssessments(
      previousAssessment.report,
      currentAssessment.report
    );

    // Update reassessment record
    await prisma.shadowSelfReassessment.update({
      where: { id: reassessmentId },
      data: {
        currentAssessmentId,
        completedAt: new Date(),
        comparisonData: comparison,
        progressMetrics: this.calculateProgressMetrics(comparison),
        evolutionPatterns: this.identifyEvolutionPatterns(comparison),
      },
    });

    return comparison;
  }

  /**
   * Compare two assessment reports
   */
  private static compareAssessments(
    previousReport: any,
    currentReport: any
  ): ReassessmentComparison {
    const previousBiases = previousReport.identifiedBiases as any[];
    const currentBiases = currentReport.identifiedBiases as any[];

    const previousScore = previousReport.overallScore || 0;
    const currentScore = currentReport.overallScore || 0;
    const improvement = previousScore - currentScore; // Lower score is better

    // Compare individual biases
    const biasChanges = this.compareBiases(previousBiases, currentBiases);

    // Identify new and resolved biases
    const previousBiasTypes = new Set(previousBiases.map((b) => b.biasType));
    const currentBiasTypes = new Set(currentBiases.map((b) => b.biasType));

    const newBiases = currentBiases
      .filter((b) => !previousBiasTypes.has(b.biasType) && b.severity !== 'low')
      .map((b) => b.biasType);

    const resolvedBiases = previousBiases
      .filter((b) => {
        const currentBias = currentBiases.find((cb) => cb.biasType === b.biasType);
        return !currentBias || currentBias.severity === 'low';
      })
      .map((b) => b.biasType);

    // Determine overall trend
    let overallTrend: 'improving' | 'declining' | 'stable';
    if (improvement > 10) {
      overallTrend = 'improving';
    } else if (improvement < -10) {
      overallTrend = 'declining';
    } else {
      overallTrend = 'stable';
    }

    return {
      previousScore,
      currentScore,
      improvement,
      biasChanges,
      newBiases,
      resolvedBiases,
      overallTrend,
    };
  }

  /**
   * Compare bias scores between assessments
   */
  private static compareBiases(previousBiases: any[], currentBiases: any[]): any[] {
    const changes = [];

    // Create maps for easy lookup
    const previousMap = new Map(previousBiases.map((b) => [b.biasType, b]));
    const currentMap = new Map(currentBiases.map((b) => [b.biasType, b]));

    // Get all unique bias types
    const allBiasTypes = new Set([
      ...previousBiases.map((b) => b.biasType),
      ...currentBiases.map((b) => b.biasType),
    ]);

    allBiasTypes.forEach((biasType) => {
      const previous = previousMap.get(biasType);
      const current = currentMap.get(biasType);

      const previousScore = previous?.score || 0;
      const currentScore = current?.score || 0;
      const change = previousScore - currentScore; // Positive means improvement

      let trend: 'improved' | 'worsened' | 'stable';
      if (change > 5) {
        trend = 'improved';
      } else if (change < -5) {
        trend = 'worsened';
      } else {
        trend = 'stable';
      }

      changes.push({
        biasType,
        previousScore,
        currentScore,
        change,
        trend,
      });
    });

    // Sort by absolute change (most significant changes first)
    return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }

  /**
   * Calculate progress metrics
   */
  private static calculateProgressMetrics(comparison: ReassessmentComparison): any {
    const improvedBiases = comparison.biasChanges.filter((b) => b.trend === 'improved').length;
    const worsenedBiases = comparison.biasChanges.filter((b) => b.trend === 'worsened').length;
    const stableBiases = comparison.biasChanges.filter((b) => b.trend === 'stable').length;

    return {
      overallImprovement: comparison.improvement,
      improvedBiases,
      worsenedBiases,
      stableBiases,
      resolvedBiasesCount: comparison.resolvedBiases.length,
      newBiasesCount: comparison.newBiases.length,
      improvementPercentage: Math.round(
        (comparison.improvement / comparison.previousScore) * 100
      ),
    };
  }

  /**
   * Identify evolution patterns
   */
  private static identifyEvolutionPatterns(comparison: ReassessmentComparison): any {
    const patterns = [];

    // Check for consistent improvement
    if (comparison.overallTrend === 'improving' && comparison.resolvedBiases.length > 0) {
      patterns.push({
        pattern: 'Consistent Growth',
        description: 'You\'re making steady progress in addressing your biases.',
      });
    }

    // Check for new biases emerging
    if (comparison.newBiases.length > 2) {
      patterns.push({
        pattern: 'New Challenges',
        description: 'New biases have emerged, possibly due to changing circumstances or increased awareness.',
      });
    }

    // Check for regression
    if (comparison.overallTrend === 'declining') {
      patterns.push({
        pattern: 'Regression',
        description: 'Some biases have intensified. Consider revisiting coaching exercises.',
      });
    }

    // Check for specific bias improvements
    const significantImprovements = comparison.biasChanges
      .filter((b) => b.change > 20)
      .map((b) => b.biasType);

    if (significantImprovements.length > 0) {
      patterns.push({
        pattern: 'Breakthrough Progress',
        description: `Significant improvement in: ${significantImprovements.join(', ')}`,
      });
    }

    return patterns;
  }

  /**
   * Get upcoming reassessments for a user
   */
  static async getUpcomingReassessments(userId: string): Promise<any[]> {
    const reassessments = await prisma.shadowSelfReassessment.findMany({
      where: {
        userId,
        completedAt: null,
        scheduledDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    return reassessments;
  }

  /**
   * Get completed reassessments for a user
   */
  static async getCompletedReassessments(userId: string): Promise<any[]> {
    const reassessments = await prisma.shadowSelfReassessment.findMany({
      where: {
        userId,
        completedAt: {
          not: null,
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    return reassessments;
  }

  /**
   * Auto-schedule quarterly reassessment after completing an assessment
   */
  static async autoScheduleQuarterlyReassessment(
    userId: string,
    assessmentId: string
  ): Promise<void> {
    const scheduledDate = new Date();
    scheduledDate.setMonth(scheduledDate.getMonth() + 3); // 3 months from now

    await this.scheduleReassessment(userId, assessmentId, scheduledDate);
  }
}
