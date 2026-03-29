import { NextResponse } from "next/server";
import db from "@/drizzle/index";
import { users } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";
import { verifyPasswordResetToken, deletePasswordResetToken } from "@/services/token.service";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Verify token
    const email = await verifyPasswordResetToken(token);

    if (!email) {
      return NextResponse.json({ message: "Invalid or expired reset token." }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    // Delete used token
    await deletePasswordResetToken(token);

    logger.info(`Password reset successfully for user: ${email}`);

    return NextResponse.json(
      { message: "Your password has been successfully reset." },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    logger.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
