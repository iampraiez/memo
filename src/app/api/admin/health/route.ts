import { NextResponse } from "next/server";
import { CloudinaryService } from "@/services/cloudinary.service";
import db from "@/drizzle/index";
import { sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    // Only allow admins to check health
    const session = await auth();
    const isAdmin = session?.user?.email === (process.env.ADMIN_EMAIL || "himpraise571@gmail.com");

    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check Cloudinary
    const cloudinaryHealth = await CloudinaryService.checkHealth();

    // Check Database
    let dbStatus = "ok";
    try {
      await db.execute(sql`SELECT 1`);
    } catch (err) {
      dbStatus = "error";
      logger.error("Health check: DB connection failed", err);
    }

    const health = {
      status: cloudinaryHealth.ok && dbStatus === "ok" ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
        },
        cloudinary: {
          status: cloudinaryHealth.ok ? "ok" : "error",
          message: cloudinaryHealth.message,
          cloudName: cloudinaryHealth.cloudName,
        },
      },
      env: process.env.NODE_ENV,
    };

    return NextResponse.json(health, {
      status: health.status === "healthy" ? 200 : 503,
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    return NextResponse.json({ status: "error", message: "Health check failed" }, { status: 500 });
  }
}
