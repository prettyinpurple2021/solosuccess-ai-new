import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WebhookService } from '@/lib/services/intel-academy-webhook.service';
import { addBreadcrumb } from '@/lib/monitoring';

/**
 * POST /api/intel-academy/webhook
 * Receive webhook events from Intel Academy and store in queue for async processing
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.text();
    const signature = request.headers.get('x-intel-academy-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature using HMAC SHA-256
    const isValid = WebhookService.verifySignature(body, signature);
    
    if (!isValid) {
      // Log security event for failed signature verification
      const sourceIp = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      
      addBreadcrumb(
        'Intel Academy webhook signature verification failed',
        'security',
        'error',
        {
          sourceIp,
          timestamp: new Date().toISOString(),
        }
      );

      console.error('Invalid webhook signature from IP:', sourceIp);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const { type } = event;

    // Store event in database queue with pending status
    const eventId = await WebhookService.storeEvent(
      'intel_academy',
      type,
      event,
      signature
    );

    const duration = Date.now() - startTime;
    
    // Log successful webhook reception
    addBreadcrumb(
      'Intel Academy webhook received',
      'webhook',
      'info',
      {
        eventType: type,
        eventId,
        duration,
      }
    );

    // Return 200 OK within 3 seconds (async processing via cron)
    return NextResponse.json({ 
      received: true,
      eventId,
    }, { status: 200 });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('Error receiving Intel Academy webhook:', error);
    
    addBreadcrumb(
      'Intel Academy webhook reception failed',
      'webhook',
      'error',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      }
    );

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
