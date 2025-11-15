import { NextRequest, NextResponse } from 'next/server';
import { notificationPreferenceService } from '@/lib/services/notification-preference-service';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = request.headers.get('x-user-id') || 'demo-user';

    const preferences = await notificationPreferenceService.getPreferences(userId);

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch preferences',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = request.headers.get('x-user-id') || 'demo-user';

    const body = await request.json();

    const preferences = await notificationPreferenceService.updatePreferences(userId, body);

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update preferences',
      },
      { status: 500 }
    );
  }
}
