import { OAuth2Client, TokenPayload } from "google-auth-library";
import { env } from "@/config/env";
import db from "@/drizzle/index";
import { users, accounts } from "@/drizzle/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const client = new OAuth2Client({
  clientId: env.AUTH_GOOGLE_ID,
  clientSecret: env.AUTH_GOOGLE_SECRET,
});

client.transporter.defaults = {
  ...client.transporter.defaults,
  timeout: 60000,
};

const REDIRECT_URI = `${env.NEXT_PUBLIC_URL}/api/auth/google/callback`;

export function getGoogleAuthUrl() {
  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    redirect_uri: REDIRECT_URI,
  });
}

export async function getGoogleUserFromCode(code: string) {
  const { tokens } = await client.getToken({
    code,
    redirect_uri: REDIRECT_URI,
  });
  client.setCredentials(tokens);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: env.AUTH_GOOGLE_ID,
  });

  return { payload: ticket.getPayload(), idToken: tokens.id_token };
}

export async function verifyGoogleToken(token: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.AUTH_GOOGLE_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token payload");
    }
    return payload;
  } catch (error) {
    console.error("Google Token Verification Error:", error);
    throw new Error("Failed to verify Google token");
  }
}

export async function getOrCreateGoogleUser(payload: TokenPayload) {
  const { email, sub: googleId, name, picture } = payload;
  if (!email) throw new Error("Google email is required");

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user) {
    const [existingAccount] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.provider, "google"), eq(accounts.providerAccountId, googleId)))
      .limit(1);
    if (existingAccount.provider === "google") {
      return user;
    } else {
      throw new Error(
        "User with this email already exists but is not linked to Google. Please use the original sign-in method.",
      );
    }
  }

  const userId = uuidv4();
  const [newUser] = await db
    .insert(users)
    .values({
      id: userId,
      email: email as string,
      name,
      image: picture,
      emailVerified: new Date(),
    })
    .returning();

  // Link account
  await db.insert(accounts).values({
    userId: newUser.id,
    type: "oauth",
    provider: "google",
    providerAccountId: googleId as string,
  });

  return newUser;
}
