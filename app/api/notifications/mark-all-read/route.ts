import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification-service';

export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = request.headers.get('x-user-id') || 'demo-user';

    await notificationService.markAllAsRead(userId);

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark all notifications as read',
      },
      { status: 500 }
    );
  }
}
