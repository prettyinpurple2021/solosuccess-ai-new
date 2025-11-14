import { SHADOW_SELF_QUESTIONS, BIAS_DESCRIPTIONS, AssessmentQuestion } from '@/lib/data/shadow-self-questions';

export interface BiasScore {
  biasType: string;
  score: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurrences: number;
  affectedQuestions: string[];
}

export interface BlindSpot {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  relatedBiases: string[];
  impactAreas: string[];
}

export interface DecisionPattern {
  pattern: string;
  description: string;
  frequency: number;
  tendency: 'risk-averse' | 'risk-seeking' | 'balanced' | 'impulsive' | 'analytical';
}

export interface BiasAnalysisResult {
  biases: BiasScore[];
  blindSpots: BlindSpot[];
  decisionPatterns: DecisionPattern[];
  overallRiskScore: number;
  strengths: string[];
  weaknesses: string[];
}

export class BiasDetectionService {
  /**
   * Analyze assessment responses to identify cognitive biases
   */
  static analyzeResponses(responses: Record<string, string>): BiasAnalysisResult {
    const biasOccurrences: Record<string, { count: number; questions: string[] }> = {};
    const categoryPatterns: Record<string, string[]> = {};

    // Count bias indicators in responses
    SHADOW_SELF_QUESTIONS.forEach((question) => {
      const response = responses[question.id];
      if (!response) return;

      const selectedOption = question.options.find((opt) => opt.value === response);
      if (!selectedOption) return;

      // Track category patterns
      if (!categoryPatterns[question.category]) {
        categoryPatterns[question.category] = [];
      }
      categoryPatterns[question.category].push(response);

      // Track bias indicators
      if (selectedOption.biasIndicator) {
        const biasType = selectedOption.biasIndicator;
        if (!biasOccurrences[biasType]) {
          biasOccurrences[biasType] = { count: 0, questions: [] };
        }
        biasOccurrences[biasType].count++;
        biasOccurrences[biasType].questions.push(question.id);
      }

      // Also track biases from question types
      question.biasType.forEach((biasType) => {
        if (selectedOption.biasIndicator === biasType) {
          // Already counted above
          return;
        }
        // Increment with lower weight for general bias type association
        if (!biasOccurrences[biasType]) {
          biasOccurrences[biasType] = { count: 0, questions: [] };
        }
      });
    });

    // Calculate bias scores
    const biases = this.calculateBiasScores(biasOccurrences);

    // Identify blind spots
    const blindSpots = this.identifyBlindSpots(biases, categoryPatterns);

    // Analyze decision patterns
    const decisionPatterns = this.analyzeDecisionPatterns(responses, categoryPatterns);

    // Calculate overall risk score
    const overallRiskScore = this.calculateOverallRiskScore(biases);

    // Identify strengths and weaknesses
    const { strengths, weaknesses } = this.identifyStrengthsAndWeaknesses(
      biases,
      decisionPatterns
    );

    return {
      biases,
      blindSpots,
      decisionPatterns,
      overallRiskScore,
      strengths,
      weaknesses,
    };
  }

  private static calculateBiasScores(
    biasOccurrences: Record<string, { count: number; questions: string[] }>
  ): BiasScore[] {
    const totalQuestions = SHADOW_SELF_QUESTIONS.length;
    const biasScores: BiasScore[] = [];

    Object.entries(biasOccurrences).forEach(([biasType, data]) => {
      if (data.count === 0) return;

      // Calculate score based on frequency (0-100)
      const score = Math.min(100, (data.count / totalQuestions) * 200);

      // Determine severity
      let severity: 'low' | 'medium' | 'high' | 'critical';
      if (score >= 75) severity = 'critical';
      else if (score >= 50) severity = 'high';
      else if (score >= 25) severity = 'medium';
      else severity = 'low';

      biasScores.push({
        biasType,
        score: Math.round(score),
        severity,
        occurrences: data.count,
        affectedQuestions: data.questions,
      });
    });

    // Sort by score descending
    return biasScores.sort((a, b) => b.score - a.score);
  }

  private static identifyBlindSpots(
    biases: BiasScore[],
    categoryPatterns: Record<string, string[]>
  ): BlindSpot[] {
    const blindSpots: BlindSpot[] = [];

    // Identify blind spots based on bias clusters
    const highSeverityBiases = biases.filter(
      (b) => b.severity === 'high' || b.severity === 'critical'
    );

    // Information Processing blind spot
    const infoProcessingBiases = highSeverityBiases.filter((b) =>
      ['confirmation_bias', 'availability_heuristic', 'recency_bias'].includes(b.biasType)
    );
    if (infoProcessingBiases.length >= 2) {
      blindSpots.push({
        category: 'Information Processing',
        description:
          'You tend to filter information in ways that confirm your existing beliefs, potentially missing critical data that contradicts your assumptions.',
        severity: 'high',
        relatedBiases: infoProcessingBiases.map((b) => b.biasType),
        impactAreas: ['Market Research', 'Competitive Analysis', 'Customer Feedback'],
      });
    }

    // Decision Making blind spot
    const decisionBiases = highSeverityBiases.filter((b) =>
      ['sunk_cost_fallacy', 'loss_aversion', 'status_quo_bias'].includes(b.biasType)
    );
    if (decisionBiases.length >= 2) {
      blindSpots.push({
        category: 'Decision Making',
        description:
          'Your decision-making is heavily influenced by past investments and fear of loss, which may prevent you from making optimal choices.',
        severity: 'high',
        relatedBiases: decisionBiases.map((b) => b.biasType),
        impactAreas: ['Strategic Pivots', 'Resource Allocation', 'Risk Management'],
      });
    }

    // Self-Assessment blind spot
    const selfAssessmentBiases = highSeverityBiases.filter((b) =>
      ['dunning_kruger', 'overconfidence', 'illusion_of_control'].includes(b.biasType)
    );
    if (selfAssessmentBiases.length >= 2) {
      blindSpots.push({
        category: 'Self-Assessment',
        description:
          'You may overestimate your abilities and control over outcomes, leading to inadequate preparation and unrealistic expectations.',
        severity: 'critical',
        relatedBiases: selfAssessmentBiases.map((b) => b.biasType),
        impactAreas: ['Skill Development', 'Delegation', 'Planning'],
      });
    }

    // Social Influence blind spot
    const socialBiases = highSeverityBiases.filter((b) =>
      ['bandwagon_effect', 'groupthink', 'herd_mentality'].includes(b.biasType)
    );
    if (socialBiases.length >= 1) {
      blindSpots.push({
        category: 'Social Influence',
        description:
          'You are susceptible to following trends and group consensus without sufficient independent analysis.',
        severity: 'medium',
        relatedBiases: socialBiases.map((b) => b.biasType),
        impactAreas: ['Strategy Development', 'Innovation', 'Differentiation'],
      });
    }

    return blindSpots;
  }

