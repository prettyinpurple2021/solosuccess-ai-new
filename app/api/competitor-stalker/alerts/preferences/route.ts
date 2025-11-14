import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { alertSystemService } from '@/lib/services/alert-system';
import { z } from 'zod';

const preferencesSchema = z.object({
  enabled: z.boolean().optional(),
  emailAlerts: z.boolean().optional(),
  pushAlerts: z.boolean().optional(),
  importanceLevels: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  activityTypes: z.array(z.string()).optional(),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string(),
    end: z.string(),
  }).optional(),
});

// GET /api/competitor-stalker/alerts/preferences - Get alert preferences
export async function GET(request: NextRequest) {
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

    const preferences = await alertSystemService.getUserPreferences(user.id);

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching alert preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/competitor-stalker/alerts/preferences - Update alert preferences
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = preferencesSchema.parse(body);

    const updatedPreferences = await alertSystemService.updateUserPreferences(
      user.id,
      validatedData
    );

    return NextResponse.json(updatedPreferences);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating alert preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
