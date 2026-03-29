import { NextResponse } from "next/server";
import { reporters } from "@/lib/reporters";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await reporters.sendDailyReport();

    return NextResponse.json({
      message: "Daily report sent successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[DailyReportAPI] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
