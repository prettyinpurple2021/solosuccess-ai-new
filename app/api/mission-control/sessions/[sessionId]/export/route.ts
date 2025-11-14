import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

// GET /api/mission-control/sessions/[sessionId]/export - Export session as PDF/JSON
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const missionSession = await prisma.missionControlSession.findFirst({
      where: {
        id: params.sessionId,
        userId: user.id,
      },
    });

    if (!missionSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get format from query params (default to json)
    const { searchParams } = new URL(request.url);
    const format_type = searchParams.get('format') || 'json';

    if (format_type === 'json') {
      // Export as JSON
      const exportData = {
        id: missionSession.id,
        objective: missionSession.objective,
        status: missionSession.status,
        agentsInvolved: missionSession.agentsInvolved,
        context: missionSession.context,
        results: missionSession.results,
        createdAt: missionSession.createdAt,
        completedAt: missionSession.completedAt,
        exportedAt: new Date().toISOString(),
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="mission-control-${missionSession.id}.json"`,
        },
      });
    } else if (format_type === 'markdown') {
      // Export as Markdown
      const markdown = generateMarkdownExport(missionSession);

      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="mission-control-${missionSession.id}.md"`,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use json or markdown' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error exporting mission control session:', error);
    return NextResponse.json(
      { error: 'Failed to export session' },
      { status: 500 }
    );
  }
}

function generateMarkdownExport(session: any): string {
  const results = session.results || {};
  const createdDate = format(new Date(session.createdAt), 'MMMM d, yyyy');
  const completedDate = session.completedAt 
    ? format(new Date(session.completedAt), 'MMMM d, yyyy')
    : 'In Progress';

  let markdown = `# Mission Control Plan\n\n`;
  markdown += `**Created:** ${createdDate}\n`;
  markdown += `**Status:** ${session.status}\n`;
  markdown += `**Completed:** ${completedDate}\n\n`;
  
  markdown += `---\n\n`;
  markdown += `## Objective\n\n`;
  markdown += `${session.objective}\n\n`;

  if (results.executiveSummary) {
    markdown += `## Executive Summary\n\n`;
    markdown += `${results.executiveSummary}\n\n`;
  }

  if (results.detailedPlan) {
    markdown += `## Detailed Plan\n\n`;
    markdown += `${results.detailedPlan.overview}\n\n`;

    if (results.detailedPlan.phases) {
      markdown += `### Implementation Phases\n\n`;
      results.detailedPlan.phases.forEach((phase: any, index: number) => {
        markdown += `#### Phase ${index + 1}: ${phase.name}\n\n`;
        markdown += `**Duration:** ${phase.duration}\n\n`;
        markdown += `${phase.description}\n\n`;
        markdown += `**Key Tasks:**\n\n`;
        phase.tasks.forEach((task: string) => {
          markdown += `- [ ] ${task}\n`;
        });
        markdown += `\n`;
      });
    }
  }

  if (results.actionItems && results.actionItems.length > 0) {
    markdown += `## Action Items\n\n`;
    results.actionItems.forEach((item: any) => {
      markdown += `### ${item.title}\n\n`;
      markdown += `**Priority:** ${item.priority}\n\n`;
      if (item.estimatedTime) {
        markdown += `**Estimated Time:** ${item.estimatedTime}\n\n`;
      }
      markdown += `${item.description}\n\n`;
    });
  }

  if (results.successMetrics && results.successMetrics.length > 0) {
    markdown += `## Success Metrics\n\n`;
    results.successMetrics.forEach((metric: string) => {
      markdown += `- ${metric}\n`;
    });
    markdown += `\n`;
  }

  if (results.risks && results.risks.length > 0) {
    markdown += `## Risks & Mitigations\n\n`;
    results.risks.forEach((risk: any) => {
      markdown += `### ${risk.risk}\n\n`;
      markdown += `**Impact:** ${risk.impact}\n\n`;
      markdown += `**Mitigation:** ${risk.mitigation}\n\n`;
    });
  }

  if (results.resources && results.resources.length > 0) {
    markdown += `## Recommended Resources\n\n`;
    results.resources.forEach((resource: any) => {
      markdown += `- **${resource.title}** (${resource.type}): ${resource.description}\n`;
      if (resource.url) {
        markdown += `  - Link: ${resource.url}\n`;
      }
    });
    markdown += `\n`;
  }

  if (results.agentContributions && results.agentContributions.length > 0) {
    markdown += `## Agent Contributions\n\n`;
    results.agentContributions.forEach((contribution: any) => {
      markdown += `### ${contribution.agentName}\n\n`;
      markdown += `${contribution.analysis}\n\n`;
      
      if (contribution.recommendations && contribution.recommendations.length > 0) {
        markdown += `**Recommendations:**\n\n`;
        contribution.recommendations.forEach((rec: string) => {
          markdown += `- ${rec}\n`;
        });
        markdown += `\n`;
      }
    });
  }

  markdown += `---\n\n`;
  markdown += `*Generated by SoloSuccess AI Mission Control*\n`;

  return markdown;
}
