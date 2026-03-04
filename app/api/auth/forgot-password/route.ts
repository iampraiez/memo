import { NextResponse } from "next/server";
import db from "@/drizzle/index";
import { users } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/custom/log/logger";
import { generatePasswordResetToken } from "@/services/token.service";
import { sendPasswordResetEmail } from "@/services/email.service";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Don't reveal user existence for security
      return NextResponse.json(
        { message: "If that email exists, we sent a link." },
        { status: 200 },
      );
    }

    // Check if user has a password (they might be Google-only)
    if (!user.password) {
      return NextResponse.json(
        {
          message: "This account uses Google login. Please sign in with Google.",
        },
        { status: 400 },
      );
    }

    // Generate token and save to DB
    const token = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(email, token);

    logger.info(`Password reset link sent to: ${email}`);

    return NextResponse.json({ message: "If that email exists, we sent a link." }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }
    logger.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
