import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  try {
    // TODO: Get userId from session/auth
    const userId = request.headers.get('x-user-id') || 'demo-user';

    const notification = await notificationService.markAsRead(params.notificationId, userId);

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark notification as read',
      },
      { status: 500 }
    );
  }
}
