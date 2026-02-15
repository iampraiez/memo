import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { users, verificationTokens } from "@/drizzle/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { logger } from "@/custom/log/logger";

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { otp } = await req.json();
    if (!otp) {
      return NextResponse.json({ message: "OTP is required" }, { status: 400 });
    }

    const email = session.user.email;

    // Verify OTP
    const [tokenRecord] = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, otp),
          gt(verificationTokens.expires, new Date()),
        ),
      );

    if (!tokenRecord) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 },
      );
    }

    // Delete User (Cascading)
    await db.delete(users).where(eq(users.email, email));

    // Cleanup token
    await db
      .delete(verificationTokens)
      .where(and(eq(verificationTokens.identifier, email), eq(verificationTokens.token, otp)));

    logger.info(`User ${email} deleted account`);

    return NextResponse.json({ message: "Account deleted" }, { status: 200 });
  } catch (error) {
    logger.error("Error deleting account:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
