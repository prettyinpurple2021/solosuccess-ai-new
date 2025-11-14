import nodemailer from 'nodemailer';

// Configure email transporter
// In production, use SendGrid or another email service
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SENDGRID_API_KEY || '',
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using configured transporter
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@solosuccess.ai',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            padding: 40px;
            color: white;
          }
          .content {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            padding: 30px;
            color: #333;
            backdrop-filter: blur(10px);
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 style="margin: 0 0 20px 0; font-size: 28px;">SoloSuccess AI</h1>
          <div class="content">
            <h2 style="margin: 0 0 16px 0; color: #667eea;">Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SoloSuccess AI. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Reset Your Password
    
    You requested to reset your password. Visit the following link to create a new password:
    
    ${resetUrl}
    
    This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
    
    © ${new Date().getFullYear()} SoloSuccess AI. All rights reserved.
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - SoloSuccess AI',
    html,
    text,
  });
}
