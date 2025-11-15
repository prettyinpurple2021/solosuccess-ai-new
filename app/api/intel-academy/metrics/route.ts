import { NextRequest, NextResponse } from 'next/server';
import { IntelAcademyMetricsService } from '@/lib/services/intel-academy-metrics.service';
import { getServerSession } from 'next-auth';

/**
 * GET /api/intel-academy/metrics
 * Get Intel Academy integration metrics
 * Requires authentication (admin only in production)
 */
export async function GET(request: NextRequest) {
  try {
    // In production, you should check for admin role
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get format from query params (json or prometheus)
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    if (format === 'prometheus') {
      const metricsText = await IntelAcademyMetricsService.exportMetrics();
      return new NextResponse(metricsText, {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4',
        },
      });
    }

    // Default to JSON format
    const metrics = await IntelAcademyMetricsService.getMetrics();

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching Intel Academy metrics:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
