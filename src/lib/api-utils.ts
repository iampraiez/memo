import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Validates the current session and ensures the user is authenticated.
 * Returns the session user object if authenticated, otherwise returns an error NextResponse.
 * usage:
 * const { user, error } = await requireAuth();
 * if (error) return error;
 * // use user.id
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null,
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!session.user.emailVerified) {
    return {
      user: null,
      error: NextResponse.json(
        { message: "Email not verified. Please verify your email to continue." },
        { status: 403 },
      ),
    };
  }

  return { user: session.user, error: null };
}
