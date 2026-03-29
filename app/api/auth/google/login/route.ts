import { NextResponse, NextRequest } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const intent = request.nextUrl.searchParams.get("intent") as "login" | "signup" | null;
  const url = getGoogleAuthUrl(intent || "login");
  return NextResponse.redirect(url);
}
