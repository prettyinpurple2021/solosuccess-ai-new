import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize the email transporter
   */
  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      // Use SendGrid SMTP or fallback to console logging in development
      if (process.env.SENDGRID_API_KEY || process.env.SMTP_HOST) {
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || 'apikey',
            pass: process.env.SMTP_PASS || process.env.SENDGRID_API_KEY,
          },
        });
      } else {
        // Development mode - log emails to console
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true,
        });
      }
    }

    return this.transporter;
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const transporter = this.getTransporter();

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@solosuccess.ai',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV === 'development') {
        console.log('Email sent (development mode):', {
          to: options.to,
          subject: options.subject,
          messageId: info.messageId,
        });
      }

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send intelligence briefing email
   */
  async sendIntelligenceBriefing(
    to: string,
    briefingHtml: string,
    briefingText: string,
    period: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `🕵️ Your ${period} Intelligence Briefing - SoloSuccess AI`,
      html: briefingHtml,
      text: briefingText,
    });
  }

  /**
   * Check if user has email notifications enabled for a category
   */
  async canSendEmail(userId: string, category: string): Promise<boolean> {
    try {
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences || !preferences.emailEnabled) {
        return false;
      }

      const categories = preferences.categories as any;
      if (categories && categories[category] !== undefined) {
        return categories[category] === true;
      }

      return true; // Default to enabled if not specified
    } catch (error) {
      console.error('Error checking email preferences:', error);
      return true; // Default to enabled on error
    }
  }

  /**
   * Get branded email template wrapper
   */
  private getEmailTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a202c;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #f7fafc;
      padding: 30px;
      text-align: center;
      color: #718096;
      font-size: 12px;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ SoloSuccess AI</h1>
      <p>Your Virtual Executive Team</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SoloSuccess AI. All rights reserved.</p>
      <p>
        <a href="https://solosuccess.ai/settings/notifications">Manage notification preferences</a> |
        <a href="https://solosuccess.ai">Visit Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(
    userId: string,
    to: string,
    category: string,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<boolean> {
    // Check preferences
    const canSend = await this.canSendEmail(userId, category);
    if (!canSend) {
      return false;
    }

    const content = `
      <h2 style="color: #2d3748; margin-top: 0;">${title}</h2>
      <p style="color: #4a5568; font-size: 16px;">${message}</p>
      ${actionUrl ? `<a href="${actionUrl}" class="button">View Details →</a>` : ''}
    `;

    return this.sendEmail({
      to,
      subject: title,
      html: this.getEmailTemplate(content),
      text: `${title}\n\n${message}${actionUrl ? `\n\nView details: ${actionUrl}` : ''}`,
    });
  }

  /**
   * Send digest email
   */
  async sendDigestEmail(
    userId: string,
    to: string,
    notifications: Array<{ title: string; message: string; actionUrl?: string }>
  ): Promise<boolean> {
    const canSend = await this.canSendEmail(userId, 'digest');
    if (!canSend) {
      return false;
    }

    const notificationItems = notifications
      .map(
        (n) => `
      <div style="background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
        <h3 style="margin: 0 0 10px; color: #2d3748; font-size: 16px;">${n.title}</h3>
        <p style="margin: 0 0 10px; color: #4a5568;">${n.message}</p>
        ${n.actionUrl ? `<a href="${n.actionUrl}" style="color: #667eea; text-decoration: none; font-weight: 600;">View →</a>` : ''}
      </div>
    `
      )
      .join('');

    const content = `
      <h2 style="color: #2d3748; margin-top: 0;">Your Daily Digest</h2>
      <p style="color: #4a5568; font-size: 16px;">Here's what happened while you were away:</p>
      ${notificationItems}
      <a href="https://solosuccess.ai/notifications" class="button">View All Notifications →</a>
    `;

    return this.sendEmail({
      to,
      subject: `📬 Your Daily Digest - ${notifications.length} Updates`,
      html: this.getEmailTemplate(content),
      text: `Your Daily Digest\n\n${notifications.map((n) => `${n.title}\n${n.message}\n${n.actionUrl || ''}\n`).join('\n')}`,
    });
  }

  /**
   * Send competitor alert email
   */
  async sendCompetitorAlert(
    to: string,
    competitorName: string,
    activityTitle: string,
    activityDescription: string,
    sourceUrl?: string
  ): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #fc8181 0%, #f56565 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; }
    .alert { background: #fff5f5; border-left: 4px solid #fc8181; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .competitor { color: #667eea; font-weight: 600; font-size: 18px; margin-bottom: 10px; }
    .activity-title { font-size: 16px; font-weight: 600; color: #2d3748; margin-bottom: 10px; }
    .activity-description { color: #4a5568; margin-bottom: 15px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .footer { text-align: center; color: #a0aec0; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚨 Critical Competitor Alert</h1>
  </div>

  <div class="alert">
    <div class="competitor">${competitorName}</div>
    <div class="activity-title">${activityTitle}</div>
    <div class="activity-description">${activityDescription}</div>
    ${sourceUrl ? `<a href="${sourceUrl}" class="button">View Details →</a>` : ''}
  </div>

  <div class="footer">
    <p>This alert was automatically generated by SoloSuccess AI</p>
    <p>To manage your alert settings, visit your dashboard</p>
  </div>
</body>
</html>
`;

    const text = `
CRITICAL COMPETITOR ALERT

Competitor: ${competitorName}
Activity: ${activityTitle}

${activityDescription}

${sourceUrl ? `View details: ${sourceUrl}` : ''}

---
This alert was automatically generated by SoloSuccess AI
`;

    return this.sendEmail({
      to,
      subject: `🚨 Critical Alert: ${competitorName} - ${activityTitle}`,
      html,
      text,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
