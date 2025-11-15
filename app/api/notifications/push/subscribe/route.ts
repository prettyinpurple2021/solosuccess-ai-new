import { NextRequest, NextResponse } from 'next/server';
import { pushNotificationService } from '@/lib/services/push-notification-service';

export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = request.headers.get('x-user-id') || 'demo-user';

    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid subscription data',
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || undefined;

    await pushNotificationService.subscribe(userId, subscription, userAgent);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to push notifications',
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to subscribe to push notifications',
      },
      { status: 500 }
    );
  }
}
