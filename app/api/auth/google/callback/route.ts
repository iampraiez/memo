import { NextRequest, NextResponse } from "next/server";
import { getGoogleUserFromCode, handleGoogleUser } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = (searchParams.get("state") || "login") as "login" | "signup";

  const errorRedirectUrl = state === "signup" ? "/auth/register" : "/auth/login";

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`${errorRedirectUrl}?error=google_auth_failed`, request.url),
    );
  }

  try {
    const { payload, idToken } = await getGoogleUserFromCode(code);

    if (!payload) {
      return NextResponse.json({ error: "Invalid google token" }, { status: 400 });
    }

    // Process the Google User with strict intent enforcement
    await handleGoogleUser(payload, state);

    // Redirect to login/register page with the idToken.
    // The Client page will automatically detect this and call signIn("credentials", ...)
    const url = new URL(state === "signup" ? "/auth/register" : "/auth/login", request.url);
    url.searchParams.set("google_token", idToken || "");

    return NextResponse.redirect(url);
  } catch (err) {
    console.error("Google Callback Error:", err);
    return NextResponse.redirect(
      new URL(
        `${errorRedirectUrl}?error=${encodeURIComponent((err as unknown as Error).message || "google_auth_failed")}`,
        request.url,
      ),
    );
  }
}
