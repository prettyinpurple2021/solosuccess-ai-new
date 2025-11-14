import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ScenarioGenerationInput {
  initiativeTitle: string;
  description: string;
  context: {
    businessType?: string;
    timeline?: string;
    budget?: string;
    teamSize?: string;
  };
  parameters: {
    riskTolerance: string;
    focusAreas: string[];
  };
}

interface GeneratedScenario {
  title: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  detailedAnalysis: string;
}

export class ChaosModeService {
  async generateFailureScenarios(
    input: ScenarioGenerationInput
  ): Promise<GeneratedScenario[]> {
    const prompt = this.buildScenarioPrompt(input);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert risk analyst and business strategist specializing in pre-mortem analysis. Your role is to identify potential failure scenarios for business initiatives with brutal honesty and strategic insight. You think like a combination of a management consultant, a venture capitalist, and a crisis manager.

Your analysis should be:
- Comprehensive: Cover multiple risk categories
- Realistic: Based on common failure patterns in similar initiatives
- Actionable: Provide specific, concrete scenarios
- Ranked: Assess likelihood and impact objectively
- Insightful: Explain the underlying dynamics of each risk`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      return this.parseScenarios(content);
    } catch (error) {
      console.error('Error generating scenarios:', error);
      throw error;
    }
  }

  private buildScenarioPrompt(input: ScenarioGenerationInput): string {
    const { initiativeTitle, description, context, parameters } = input;

    let prompt = `Conduct a pre-mortem analysis for the following business initiative:

**Initiative:** ${initiativeTitle}

**Description:** ${description}

`;

    if (context.businessType) {
      prompt += `**Business Type:** ${context.businessType}\n`;
    }
    if (context.timeline) {
      prompt += `**Timeline:** ${context.timeline}\n`;
    }
    if (context.budget) {
      prompt += `**Budget:** ${context.budget}\n`;
    }
    if (context.teamSize) {
      prompt += `**Team Size:** ${context.teamSize}\n`;
    }

    prompt += `\n**Risk Tolerance:** ${parameters.riskTolerance}\n`;

    if (parameters.focusAreas && parameters.focusAreas.length > 0) {
      prompt += `\n**Focus Areas:** ${parameters.focusAreas.join(', ')}\n`;
    }

    prompt += `\n\nGenerate 8-12 potential failure scenarios for this initiative. For each scenario, provide:

1. **Title**: A concise, specific title (max 10 words)
2. **Category**: One of: Market Risk, Financial Risk, Operational Risk, Technical Risk, Legal/Compliance Risk, Team/HR Risk, Competition Risk, Customer Risk
3. **Likelihood**: Rate 1-5 (1=very unlikely, 5=very likely)
4. **Impact**: Rate 1-5 (1=minimal impact, 5=catastrophic)
5. **Description**: A brief 2-3 sentence description of the scenario
6. **Detailed Analysis**: A comprehensive explanation (3-5 sentences) of why this could happen, the warning signs, and the potential consequences

Format your response as a JSON array with this structure:
[
  {
    "title": "scenario title",
    "category": "category name",
    "likelihood": 3,
    "impact": 4,
    "description": "brief description",
    "detailedAnalysis": "comprehensive analysis"
  }
]

Focus on realistic, specific scenarios that could actually derail this initiative. Be brutally honest about potential weaknesses.`;

    return prompt;
  }

  private parseScenarios(content: string): GeneratedScenario[] {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;

      const scenarios = JSON.parse(jsonString);

      if (!Array.isArray(scenarios)) {
        throw new Error('Response is not an array');
      }

      return scenarios.map((scenario: any) => ({
        title: scenario.title || 'Untitled Scenario',
        description: scenario.description || '',
        category: scenario.category || 'Operational Risk',
        likelihood: Math.min(5, Math.max(1, scenario.likelihood || 3)),
        impact: Math.min(5, Math.max(1, scenario.impact || 3)),
        detailedAnalysis: scenario.detailedAnalysis || scenario.description || '',
      }));
    } catch (error) {
      console.error('Error parsing scenarios:', error);
      console.error('Content:', content);
      throw new Error('Failed to parse AI response');
    }
  }

  calculateRiskScore(likelihood: number, impact: number): number {
    // Risk score formula: (likelihood * impact) * 4
    // This gives us a score from 4 (1*1*4) to 100 (5*5*4)
    return likelihood * impact * 4;
  }

  categorizeRiskLevel(riskScore: number): string {
    if (riskScore >= 75) return 'critical';
    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';
  }

  rankScenarios(scenarios: GeneratedScenario[]): GeneratedScenario[] {
    return scenarios.sort((a, b) => {
      const scoreA = this.calculateRiskScore(a.likelihood, a.impact);
      const scoreB = this.calculateRiskScore(b.likelihood, b.impact);
      return scoreB - scoreA;
    });
  }

  async generateMitigationStrategies(
    scenario: {
      title: string;
      description: string;
      category: string;
      likelihood: number;
      impact: number;
      detailedAnalysis?: string;
    },
    initiativeContext: {
      initiativeTitle: string;
      description: string;
      context: any;
    }
  ): Promise<GeneratedMitigation[]> {
    const prompt = this.buildMitigationPrompt(scenario, initiativeContext);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert risk mitigation strategist and business continuity planner. Your role is to develop practical, actionable mitigation strategies for business risks. You think like a combination of a crisis manager, operations expert, and strategic planner.

Your mitigation strategies should be:
- Practical: Implementable with realistic resources
- Specific: Clear actions, not vague advice
- Prioritized: Ranked by effectiveness and feasibility
- Comprehensive: Cover prevention, detection, and response
- Resource-aware: Include realistic cost and time estimates`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      return this.parseMitigations(content);
    } catch (error) {
      console.error('Error generating mitigations:', error);
      throw error;
    }
  }

  private buildMitigationPrompt(
    scenario: any,
    initiativeContext: any
  ): string {
    return `Develop mitigation strategies for the following risk scenario:

**Initiative:** ${initiativeContext.initiativeTitle}
**Initiative Description:** ${initiativeContext.description}

**Risk Scenario:**
- **Title:** ${scenario.title}
- **Category:** ${scenario.category}
- **Description:** ${scenario.description}
- **Likelihood:** ${scenario.likelihood}/5
- **Impact:** ${scenario.impact}/5
${scenario.detailedAnalysis ? `- **Analysis:** ${scenario.detailedAnalysis}` : ''}

Generate 3-5 mitigation strategies for this risk. For each strategy, provide:

1. **Title**: A clear, action-oriented title (max 8 words)
2. **Priority**: One of: critical, high, medium, low
3. **Description**: A detailed explanation of the strategy (3-4 sentences)
4. **Estimated Cost**: Realistic cost estimate (e.g., "$5,000-$10,000", "Minimal", "High")
5. **Estimated Time**: Time to implement (e.g., "2 weeks", "1-2 months", "Ongoing")
6. **Effectiveness**: Estimated effectiveness percentage (0-100)
7. **Resource Requirements**: Brief list of required resources (people, tools, budget)

Format your response as a JSON array:
[
  {
    "title": "strategy title",
    "priority": "high",
    "description": "detailed description",
    "estimatedCost": "cost estimate",
    "estimatedTime": "time estimate",
    "effectiveness": 85,
    "resourceRequirements": ["resource 1", "resource 2"]
  }
]

Focus on practical, implementable strategies that balance effectiveness with feasibility.`;
  }

  private parseMitigations(content: string): GeneratedMitigation[] {
    try {
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;

      const mitigations = JSON.parse(jsonString);

      if (!Array.isArray(mitigations)) {
        throw new Error('Response is not an array');
      }

      return mitigations.map((mitigation: any) => ({
        title: mitigation.title || 'Untitled Strategy',
        priority: mitigation.priority || 'medium',
        description: mitigation.description || '',
        estimatedCost: mitigation.estimatedCost || 'Unknown',
        estimatedTime: mitigation.estimatedTime || 'Unknown',
        effectiveness: Math.min(100, Math.max(0, mitigation.effectiveness || 50)),
        resourceRequirements: mitigation.resourceRequirements || [],
      }));
    } catch (error) {
      console.error('Error parsing mitigations:', error);
      console.error('Content:', content);
      throw new Error('Failed to parse AI response');
    }
  }

  prioritizeMitigations(
    mitigations: GeneratedMitigation[]
  ): GeneratedMitigation[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return mitigations.sort((a, b) => {
      const priorityDiff =
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder];

      if (priorityDiff !== 0) return priorityDiff;

      // If same priority, sort by effectiveness
      return (b.effectiveness || 0) - (a.effectiveness || 0);
    });
  }
}

