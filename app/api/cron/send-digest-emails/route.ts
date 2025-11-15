import { NextRequest, NextResponse } from 'next/server';
import { notificationEmailQueue } from '@/lib/services/notification-email-queue';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await notificationEmailQueue.sendDigestEmails();

    return NextResponse.json({
      success: true,
      message: 'Digest emails sent successfully',
    });
  } catch (error) {
    console.error('Error in digest email cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send digest emails',
      },
      { status: 500 }
    );
  }
}
