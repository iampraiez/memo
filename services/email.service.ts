import type { Attachment } from "nodemailer/lib/mailer";
import nodemailer from "nodemailer";
import { env } from "@/config/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}

export const sendEmail = async (
  { to, subject, html, attachments }: SendEmailParams,
  retries = 3,
) => {
  for (let i = 0; i < retries; i++) {
    try {
      const info = await transporter.sendMail({
        from: env.EMAIL_USER,
        to,
        subject,
        html,
        attachments,
      });
      console.log(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`Email attempt ${i + 1} for ${to} failed:`, error);
      if (i === retries - 1) return { success: false, error };
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return { success: false, error: new Error("Max retries reached") };
};

export const sendVerificationEmail = async (email: string, code: string) => {
  const subject = "Verify your Memory Lane account";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #2563EB;">Welcome to Memory Lane!</h1>
      <p>Thank you for signing up. Please use the following verification code to complete your registration:</p>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1F2937;">${code}</span>
      </div>
      <p>This code will expire in 1 hour.</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
      <p style="font-size: 12px; color: #6B7280; text-align: center;">
        &copy; ${new Date().getFullYear()} Memory Lane. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};

export const sendDeletionOTP = async (email: string, code: string) => {
  const subject = "Confirm Account Deletion";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #DC2626;">Account Deletion Request</h1>
      <p>We received a request to permanently delete your Memory Lane account. If this was you, please use the code below to confirm:</p>
      <div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #FECACA;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #991B1B;">${code}</span>
      </div>
      <p style="color: #DC2626; font-weight: bold;">Warning: This action cannot be undone. All your memories and data will be permanently lost.</p>
      <p>This code will expire in 5 minutes.</p>
      <p>If you didn't request this, please change your password immediately.</p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
      <p style="font-size: 12px; color: #6B7280; text-align: center;">
        &copy; ${new Date().getFullYear()} Memory Lane.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};

export const sendErrorReportEmail = async (error: Error, context?: string) => {
  const adminEmail = process.env.ADMIN_EMAIL || "himpraise571@gmail.com";
  const subject = `🚨 CRITICAL ERROR: ${context || "System Alert"}`;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : "No stack trace available";

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 30px; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="color: #ef4444; margin: 0; font-size: 24px;">Critical Error Detected</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">Automated alert from Memory Lane Sanctuary</p>
      </div>

      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
        <h2 style="color: #991b1b; margin: 0 0 10px 0; font-size: 18px;">Error Summary</h2>
        <p style="margin: 0; font-weight: bold; font-size: 16px;">${errorMessage}</p>
        ${context ? `<p style="margin: 10px 0 0 0; color: #b91c1c;"><span style="font-weight: bold;">Context:</span> ${context}</p>` : ""}
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 120px;">Timestamp:</td>
            <td style="padding: 8px 0; font-family: monospace;">${new Date().toISOString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Environment:</td>
            <td style="padding: 8px 0;">${process.env.NODE_ENV || "unknown"}</td>
          </tr>
        </table>
      </div>

      <div>
        <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">Stack Trace</h3>
        <pre style="background-color: #111827; color: #fbbf24; padding: 20px; border-radius: 8px; font-size: 13px; line-height: 1.5; overflow-x: auto; white-space: pre-wrap; word-break: break-all;">${errorStack}</pre>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>This is an automated message from the Memory Lane system monitor.</p>
        <p>&copy; ${new Date().getFullYear()} Memory Lane. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: adminEmail, subject, html });
};