  private static analyzeDecisionPatterns(
    responses: Record<string, string>,
    categoryPatterns: Record<string, string[]>
  ): DecisionPattern[] {
    const patterns: DecisionPattern[] = [];

    // Analyze risk-taking patterns
    const riskResponses = [
      responses['q7'], // Risk taking question
      responses['q3'], // Planning question
      responses['q4'], // Risk assessment
    ].filter(Boolean);

    const riskAversionCount = riskResponses.filter((r) =>
      ['guaranteed', 'pessimistic', 'data_driven'].includes(r)
    ).length;
    const riskSeekingCount = riskResponses.filter((r) =>
      ['always_risk', 'optimistic', 'ignore_risks'].includes(r)
    ).length;

    if (riskAversionCount > riskSeekingCount) {
      patterns.push({
        pattern: 'Risk Aversion',
        description:
          'You tend to prefer safe, predictable options even when higher-risk choices might offer better returns.',
        frequency: riskAversionCount,
        tendency: 'risk-averse',
      });
    } else if (riskSeekingCount > riskAversionCount) {
      patterns.push({
        pattern: 'Risk Seeking',
        description:
          'You tend to embrace risk and uncertainty, sometimes without adequate analysis of potential downsides.',
        frequency: riskSeekingCount,
        tendency: 'risk-seeking',
      });
    }

    // Analyze planning patterns
    const planningResponses = [responses['q3'], responses['q14']].filter(Boolean);
    const hasPlanning = planningResponses.some((r) =>
      ['realistic', 'adapt_plan', 'accept_limits'].includes(r)
    );

    if (hasPlanning) {
      patterns.push({
        pattern: 'Analytical Planning',
        description:
          'You approach planning systematically, using data and realistic assessments.',
        frequency: planningResponses.length,
        tendency: 'analytical',
      });
    } else {
      patterns.push({
        pattern: 'Impulsive Action',
        description:
          'You tend to act quickly without extensive planning, which can lead to both opportunities and oversights.',
        frequency: planningResponses.length,
        tendency: 'impulsive',
      });
    }

    // Analyze information gathering patterns
    const infoGatheringResponse = responses['q1'];
    if (infoGatheringResponse === 'balanced' || infoGatheringResponse === 'devil_advocate') {
      patterns.push({
        pattern: 'Balanced Information Seeking',
        description:
          'You actively seek diverse perspectives and contradicting evidence in your research.',
        frequency: 1,
        tendency: 'analytical',
      });
    }

    return patterns;
  }

  private static calculateOverallRiskScore(biases: BiasScore[]): number {
    if (biases.length === 0) return 0;

    // Weight biases by severity
    const severityWeights = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    const totalWeightedScore = biases.reduce((sum, bias) => {
      return sum + bias.score * severityWeights[bias.severity];
    }, 0);

    const maxPossibleScore = biases.length * 100 * 4; // Max score * critical weight
    const riskScore = (totalWeightedScore / maxPossibleScore) * 100;

    return Math.round(riskScore);
  }

  private static identifyStrengthsAndWeaknesses(
    biases: BiasScore[],
    decisionPatterns: DecisionPattern[]
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Identify strengths (low bias scores)
    const lowBiases = biases.filter((b) => b.severity === 'low');
    if (lowBiases.length > biases.length * 0.6) {
      strengths.push('Strong self-awareness and balanced decision-making');
    }

    const hasAnalyticalPattern = decisionPatterns.some((p) => p.tendency === 'analytical');
    if (hasAnalyticalPattern) {
      strengths.push('Data-driven and systematic approach to planning');
    }

    const hasBalancedRisk = decisionPatterns.some((p) => p.tendency === 'balanced');
    if (hasBalancedRisk) {
      strengths.push('Balanced risk assessment and management');
    }

    // Identify weaknesses (high bias scores)
    const criticalBiases = biases.filter((b) => b.severity === 'critical');
    criticalBiases.forEach((bias) => {
      const biasInfo = BIAS_DESCRIPTIONS[bias.biasType];
      if (biasInfo) {
        weaknesses.push(`${biasInfo.name}: ${biasInfo.impact}`);
      }
    });

    const highBiases = biases.filter((b) => b.severity === 'high');
    if (highBiases.length > 3) {
      weaknesses.push('Multiple significant biases affecting decision quality');
    }

    return { strengths, weaknesses };
  }
}
