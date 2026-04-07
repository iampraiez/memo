import db from "@/drizzle/index";
import { verificationTokens } from "@/drizzle/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour from now

  // Remove any existing reset tokens for this user (optional but cleaner)
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));

  // Save new token
  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires,
  });

  return token;
};

export const verifyPasswordResetToken = async (token: string) => {
  try {
    const [existingToken] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token))
      .limit(1);

    if (!existingToken) return null;

    // Check expiry
    const hasExpired = new Date(existingToken.expires).getTime() < Date.now();
    if (hasExpired) {
      // Clean up expired token
      await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
      return null;
    }

    return existingToken.identifier;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

export const deletePasswordResetToken = async (token: string) => {
  await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
};
