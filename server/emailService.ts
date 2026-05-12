import nodemailer from 'nodemailer';
import logger from './logger';

const SERVICE = 'email';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"INFERA Finance AI" <${process.env.SMTP_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });
    logger.info(SERVICE, `Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    logger.error(SERVICE, 'Email sending failed', error, { to: options.to });
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string, lang: 'en' | 'ar' = 'en'): Promise<boolean> {
  const subject = lang === 'ar' 
    ? 'مرحباً بك في INFERA Finance AI' 
    : 'Welcome to INFERA Finance AI';

  const html = lang === 'ar' ? `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">INFERA Finance AI</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">منصة الإدارة المالية الذكية</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">مرحباً ${name}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            شكراً لانضمامك إلى INFERA Finance AI GlobalCloud. نحن سعداء بوجودك معنا!
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            مع منصتنا، يمكنك:
          </p>
          <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 30px; padding-right: 20px;">
            <li>إدارة حساباتك المالية بكفاءة</li>
            <li>تتبع المعاملات والفواتير</li>
            <li>الحصول على رؤى ذكية مدعومة بالذكاء الاصطناعي</li>
            <li>إنشاء تقارير مالية احترافية</li>
          </ul>
          <a href="https://inferafinanceglobal.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            ابدأ الآن
          </a>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © 2026 INFERA Finance AI. جميع الحقوق محفوظة.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">
            هذا البريد تم إرساله من noreply@inferaengine.com
          </p>
        </div>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">INFERA Finance AI</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Intelligent Financial Management Platform</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">Welcome, ${name}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            Thank you for joining INFERA Finance AI GlobalCloud. We're excited to have you on board!
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            With our platform, you can:
          </p>
          <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 30px; padding-left: 20px;">
            <li>Manage your financial accounts efficiently</li>
            <li>Track transactions and invoices</li>
            <li>Get AI-powered intelligent insights</li>
            <li>Generate professional financial reports</li>
          </ul>
          <a href="https://inferafinanceglobal.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Get Started
          </a>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © 2026 INFERA Finance AI. All rights reserved.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0;">
            This email was sent from noreply@inferaengine.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendPasswordResetEmail(email: string, resetToken: string, lang: 'en' | 'ar' = 'en'): Promise<boolean> {
  const resetUrl = `https://inferafinanceglobal.com/reset-password?token=${resetToken}`;
  const subject = lang === 'ar' 
    ? 'إعادة تعيين كلمة المرور - INFERA Finance AI'
    : 'Password Reset - INFERA Finance AI';

  const html = lang === 'ar' ? `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">INFERA Finance AI</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">إعادة تعيين كلمة المرور</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. انقر على الزر أدناه لإنشاء كلمة مرور جديدة:
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0;">
            إعادة تعيين كلمة المرور
          </a>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
            هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © 2026 INFERA Finance AI. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">INFERA Finance AI</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0;">
            Reset Password
          </a>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
            This link is valid for 1 hour only. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © 2026 INFERA Finance AI. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendInvoiceNotification(
  email: string,
  invoiceNumber: string,
  amount: string,
  dueDate: string,
  lang: 'en' | 'ar' = 'en'
): Promise<boolean> {
  const subject = lang === 'ar'
    ? `فاتورة جديدة #${invoiceNumber} - INFERA Finance AI`
    : `New Invoice #${invoiceNumber} - INFERA Finance AI`;

  const html = lang === 'ar' ? `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">INFERA Finance AI</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">فاتورة جديدة</h2>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #4b5563; font-size: 16px; margin: 0 0 10px;"><strong>رقم الفاتورة:</strong> #${invoiceNumber}</p>
            <p style="color: #4b5563; font-size: 16px; margin: 0 0 10px;"><strong>المبلغ:</strong> ${amount}</p>
            <p style="color: #4b5563; font-size: 16px; margin: 0;"><strong>تاريخ الاستحقاق:</strong> ${dueDate}</p>
          </div>
          <a href="https://inferafinanceglobal.com/invoices" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            عرض الفاتورة
          </a>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">© 2026 INFERA Finance AI. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">INFERA Finance AI</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">New Invoice</h2>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #4b5563; font-size: 16px; margin: 0 0 10px;"><strong>Invoice Number:</strong> #${invoiceNumber}</p>
            <p style="color: #4b5563; font-size: 16px; margin: 0 0 10px;"><strong>Amount:</strong> ${amount}</p>
            <p style="color: #4b5563; font-size: 16px; margin: 0;"><strong>Due Date:</strong> ${dueDate}</p>
          </div>
          <a href="https://inferafinanceglobal.com/invoices" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Invoice
          </a>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">© 2026 INFERA Finance AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendAIAlertEmail(
  email: string,
  alertType: string,
  title: string,
  description: string,
  severity: 'info' | 'warning' | 'critical',
  lang: 'en' | 'ar' = 'en'
): Promise<boolean> {
  const severityColors = {
    info: '#3b82f6',
    warning: '#f59e0b',
    critical: '#ef4444'
  };

  const subject = lang === 'ar'
    ? `تنبيه ${alertType}: ${title} - INFERA Finance AI`
    : `${alertType} Alert: ${title} - INFERA Finance AI`;

  const html = lang === 'ar' ? `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">INFERA Finance AI</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">تنبيه الذكاء الاصطناعي</p>
        </div>
        <div style="padding: 40px 30px;">
          <div style="background-color: ${severityColors[severity]}15; border-right: 4px solid ${severityColors[severity]}; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
            <h2 style="color: ${severityColors[severity]}; margin: 0 0 10px; font-size: 20px;">${title}</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">${description}</p>
          </div>
          <a href="https://inferafinanceglobal.com/ai-insights" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            عرض التفاصيل
          </a>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">© 2026 INFERA Finance AI. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">INFERA Finance AI</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">AI Alert Notification</p>
        </div>
        <div style="padding: 40px 30px;">
          <div style="background-color: ${severityColors[severity]}15; border-left: 4px solid ${severityColors[severity]}; padding: 20px; border-radius: 8px 0 0 8px; margin-bottom: 20px;">
            <h2 style="color: ${severityColors[severity]}; margin: 0 0 10px; font-size: 20px;">${title}</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">${description}</p>
          </div>
          <a href="https://inferafinanceglobal.com/ai-insights" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Details
          </a>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">© 2026 INFERA Finance AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendWeeklyReportEmail(
  email: string,
  reportData: {
    revenue: number;
    expenses: number;
    netIncome: number;
    pendingInvoices: number;
    overdueAmount: number;
  },
  lang: 'en' | 'ar' = 'en'
): Promise<boolean> {
  const subject = lang === 'ar'
    ? 'التقرير الأسبوعي - INFERA Finance AI'
    : 'Weekly Report - INFERA Finance AI';

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const html = lang === 'ar' ? `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">INFERA Finance AI</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">التقرير المالي الأسبوعي</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">ملخص الأسبوع</h2>
          <div style="display: grid; gap: 15px;">
            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px;">
              <p style="color: #166534; font-size: 14px; margin: 0;">الإيرادات</p>
              <p style="color: #166534; font-size: 24px; font-weight: bold; margin: 5px 0 0;">${formatCurrency(reportData.revenue)}</p>
            </div>
            <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px;">
              <p style="color: #dc2626; font-size: 14px; margin: 0;">المصروفات</p>
              <p style="color: #dc2626; font-size: 24px; font-weight: bold; margin: 5px 0 0;">${formatCurrency(reportData.expenses)}</p>
            </div>
            <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px;">
              <p style="color: #1d4ed8; font-size: 14px; margin: 0;">صافي الدخل</p>
              <p style="color: #1d4ed8; font-size: 24px; font-weight: bold; margin: 5px 0 0;">${formatCurrency(reportData.netIncome)}</p>
            </div>
          </div>
          <div style="margin-top: 20px; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>تنبيه:</strong> لديك ${reportData.pendingInvoices} فواتير معلقة بقيمة ${formatCurrency(reportData.overdueAmount)}
            </p>
          </div>
          <a href="https://inferafinanceglobal.com/reports" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 20px;">
            عرض التقرير الكامل
          </a>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">© 2026 INFERA Finance AI. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">INFERA Finance AI</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Weekly Financial Report</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">Weekly Summary</h2>
          <div style="display: grid; gap: 15px;">
            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px;">
              <p style="color: #166534; font-size: 14px; margin: 0;">Revenue</p>
              <p style="color: #166534; font-size: 24px; font-weight: bold; margin: 5px 0 0;">${formatCurrency(reportData.revenue)}</p>
            </div>
            <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px;">
              <p style="color: #dc2626; font-size: 14px; margin: 0;">Expenses</p>
              <p style="color: #dc2626; font-size: 24px; font-weight: bold; margin: 5px 0 0;">${formatCurrency(reportData.expenses)}</p>
            </div>
            <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px;">
              <p style="color: #1d4ed8; font-size: 14px; margin: 0;">Net Income</p>
              <p style="color: #1d4ed8; font-size: 24px; font-weight: bold; margin: 5px 0 0;">${formatCurrency(reportData.netIncome)}</p>
            </div>
          </div>
          <div style="margin-top: 20px; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>Alert:</strong> You have ${reportData.pendingInvoices} pending invoices worth ${formatCurrency(reportData.overdueAmount)}
            </p>
          </div>
          <a href="https://inferafinanceglobal.com/reports" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 20px;">
            View Full Report
          </a>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">© 2026 INFERA Finance AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}
