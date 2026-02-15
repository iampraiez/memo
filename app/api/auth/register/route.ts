import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import db from "@/drizzle/index";
import { users, verificationTokens } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/custom/log/logger";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/services/email.service";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const generateVerificationCode = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        // User exists but not verified - resend code and redirect to verify page
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
        }

        logger.info(`Verification code resent to existing unverified user: ${email}`);

        return NextResponse.json(
          {
            message: "This email is already registered but not verified. A new verification code has been sent.",
            requiresVerification: true,
            isExistingUnverified: true,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 },
      );
    }

    const hashedPassword = await hash(password, 12);

    const newUser = await db
      .insert(users)
      .values({
        id: uuidv4(),
        email,
        password: hashedPassword,
        name,
        emailVerified: null,
      })
      .returning();

    // Generate verification code and store it
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
      // Don't fail the registration, but log the error
    }

    logger.info(`New user registered: ${email}, verification code sent`);

    return NextResponse.json(
      {
        message:
          "User created successfully. Please check your email for verification code.",
        user: { id: newUser[0].id, email: newUser[0].email },
        requiresVerification: true,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.issues },
        { status: 400 },
      );
    }
    logger.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
