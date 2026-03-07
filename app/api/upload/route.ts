import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CloudinaryService } from "@/services/cloudinary.service";
import { logger } from "@/custom/log/logger";

export const maxDuration = 300; // Increase timeout to 300 seconds (5 minutes)

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 });
    }

    // Server-side file size validation (20MB limit)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      return NextResponse.json(
        {
          message: `File size limit exceeded. The following files are too large (max 20MB): ${oversizedFiles.map((f) => f.name).join(", ")}`,
        },
        { status: 400 },
      );
    }

    logger.info(`Uploading ${files.length} files for user ${session.user.id}`);

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return CloudinaryService.uploadFile(buffer, file.name, "memo");
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls });
  } catch (error: unknown) {
    const errorData = error instanceof Error ? error : new Error("Unknown error");

    // Cloudinary errors often use http_code
    const status =
      (error as { status?: number }).status || (error as { http_code?: number }).http_code || 500;

    const details =
      (error as { error?: { error_summary?: string } }).error?.error_summary || errorData.message;

    // Log the full error object for better debugging
    logger.error("Upload API Error:", {
      message: errorData.message,
      stack: errorData.stack,
      status: status,
      error_details: error,
    });

    return NextResponse.json(
      {
        message:
          status === 499
            ? "Upload timed out. Please try again or use a smaller file."
            : "Internal Server Error",
        error: errorData.message,
        details: details,
      },
      { status: status as number },
    );
  }
}
