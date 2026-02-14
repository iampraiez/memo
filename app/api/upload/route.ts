import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CloudinaryService } from "@/services/cloudinary.service";
import { logger } from "@/lib/logger";

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

    logger.info(`Uploading ${files.length} files for user ${session.user.id}`);

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return CloudinaryService.uploadFile(buffer, file.name);
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls });
  } catch (error: unknown) {
    const errorData = error instanceof Error ? error : new Error("Unknown error");
    const status = (error as { status?: number }).status || 500;
    const details = (error as { error?: { error_summary?: string } }).error?.error_summary || errorData.message;

    // Log the full error object for better debugging
    logger.error("Upload API Error:", {
      message: errorData.message,
      stack: errorData.stack,
      status: status,
      error_details: (error as { error?: unknown }).error,
    });
    
    return NextResponse.json(
      { 
        message: "Internal Server Error", 
        error: errorData.message,
        details: details
      },
      { status: status as number }
    );
  }
}
