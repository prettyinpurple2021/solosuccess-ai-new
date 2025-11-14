import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ simulationId: string }> }
) {
  try {
    const { simulationId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch simulation with all data
    const simulation = await prisma.preMortemSimulation.findFirst({
      where: {
        id: simulationId,
        userId: user.id,
      },
      include: {
        scenarios: {
          include: {
            mitigationStrategies: true,
          },
          orderBy: { riskScore: 'desc' },
        },
        report: true,
      },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }

    if (!simulation.report) {
      return NextResponse.json(
        { error: 'Report not yet generated' },
        { status: 400 }
      );
    }

    // Generate HTML report
    const html = generateHTMLReport(simulation);

    // Return as downloadable HTML file
    // In production, you would use a service like Puppeteer or a PDF API
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="pre-mortem-${simulation.initiativeTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html"`,
      },
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

function generateHTMLReport(simulation: any): string {
  const report = simulation.report;
  const scenarios = simulation.scenarios;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pre-Mortem Report - ${simulation.initiativeTitle}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header p {
      font-size: 18px;
      opacity: 0.9;
    }
    .section {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section h2 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #667eea;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .section h3 {
      font-size: 20px;
      margin: 20px 0 10px;
      color: #764ba2;
    }
    .risk-card {
      background: #f9f9f9;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
    }
    .risk-card h4 {
      font-size: 18px;
      margin-bottom: 10px;
      color: #333;
    }
    .risk-score {
      display: inline-block;
      background: #ef4444;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .risk-score.high {
      background: #f97316;
    }
    .risk-score.medium {
      background: #eab308;
    }
    .risk-score.low {
      background: #22c55e;
    }
    .mitigation {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 15px;
      margin: 10px 0;
      border-radius: 6px;
    }
    .mitigation.critical {
      background: #fef2f2;
      border-left-color: #ef4444;
    }
    .mitigation.high {
      background: #fff7ed;
      border-left-color: #f97316;
    }
    ul, ol {
      margin-left: 20px;
      margin-top: 10px;
    }
    li {
      margin-bottom: 8px;
    }
    .meta {
      color: #666;
      font-size: 14px;
      margin-top: 10px;
    }
    .recommendation {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 10px 0;
      border-radius: 6px;
    }
    @media print {
      body {
        background: white;
      }
      .section {
        page-break-inside: avoid;
        box-shadow: none;
        border: 1px solid #ddd;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Pre-Mortem Analysis Report</h1>
    <p>${simulation.initiativeTitle}</p>
    <p style="font-size: 14px; margin-top: 10px;">Generated: ${new Date().toLocaleDateString()}</p>
  </div>

  ${simulation.description ? `
  <div class="section">
    <h2>Initiative Overview</h2>
    <p>${simulation.description}</p>
  </div>
  ` : ''}

  <div class="section">
    <h2>Executive Summary</h2>
    <p style="white-space: pre-wrap;">${report.executiveSummary}</p>
  </div>

  <div class="section">
    <h2>Top Risks</h2>
    ${report.topRisks.map((risk: any, index: number) => `
      <div class="risk-card">
        <h4>#${index + 1} - ${risk.title}</h4>
        <span class="risk-score ${getRiskClass(risk.riskScore)}">Risk Score: ${risk.riskScore}</span>
        <p style="margin-top: 10px;">${risk.description}</p>
        <div class="meta">
          Category: ${risk.category} | 
          Likelihood: ${risk.likelihood}/5 | 
          Impact: ${risk.impact}/5 |
          ${risk.mitigationCount} mitigation strategies
        </div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>Mitigation Plan</h2>
    <p><strong>${report.mitigationPlan.totalStrategies}</strong> strategies identified across all risk scenarios</p>
    
    ${report.mitigationPlan.critical.length > 0 ? `
      <h3>Critical Priority (${report.mitigationPlan.critical.length})</h3>
      ${report.mitigationPlan.critical.map((m: any) => `
        <div class="mitigation critical">
          <strong>${m.title}</strong>
          <p>${m.description}</p>
          <div class="meta">
            For: ${m.scenarioTitle}
            ${m.estimatedTime ? ` | Time: ${m.estimatedTime}` : ''}
            ${m.estimatedCost ? ` | Cost: ${m.estimatedCost}` : ''}
          </div>
        </div>
      `).join('')}
    ` : ''}

    ${report.mitigationPlan.high.length > 0 ? `
      <h3>High Priority (${report.mitigationPlan.high.length})</h3>
      ${report.mitigationPlan.high.slice(0, 10).map((m: any) => `
        <div class="mitigation high">
          <strong>${m.title}</strong>
          <p>${m.description}</p>
          <div class="meta">For: ${m.scenarioTitle}</div>
        </div>
      `).join('')}
      ${report.mitigationPlan.high.length > 10 ? `
        <p style="text-align: center; color: #666; margin-top: 10px;">
          +${report.mitigationPlan.high.length - 10} more high priority strategies
        </p>
      ` : ''}
    ` : ''}
  </div>

  ${report.contingencyPlans.length > 0 ? `
  <div class="section">
    <h2>Contingency Plans</h2>
    ${report.contingencyPlans.map((plan: any) => `
      <div class="risk-card">
        <h4>${plan.riskTitle}</h4>
        <h3 style="font-size: 16px; margin-top: 15px;">Trigger Conditions:</h3>
        <ul>
          ${plan.triggerConditions.map((c: string) => `<li>${c}</li>`).join('')}
        </ul>
        <h3 style="font-size: 16px; margin-top: 15px;">Response Actions:</h3>
        <ul>
          ${plan.responseActions.map((a: string) => `<li>${a}</li>`).join('')}
        </ul>
        <h3 style="font-size: 16px; margin-top: 15px;">Escalation Path:</h3>
        <ol>
          ${plan.escalationPath.map((s: string) => `<li>${s}</li>`).join('')}
        </ol>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="section">
    <h2>Key Recommendations</h2>
    ${report.recommendations.map((rec: string) => `
      <div class="recommendation">
        ${rec}
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>All Identified Scenarios</h2>
    ${scenarios.map((scenario: any, index: number) => `
      <div class="risk-card">
        <h4>#${index + 1} - ${scenario.title}</h4>
        <span class="risk-score ${getRiskClass(scenario.riskScore)}">Risk Score: ${scenario.riskScore}</span>
        <p style="margin-top: 10px;">${scenario.description}</p>
        ${scenario.detailedAnalysis ? `
          <p style="margin-top: 10px; font-style: italic; color: #666;">${scenario.detailedAnalysis}</p>
        ` : ''}
        <div class="meta">
          Category: ${scenario.category} | 
          Likelihood: ${scenario.likelihood}/5 | 
          Impact: ${scenario.impact}/5
        </div>
      </div>
    `).join('')}
  </div>

  <div style="text-align: center; color: #666; margin-top: 40px; padding: 20px; border-top: 2px solid #ddd;">
    <p>Generated by SoloSuccess AI - Chaos Mode</p>
    <p style="font-size: 12px; margin-top: 5px;">This report is for planning purposes only and should not be considered professional advice.</p>
  </div>
</body>
</html>`;
}

function getRiskClass(score: number): string {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}
