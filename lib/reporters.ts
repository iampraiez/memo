import db from "@/drizzle/index";
import { users, memories, pushSubscriptions, systemLogs } from "@/db/db/schema";
import { count, gte, and, eq } from "drizzle-orm";
import { sendEmail } from "@/services/email.service";
import { logger } from "./logger";

export const reporters = {
  sendDailyReport: async () => {
    try {
      logger.info("Generating daily report...");

      // 1. Fetch Stats
      const [userCount] = await db.select({ value: count() }).from(users);
      const [memoryCount] = await db.select({ value: count() }).from(memories);
      const [subscriptionCount] = await db.select({ value: count() }).from(pushSubscriptions);

      // 2. Active users in last 24h (based on memories created or users updated)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [activeUsers] = await db
        .select({ value: count() })
        .from(users)
        .where(gte(users.updatedAt, twentyFourHoursAgo));

      // 3. New memories in last 24h
      const [newMemories] = await db
        .select({ value: count() })
        .from(memories)
        .where(gte(memories.createdAt, twentyFourHoursAgo));

      // 4. Critical errors in last 24h
      const errorLogs = await db
        .select({
          message: systemLogs.message,
          timestamp: systemLogs.createdAt,
        })
        .from(systemLogs)
        .where(and(eq(systemLogs.level, "error"), gte(systemLogs.createdAt, twentyFourHoursAgo)))
        .limit(5);

      const errorCount = errorLogs.length;

      const adminEmail = process.env.ADMIN_EMAIL || "himpraise571@gmail.com";
      const subject = `📊 Memory Lane Daily Report - ${new Date().toLocaleDateString()}`;

      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 25px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 24px;">Daily Status Report</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">System Performance & Engagement Summary</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9; text-align: center;">
              <span style="display: block; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Total Users</span>
              <span style="display: block; color: #1e293b; font-size: 28px; font-weight: 800; margin-top: 5px;">${userCount.value}</span>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9; text-align: center;">
              <span style="display: block; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Active (24h)</span>
              <span style="display: block; color: #1e293b; font-size: 28px; font-weight: 800; margin-top: 5px;">${activeUsers.value}</span>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9; text-align: center;">
              <span style="display: block; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Total Memories</span>
              <span style="display: block; color: #1e293b; font-size: 28px; font-weight: 800; margin-top: 5px;">${memoryCount.value}</span>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9; text-align: center;">
              <span style="display: block; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">New (24h)</span>
              <span style="display: block; color: #1e293b; font-size: 28px; font-weight: 800; margin-top: 5px;">${newMemories.value}</span>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #f1f5f9; text-align: center;">
              <span style="display: block; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Push Subs</span>
              <span style="display: block; color: #1e293b; font-size: 28px; font-weight: 800; margin-top: 5px;">${subscriptionCount.value}</span>
            </div>
          </div>

          <div style="margin-bottom: 30px; padding: 20px; background-color: ${errorCount > 0 ? "#fef2f2" : "#f0fdf4"}; border-radius: 8px; border: 1px solid ${errorCount > 0 ? "#fee2e2" : "#dcfce7"};">
            <h3 style="color: ${errorCount > 0 ? "#991b1b" : "#166534"}; margin: 0 0 10px 0; font-size: 16px;">System Health</h3>
            <p style="margin: 0; font-size: 14px; color: ${errorCount > 0 ? "#b91c1c" : "#15803d"}; font-weight: 500;">
              ${errorCount > 0 ? `⚠️ Detected ${errorCount} critical errors in the last 24 hours.` : "✅ No critical system errors reported in the last 24 hours."}
            </p>
            ${
              errorLogs.length > 0
                ? `
              <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 13px; color: #7f1d1d; list-style-type: none;">
                ${errorLogs
                  .map(
                    (e) =>
                      `<li style="margin-bottom: 5px;">• ${e.message} (${new Date(
                        e.timestamp!,
                      ).toLocaleTimeString()})</li>`,
                  )
                  .join("")}
              </ul>
            `
                : ""
            }
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>This report was automatically generated by the Memory Lane Reporter.</p>
            <p>&copy; ${new Date().getFullYear()} Memory Lane. All rights reserved.</p>
          </div>
        </div>
      `;

      await sendEmail({ to: adminEmail, subject, html });
      logger.info("Daily report sent successfully.");
    } catch (error) {
      logger.error("Failed to send daily report:", error);
      throw error;
    }
  },
};
