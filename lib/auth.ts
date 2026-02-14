import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import nodemailer from "nodemailer";
import db from "@/drizzle/index";
import { accounts, users, verificationTokens, sessions } from "@/db/db/schema";
import type { Provider } from "next-auth/providers";
import brcypt from "bcryptjs";
import { userExists } from "./query";
import { verifyGoogleToken, getOrCreateGoogleUser } from "./google-auth";
import { env } from "@/config/env";
import { eq } from "drizzle-orm";

import { CredentialsSignin } from "next-auth";

class AuthError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      token: { label: "Token", type: "text" },
      type: { label: "Type", type: "text" },
    },
    authorize: async (c) => {
      if (c.type === "google-token" && c.token) {
        try {
          const payload = await verifyGoogleToken(c.token as string);
          const user = await getOrCreateGoogleUser(payload);
          return user;
        } catch (error) {
          console.error("Manual Google Auth Error:", error);
          throw new AuthError("GOOGLE_AUTH_FAILED");
        }
      }

      // Handle standard Email/Password Login
      if (!c.email || !c.password) {
        throw new AuthError("INVALID_CREDENTIALS");
      }

      try {
        const user = await userExists(c.email as string);
        if (!user || !user.password) {
          throw new AuthError("INVALID_CREDENTIALS");
        }
        const compare = await brcypt.compare(
          c.password as string,
          user.password,
        );
        if (!compare) {
          throw new AuthError("INVALID_CREDENTIALS");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new AuthError("EMAIL_NOT_VERIFIED");
        }

        return user;
      } catch (error) {
        if (error instanceof AuthError) throw error;
        console.error("Auth Exception:", error);
        throw new AuthError("AUTH_ERROR");
      }
    },
  }),
  Nodemailer({
    server: {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    },
    from: env.EMAIL_USER,
    sendVerificationRequest: async ({ identifier, url, provider }) => {
      const transport = nodemailer.createTransport(provider.server);
      try {
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: "Sign in to Memory Lane",
          text: `Sign in to Memory Lane using this link: ${url}`,
          html: `<p>Sign in to Memory Lane: <a href="${url}">Click here</a></p>`,
        });
      } catch (error) {
        console.error("Error sending verification email", error);
        throw new Error("Failed to send verification email");
      }
    },
  }),
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

import { authConfig } from "./auth.config";

// ... previous imports ...

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: providers,
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // ...authConfig.callbacks, // authorized is mainly for middleware
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl + "/timeline";
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }

      if (token.email) {
        session.user.email = token.email as string;
      }

      if (token.username) {
        session.user.username = token.username as string;
      }

      if (token.name) {
        session.user.name = token.name as string;
      }

      if (token.image) {
        session.user.image = token.image as string;
      }

      if (token.isOnboarded !== undefined) {
        session.user.isOnboarded = token.isOnboarded as boolean;
      }

      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.name = user.name;
        token.image = user.image;
        token.isOnboarded = user.isOnboarded;
        token.lastRefreshed = Date.now();
      }

      // Refresh isOnboarded status from database on every request IF NOT in Edge Runtime
      // Database queries with 'pg' driver fail in Edge Runtime (Middleware)
      const isEdge = process.env.NEXT_RUNTIME === "edge";

      const now = Date.now();
      const lastRefreshed = (token.lastRefreshed as number) || 0;
      const oneMinute = 60 * 1000;

      if (token.id && !isEdge && (now - lastRefreshed > oneMinute || trigger === "update")) {
        try {
          console.log(`[Auth] Refreshing user data for ${token.id}. Trigger: ${trigger}`);
          
          const [dbUser] = await db
            .select({
              isOnboarded: users.isOnboarded,
              username: users.username,
              name: users.name,
              image: users.image,
            })
            .from(users)
            .where(eq(users.id, token.id as string))
            .limit(1);

          if (dbUser) {
            token.isOnboarded = dbUser.isOnboarded;
            if (dbUser.username) token.username = dbUser.username;
            if (dbUser.name) token.name = dbUser.name;
            if (dbUser.image) token.image = dbUser.image;
            token.lastRefreshed = now;
            console.log(`[Auth] User data refreshed successfully for ${token.id}`);
          } else {
            console.warn(`[Auth] User not found during JWT refresh: ${token.id}`);
          }
        } catch (error) {
          console.error("[Auth] Connection Error during JWT refresh:", error);
          // Don't crash the session if refresh fails, keep current token
        }
      }

      if (trigger === "update" && session) {
        // Support both nested and flat update structures
        const userData = session.user || session;

        if (userData.username !== undefined) token.username = userData.username;
        if (userData.name !== undefined) token.name = userData.name;
        if (userData.image !== undefined) token.image = userData.image;
        if (userData.avatar !== undefined) token.image = userData.avatar;
        if (userData.isOnboarded !== undefined)
          token.isOnboarded = userData.isOnboarded;
      }

      return token;
    },
  },
});
