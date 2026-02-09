import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { exportJobs } from "@/drizzle/db/schema";
import { runExportJob } from "@/jobs/exportJob";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Create Export Job Record
    const [job] = await db.insert(exportJobs).values({
        id: crypto.randomUUID(),
        userId: userId,
        status: "pending",
        format: "json",
    }).returning();

    logger.info(`Export job ${job.id} created for user ${userId}`);

    // Trigger background job (Fire-and-forget)
    // In a real serverless env (Vercel), use waitUntil() or a queue.
    // For this implementation, we'll detach the promise.
    runExportJob(job.id, userId).catch(err => {
        logger.error(`Background export job failed outside request context`, err);
    });

    return NextResponse.json({ message: "Export started", jobId: job.id }, { status: 202 });
  } catch (error) {
    logger.error("Error starting export job:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
