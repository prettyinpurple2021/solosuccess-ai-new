import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification-service';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = request.headers.get('x-user-id') || 'demo-user';

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const category = searchParams.get('category') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const notifications = await notificationService.getUserNotifications(userId, {
      unreadOnly,
      category,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notifications',
      },
      { status: 500 }
    );
  }
}
