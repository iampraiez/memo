import { NextResponse } from "next/server";
import db from "@/drizzle/index";
import { users, verificationTokens } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sendVerificationEmail } from "@/services/email.service";

const resendSchema = z.object({
  email: z.string().email(),
});

// Generate 8-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = resendSchema.parse(body);

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 },
      );
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this email
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));

    // Insert new verification token
    await db.insert(verificationTokens).values({
      identifier: email,
      token: verificationCode,
      expires: expiresAt,
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode);

    if (!emailResult.success) {
      logger.error(`Failed to send verification email to ${email}`);
      return NextResponse.json(
        {
          message: "Failed to send verification email. Please try again later.",
        },
        { status: 500 },
      );
    }

    logger.info(`Verification code resent to: ${email}`);

    return NextResponse.json(
      { message: "Verification code sent to your email" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.issues },
        { status: 400 },
      );
    }
    logger.error("Resend code error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
