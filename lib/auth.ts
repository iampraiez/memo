import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Nodemailer from "next-auth/providers/nodemailer";
import nodemailer from "nodemailer";
import db from "@/drizzle/index";
import {
  accounts,
  users,
  verificationTokens,
  sessions,
} from "@/drizzle/db/schema";
import type { Provider } from "next-auth/providers";
import brcypt from "bcryptjs";
import { userExists } from "./api";
import { verifyGoogleToken, getOrCreateGoogleUser } from "./google-auth";
import { env } from "@/config/env";

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      token: { label: "Token", type: "text" },
      type: { label: "Type", type: "text" },
    },
    authorize: async (c) => {
      // Handle Google Token Login
      if (c.type === "google-token" && c.token) {
        try {
          const payload = await verifyGoogleToken(c.token as string);
          const user = await getOrCreateGoogleUser(payload);
          return user;
        } catch (error) {
          console.error("Manual Google Auth Error:", error);
          throw new Error("GOOGLE_AUTH_FAILED");
        }
      }

      // Handle standard Email/Password Login
      if (!c.email || !c.password) {
        throw new Error("Please enter both email and password.");
      }

      try {
        const user = await userExists(c.email as string);
        if (!user || !user.password) {
          throw new Error("Invalid credentials.");
        }
        const compare = await brcypt.compare(
          c.password as string,
          user.password,
        );
        if (!compare) {
          throw new Error("Invalid credentials.");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return user;
      } catch (error) {
        // Re-throw specific errors
        if (error instanceof Error && (error.message === "EMAIL_NOT_VERIFIED" || error.message === "GOOGLE_AUTH_FAILED")) {
          throw error;
        }
        throw new Error("Invalid credentials.");
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
    async session({ session, token, user }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
  },
});
