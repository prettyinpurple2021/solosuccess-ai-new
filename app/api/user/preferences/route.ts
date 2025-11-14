import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/auth';

const DEFAULT_PREFERENCES = {
  theme: 'system',
  reducedMotion: false,
  notifications: {
    email: {
      insights: true,
      missions: true,
      competitors: true,
      marketing: false,
    },
    push: {
      insights: true,
      missions: true,
      competitors: true,
    },
    inApp: {
      insights: true,
      missions: true,
      competitors: true,
    },
    digestFrequency: 'daily',
  },
  dataPrivacy: {
    shareAnalytics: true,
    shareUsageData: true,
  },
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    const preferences = profile?.preferences || DEFAULT_PREFERENCES;

    return NextResponse.json({
      success: true,
      data: preferences,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch preferences',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;
    const body = await request.json();

    // Get current preferences
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    const currentPreferences = (profile?.preferences as any) || DEFAULT_PREFERENCES;

    // Merge with new preferences
    const updatedPreferences = {
      ...currentPreferences,
      ...body,
      notifications: {
        ...currentPreferences.notifications,
        ...body.notifications,
      },
      dataPrivacy: {
        ...currentPreferences.dataPrivacy,
        ...body.dataPrivacy,
      },
    };

    // Update or create profile with new preferences
    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        preferences: updatedPreferences,
        updatedAt: new Date(),
      },
      create: {
        userId,
        preferences: updatedPreferences,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPreferences,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update preferences',
        },
      },
      { status: 500 }
    );
  }
}
