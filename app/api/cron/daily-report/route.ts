import { NextResponse } from "next/server";
import { reporters } from "@/custom/log";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await reporters.sendDailyReport();
    
    return NextResponse.json({ 
      message: "Daily report sent successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[DailyReportAPI] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
