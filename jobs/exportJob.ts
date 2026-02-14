import db from "@/drizzle/index";
import { 
    users, 
    memories, 
    userPreferences, 
    exportJobs, 
} from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/services/email.service";
import { sendNotificationToUser } from "@/services/notification.service";
import { logger } from "@/lib/logger";

export const runExportJob = async (jobId: string, userId: string) => {
    try {
        logger.info(`Starting export job ${jobId} for user ${userId}`);

        // 1. Fetch all user data
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) throw new Error("User not found");

        const userMemories = await db.select().from(memories).where(eq(memories.userId, userId));
        const [prefs] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));

        // 2. Construct Export Object
        const exportData = {
            user: {
                name: user.name,
                email: user.email,
                username: user.username,
                bio: user.bio,
                createdAt: user.createdAt,
            },
            preferences: prefs || {},
            memories: userMemories,
            exportedAt: new Date().toISOString(),
            version: "1.0",
        };

        const jsonContent = JSON.stringify(exportData, null, 2);
        const filename = `memory-lane-export-${new Date().toISOString().split('T')[0]}.json`;

        // 3. Send Email with Attachment
        if (user.email) {
            await sendEmail({
                to: user.email,
                subject: "Your Memory Lane Data Export",
                html: `
                    <h1>Your Data is Ready</h1>
                    <p>Hello ${user.name || 'Memory Lane User'},</p>
                    <p>Your data export is attached to this email. It contains all your profile information, preferences, and memories in JSON format.</p>
                    <p>For security, please keep this file safe.</p>
                `,
                attachments: [
                    {
                        filename: filename,
                        content: jsonContent,
                        contentType: "application/json",
                    },
                ],
            });
        }

        // 4. Update Job Status
        await db.update(exportJobs)
            .set({ 
                status: "completed", 
                completedAt: new Date(),
                size: Buffer.byteLength(jsonContent, 'utf8') 
            })
            .where(eq(exportJobs.id, jobId));

        // 5. Send Push Notification
        await sendNotificationToUser(userId, {
            title: "Data Export Complete",
            body: "Your data has been emailed to you.",
        });

        logger.info(`Export job ${jobId} completed successfully`);

    } catch (error: unknown) {
        const err = error as { message?: string };
        logger.error(`Export job ${jobId} failed:`, err);
        
        await db.update(exportJobs)
            .set({ 
                status: "failed", 
                error: err.message || "Unknown error" 
            })
            .where(eq(exportJobs.id, jobId));

        // Notify failure
        await sendNotificationToUser(userId, {
            title: "Data Export Failed",
            body: "There was an error exporting your data. Please try again.",
        });
    }
};