interface GeneratedMitigation {
  title: string;
  priority: string;
  description: string;
  estimatedCost: string;
  estimatedTime: string;
  effectiveness: number;
  resourceRequirements: string[];
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  detailedAnalysis: string | null;
  mitigationStrategies: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    estimatedCost: string | null;
    estimatedTime: string | null;
    effectiveness: number | null;
  }>;
}

interface ReportData {
  executiveSummary: string;
  riskMatrix: any;
  topRisks: any[];
  mitigationPlan: any;
  contingencyPlans: any[];
  recommendations: string[];
}

export class ReportGenerator {
  async generatePreMortemReport(
    simulation: {
      initiativeTitle: string;
      description: string | null;
      context: any;
      parameters: any;
    },
    scenarios: Scenario[]
  ): Promise<ReportData> {
    const executiveSummary = await this.generateExecutiveSummary(
      simulation,
      scenarios
    );

    const riskMatrix = this.buildRiskMatrix(scenarios);
    const topRisks = this.identifyTopRisks(scenarios);
    const mitigationPlan = this.buildMitigationPlan(scenarios);
    const contingencyPlans = this.buildContingencyPlans(scenarios);
    const recommendations = this.generateRecommendations(scenarios);

    return {
      executiveSummary,
      riskMatrix,
      topRisks,
      mitigationPlan,
      contingencyPlans,
      recommendations,
    };
  }

