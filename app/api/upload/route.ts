import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DropboxService } from "@/services/dropbox.service";
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
      // Dropbox SDK accepts ArrayBuffer
      return DropboxService.uploadFile(arrayBuffer, file.name);
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls });
  } catch (error: any) {
    // Log the full error object for better debugging
    logger.error("Upload API Error:", {
      message: error.message,
      stack: error.stack,
      status: error.status,
      error_details: error.error,
    });
    
    return NextResponse.json(
      { 
        message: "Internal Server Error", 
        error: error.message,
        details: error.error?.error_summary || error.message
      },
      { status: 500 }
    );
  }
}
