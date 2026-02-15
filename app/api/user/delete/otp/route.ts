import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/drizzle/index";
import { verificationTokens } from "@/drizzle/db/schema";
import { sendDeletionOTP } from "@/services/email.service";
import { logger } from "@/custom/log/logger";
import { eq, and } from "drizzle-orm";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store in verificationTokens table
    // First, delete any existing tokens for this action (optional but cleaner)
    await db.delete(verificationTokens).where(
        and(
            eq(verificationTokens.identifier, email),
            // We might want to differentiate types if this table is shared, 
            // but schema.ts only has identifier/token. 
            // We'll rely on the specific token match.
        )
    );

    await db.insert(verificationTokens).values({
      identifier: email,
      token: otp,
      expires: expires,
    });

    // Send Email
    const emailRes = await sendDeletionOTP(email, otp);
    
    if (!emailRes?.success) {
        throw new Error("Failed to send email");
    }

    logger.info(`Deletion OTP sent to ${email}`);

    return NextResponse.json({ message: "OTP sent" }, { status: 200 });
  } catch (error) {
    logger.error("Error sending deletion OTP:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
