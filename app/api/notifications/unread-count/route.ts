import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification-service';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = request.headers.get('x-user-id') || 'demo-user';

    const count = await notificationService.getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch unread count',
      },
      { status: 500 }
    );
  }
}
