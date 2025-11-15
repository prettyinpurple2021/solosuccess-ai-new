import { NextRequest, NextResponse } from 'next/server';
import { pushNotificationService } from '@/lib/services/push-notification-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        {
          success: false,
          error: 'Endpoint is required',
        },
        { status: 400 }
      );
    }

    await pushNotificationService.unsubscribe(endpoint);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications',
    });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unsubscribe from push notifications',
      },
      { status: 500 }
    );
  }
}
