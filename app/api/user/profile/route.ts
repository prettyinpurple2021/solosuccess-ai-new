import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/middleware/auth';

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const profileData = {
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      avatarUrl: user.profile?.avatarUrl,
      businessName: user.profile?.businessName,
      businessType: user.profile?.businessType,
      industry: user.profile?.industry,
      companySize: user.profile?.companySize,
      goals: user.profile?.goals,
      preferences: user.profile?.preferences,
      onboardingCompleted: user.profile?.onboardingCompleted || false,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: profileData,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user profile',
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

    const {
      firstName,
      lastName,
      businessName,
      businessType,
      industry,
      companySize,
      goals,
    } = body;

    // Update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        firstName,
        lastName,
        businessName,
        businessType,
        industry,
        companySize,
        goals,
        updatedAt: new Date(),
      },
      create: {
        userId,
        firstName,
        lastName,
        businessName,
        businessType,
        industry,
        companySize,
        goals,
      },
    });

    // Fetch updated user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    const profileData = {
      id: user!.id,
      email: user!.email,
      firstName: user!.profile?.firstName,
      lastName: user!.profile?.lastName,
      avatarUrl: user!.profile?.avatarUrl,
      businessName: user!.profile?.businessName,
      businessType: user!.profile?.businessType,
      industry: user!.profile?.industry,
      companySize: user!.profile?.companySize,
      goals: user!.profile?.goals,
      preferences: user!.profile?.preferences,
      onboardingCompleted: user!.profile?.onboardingCompleted || false,
      subscriptionTier: user!.subscriptionTier,
      subscriptionStatus: user!.subscriptionStatus,
      createdAt: user!.createdAt.toISOString(),
      updatedAt: user!.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: profileData,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user profile',
        },
      },
      { status: 500 }
    );
  }
}
