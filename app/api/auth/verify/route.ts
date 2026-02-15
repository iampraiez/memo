import { NextResponse } from "next/server";
import db from "@/drizzle/index";
import { users, verificationTokens } from "@/drizzle/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/custom/log/logger";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code } = verifySchema.parse(body);

    // Find the verification token
    const token = await db.query.verificationTokens.findFirst({
      where: and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, code)),
    });

    if (!token) {
      return NextResponse.json({ message: "Invalid verification code" }, { status: 400 });
    }

    // Check if token is expired
    if (token.expires < new Date()) {
      // Delete expired token
      await db
        .delete(verificationTokens)
        .where(and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, code)));

      return NextResponse.json(
        { message: "Verification code has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Update user's emailVerified field
    await db.update(users).set({ emailVerified: new Date() }).where(eq(users.email, email));

    // Delete the verification token
    await db
      .delete(verificationTokens)
      .where(and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, code)));

    logger.info(`Email verified for user: ${email}`);

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.issues }, { status: 400 });
    }
    logger.error("Verification error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