  private async generateExecutiveSummary(
    simulation: any,
    scenarios: Scenario[]
  ): Promise<string> {
    const criticalRisks = scenarios.filter((s) => s.riskScore >= 75);
    const highRisks = scenarios.filter(
      (s) => s.riskScore >= 50 && s.riskScore < 75
    );

    const prompt = `Generate an executive summary for a pre-mortem analysis:

**Initiative:** ${simulation.initiativeTitle}
**Description:** ${simulation.description}

**Risk Analysis Results:**
- Total scenarios identified: ${scenarios.length}
- Critical risks: ${criticalRisks.length}
- High risks: ${highRisks.length}

**Top 3 Risks:**
${scenarios
  .slice(0, 3)
  .map((s, i) => `${i + 1}. ${s.title} (Risk Score: ${s.riskScore})`)
  .join('\n')}

Write a concise executive summary (3-4 paragraphs) that:
1. Summarizes the overall risk landscape
2. Highlights the most critical concerns
3. Provides a high-level assessment of initiative viability
4. Recommends next steps

Keep it professional, actionable, and focused on decision-making.`;

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an executive business consultant writing clear, actionable summaries for C-level executives.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      return response.choices[0]?.message?.content || 'Summary unavailable';
    } catch (error) {
      console.error('Error generating executive summary:', error);
      return 'Executive summary generation failed. Please review the detailed risk analysis below.';
    }
  }

  private buildRiskMatrix(scenarios: Scenario[]): any {
    const matrix: { [key: string]: number } = {};

    scenarios.forEach((scenario) => {
      const key = `${scenario.likelihood}-${scenario.impact}`;
      matrix[key] = (matrix[key] || 0) + 1;
    });

    return {
      data: matrix,
      totalScenarios: scenarios.length,
    };
  }

  private identifyTopRisks(scenarios: Scenario[]): any[] {
    return scenarios
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5)
      .map((scenario) => ({
        id: scenario.id,
        title: scenario.title,
        category: scenario.category,
        riskScore: scenario.riskScore,
        likelihood: scenario.likelihood,
        impact: scenario.impact,
        description: scenario.description,
        mitigationCount: scenario.mitigationStrategies.length,
      }));
  }

  private buildMitigationPlan(scenarios: Scenario[]): any {
    const criticalMitigations: any[] = [];
    const highMitigations: any[] = [];
    const mediumMitigations: any[] = [];

    scenarios.forEach((scenario) => {
      scenario.mitigationStrategies.forEach((mitigation) => {
        const item = {
          scenarioTitle: scenario.title,
          scenarioRiskScore: scenario.riskScore,
          ...mitigation,
        };

        if (mitigation.priority === 'critical') {
          criticalMitigations.push(item);
        } else if (mitigation.priority === 'high') {
          highMitigations.push(item);
        } else if (mitigation.priority === 'medium') {
          mediumMitigations.push(item);
        }
      });
    });

    return {
      critical: criticalMitigations,
      high: highMitigations,
      medium: mediumMitigations,
      totalStrategies:
        criticalMitigations.length +
        highMitigations.length +
        mediumMitigations.length,
    };
  }

  private buildContingencyPlans(scenarios: Scenario[]): any[] {
    // Build contingency plans for top 3 critical risks
    return scenarios
      .filter((s) => s.riskScore >= 75)
      .slice(0, 3)
      .map((scenario) => ({
        riskTitle: scenario.title,
        riskScore: scenario.riskScore,
        triggerConditions: this.generateTriggerConditions(scenario),
        responseActions: scenario.mitigationStrategies
          .slice(0, 3)
          .map((m) => m.title),
        escalationPath: this.generateEscalationPath(scenario),
      }));
  }

  private generateTriggerConditions(scenario: Scenario): string[] {
    // Generate realistic trigger conditions based on scenario category
    const triggers: { [key: string]: string[] } = {
      'Market Risk': [
        'Market share decline > 10%',
        'Competitor launches similar product',
        'Customer acquisition cost increases > 50%',
      ],
      'Financial Risk': [
        'Burn rate exceeds budget by 20%',
        'Revenue falls short of projections by 30%',
        'Unable to secure additional funding',
      ],
      'Operational Risk': [
        'Key process failure occurs',
        'Service downtime > 4 hours',
        'Quality metrics fall below threshold',
      ],
      'Technical Risk': [
        'Critical system failure',
        'Security breach detected',
        'Performance degradation > 50%',
      ],
      'Team/HR Risk': [
        'Key team member resignation',
        'Team productivity decline > 25%',
        'Unable to hire critical roles',
      ],
    };

    return (
      triggers[scenario.category] || [
        'Warning signs detected',
        'Metrics indicate risk materialization',
        'Stakeholder concerns raised',
      ]
    );
  }

  private generateEscalationPath(scenario: Scenario): string[] {
    if (scenario.riskScore >= 75) {
      return [
        'Immediate notification to leadership',
        'Activate crisis response team',
        'Daily status updates',
        'Board notification if unresolved in 48 hours',
      ];
    } else if (scenario.riskScore >= 50) {
      return [
        'Notify project lead',
        'Assess mitigation options',
        'Weekly status updates',
        'Escalate to leadership if worsening',
      ];
    } else {
      return [
        'Document in risk register',
        'Monitor key indicators',
        'Monthly review',
        'Escalate if conditions change',
      ];
    }
  }

  private generateRecommendations(scenarios: Scenario[]): string[] {
    const recommendations: string[] = [];

    const criticalCount = scenarios.filter((s) => s.riskScore >= 75).length;
    const highCount = scenarios.filter(
      (s) => s.riskScore >= 50 && s.riskScore < 75
    ).length;

    if (criticalCount > 0) {
      recommendations.push(
        `Address ${criticalCount} critical risk${criticalCount > 1 ? 's' : ''} before proceeding with initiative`
      );
    }

    if (highCount > 3) {
      recommendations.push(
        'Consider phased rollout approach to manage high-risk areas incrementally'
      );
    }

    recommendations.push(
      'Establish weekly risk review meetings during first 90 days'
    );
    recommendations.push(
      'Implement early warning system for top 5 risk indicators'
    );
    recommendations.push(
      'Allocate 15-20% contingency budget for risk mitigation'
    );
    recommendations.push(
      'Document lessons learned and update risk register monthly'
    );

    return recommendations;
  }
}

export const reportGenerator = new ReportGenerator();
export const chaosModeService = new ChaosModeService();
