import nodemailer from "nodemailer";
import { logger } from "@/lib/logger";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Email attempt ${i + 1} for ${to} failed:`, error);
      if (i === retries - 1) return { success: false, error };
      // Exponential backoff
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
