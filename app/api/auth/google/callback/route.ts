import { NextRequest, NextResponse } from "next/server";
import { getGoogleUserFromCode, getOrCreateGoogleUser } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/auth/login?error=google_auth_failed", request.url));
  }

  try {
    const { payload, idToken } = await getGoogleUserFromCode(code);

    if (!payload) {
      return NextResponse.json({ error: "Invalid google token" }, { status: 400 });
    }

    await getOrCreateGoogleUser(payload);

    // Redirect to login page with the idToken.
    // The LoginPage will automatically detect this and call signIn("credentials", ...)
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("google_token", idToken || "");

    return NextResponse.redirect(url);
  } catch (err) {
    console.error("Google Callback Error:", err);
    return NextResponse.redirect(new URL("/auth/login?error=google_auth_failed", request.url));
  }
}
