import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.INTEL_ACADEMY_WEBHOOK_SECRET || '';

/**
 * Verify webhook signature from Intel Academy
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * POST /api/intel-academy/webhook
 * Handle webhook events from Intel Academy
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-intel-academy-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    console.log('Received Intel Academy webhook:', type);

    switch (type) {
      case 'course.enrolled':
        await handleCourseEnrolled(data);
        break;

      case 'course.progress_updated':
        await handleCourseProgressUpdated(data);
        break;

      case 'course.completed':
        await handleCourseCompleted(data);
        break;

      case 'achievement.earned':
        await handleAchievementEarned(data);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(data);
        break;

      default:
        console.log('Unhandled webhook event type:', type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Intel Academy webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle course enrollment event
 */
async function handleCourseEnrolled(data: any) {
  try {
    const { user_id, course_id, course_name, course_description, thumbnail_url, enrolled_at } = data;

    // Find user by Intel Academy user ID
    const integration = await prisma.intelAcademyIntegration.findUnique({
      where: { intelAcademyUserId: user_id },
    });

    if (!integration) {
      console.error('Integration not found for Intel Academy user:', user_id);
      return;
    }

    // Create or update course record
    await prisma.intelAcademyCourse.upsert({
      where: {
        userId_courseId: {
          userId: integration.userId,
          courseId: course_id,
        },
      },
      create: {
        userId: integration.userId,
        courseId: course_id,
        courseName: course_name,
        courseDescription: course_description,
        thumbnailUrl: thumbnail_url,
        enrollmentDate: new Date(enrolled_at),
        progress: 0,
        status: 'enrolled',
      },
      update: {
        enrollmentDate: new Date(enrolled_at),
        status: 'enrolled',
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: integration.userId,
        type: 'intel_academy_course',
        category: 'learning',
        title: 'New Course Enrolled',
        message: `You've enrolled in ${course_name} on Intel Academy.`,
        priority: 'low',
      },
    });

    console.log(`Course enrolled: ${course_name} for user ${integration.userId}`);
  } catch (error) {
    console.error('Error handling course enrolled:', error);
    throw error;
  }
}

/**
 * Handle course progress update event
 */
async function handleCourseProgressUpdated(data: any) {
  try {
    const { user_id, course_id, progress, last_accessed_at } = data;

    const integration = await prisma.intelAcademyIntegration.findUnique({
      where: { intelAcademyUserId: user_id },
    });

    if (!integration) {
      console.error('Integration not found for Intel Academy user:', user_id);
      return;
    }

    await prisma.intelAcademyCourse.update({
      where: {
        userId_courseId: {
          userId: integration.userId,
          courseId: course_id,
        },
      },
      data: {
        progress: Math.round(progress),
        status: progress >= 100 ? 'completed' : 'in_progress',
        lastAccessedAt: new Date(last_accessed_at),
      },
    });

    console.log(`Course progress updated: ${course_id} - ${progress}%`);
  } catch (error) {
    console.error('Error handling course progress update:', error);
    throw error;
  }
}

/**
 * Handle course completion event
 */
async function handleCourseCompleted(data: any) {
  try {
    const { user_id, course_id, course_name, completed_at } = data;

    const integration = await prisma.intelAcademyIntegration.findUnique({
      where: { intelAcademyUserId: user_id },
    });

    if (!integration) {
      console.error('Integration not found for Intel Academy user:', user_id);
      return;
    }

    await prisma.intelAcademyCourse.update({
      where: {
        userId_courseId: {
          userId: integration.userId,
          courseId: course_id,
        },
      },
      data: {
        progress: 100,
        status: 'completed',
        completionDate: new Date(completed_at),
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: integration.userId,
        type: 'intel_academy_completion',
        category: 'learning',
        title: 'Course Completed! 🎉',
        message: `Congratulations! You've completed ${course_name}.`,
        priority: 'medium',
      },
    });

    console.log(`Course completed: ${course_name} for user ${integration.userId}`);
  } catch (error) {
    console.error('Error handling course completion:', error);
    throw error;
  }
}

/**
 * Handle achievement earned event
 */
async function handleAchievementEarned(data: any) {
  try {
    const {
      user_id,
      achievement_id,
      achievement_name,
      achievement_type,
      description,
      badge_url,
      earned_at,
    } = data;

    const integration = await prisma.intelAcademyIntegration.findUnique({
      where: { intelAcademyUserId: user_id },
    });

    if (!integration) {
      console.error('Integration not found for Intel Academy user:', user_id);
      return;
    }

    // Create achievement record
    await prisma.intelAcademyAchievement.create({
      data: {
        userId: integration.userId,
        achievementId: achievement_id,
        achievementName: achievement_name,
        achievementType: achievement_type,
        description: description,
        badgeUrl: badge_url,
        earnedAt: new Date(earned_at),
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: integration.userId,
        type: 'intel_academy_achievement',
        category: 'learning',
        title: 'New Achievement Unlocked! 🏆',
        message: `You've earned the "${achievement_name}" badge on Intel Academy.`,
        priority: 'medium',
      },
    });

    console.log(`Achievement earned: ${achievement_name} for user ${integration.userId}`);
  } catch (error) {
    console.error('Error handling achievement earned:', error);
    throw error;
  }
}

/**
 * Handle subscription update event from Intel Academy
 */
async function handleSubscriptionUpdated(data: any) {
  try {
    const { user_id, subscription_tier, status } = data;

    const integration = await prisma.intelAcademyIntegration.findUnique({
      where: { intelAcademyUserId: user_id },
    });

    if (!integration) {
      console.error('Integration not found for Intel Academy user:', user_id);
      return;
    }

    // Update sync status
    await prisma.intelAcademyIntegration.update({
      where: { userId: integration.userId },
      data: {
        lastSyncAt: new Date(),
        syncStatus: status === 'active' ? 'active' : 'error',
      },
    });

    console.log(`Subscription updated for user ${integration.userId}: ${subscription_tier}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw error;
  }
}
