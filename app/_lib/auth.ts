import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
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

const providers: Provider[] = [
  Google,
  GitHub,
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (c) => {
      if (!c.email || !c.password) {
        throw new Error("Please enter both email and password.");
      }

      try {
        const user = await userExists(c.email as string);
        if (!user.password && c.password) {
          throw new Error("Invalid login method.");
        }
        const compare = await brcypt.compare(
          c.password as string,
          user.password
        );
        if (!user || !compare) {
          throw new Error("Invalid credentials.");
        }

        return user;
      } catch (error) {
        console.error("Authorization error:", error);
        throw new Error("Invalid credentials.");
      }
    },
  }),
  Nodemailer({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM,
    async sendVerificationRequest({
      identifier: email,
      url,
      provider: { server, from },
    }) {
      const transport = nodemailer.createTransport(server);
      try {
        await transport.sendMail({
          to: email,
          from,
          subject: "Sign in to Memory Lane",
          text: `Sign in to Memory Lane using this link: ${url}`,
          html: `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign in to Memory Lane</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background-color: #A78BFA; padding: 20px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Memory Lane</h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color: #1F2937; font-size: 20px; margin: 0 0 16px;">Sign In to Your Account</h2>
                  <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0 0 16px;">
                    Hello,
                  </p>
                  <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0 0 16px;">
                    You requested to sign in to your Memory Lane account. Click the button below to securely access your account:
                  </p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="text-align: center; padding: 16px 0;">
                        <a href="${url}" style="background-color: #F472B6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">Sign In Now</a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 16px 0;">
                    If the button does not work, copy and paste this link into your browser:
                    <br>
                    <a href="${url}" style="color: #A78BFA; text-decoration: underline; word-break: break-all;">${url}</a>
                  </p>
                  <p style="color: #4B5563; font-size: 14px; line-height: 1.5; margin: 16px 0;">
                    <strong>Security Note:</strong> This link is valid for 24 hours. If you didn't request this sign-in, please ignore this email or contact our support team.
                    <strong>PS:</strong> You're never restting your password lil bro, I'm too lazy to do it.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #F9FAFB; padding: 20px; text-align: center; font-size: 14px; color: #6B7280;">
                  <p style="margin: 0 0 8px;">Memory Lane &bull; Preserving Your Precious Moments</p>
                  <p style="margin: 0 0 8px;">
                    Need help? <a href="mailto:himpraise571@gmail.com" style="color: #A78BFA; text-decoration: underline;">Contact Support</a>
                  </p>
                  <p style="margin: 0;">&copy; 2025 Memory Lane. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </body>
          </html>`,
        });
      } catch (err) {
        throw new Error(err);
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

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: providers,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  pages: {
    signIn: "/auth/login", // This is your custom login page
  },
  callbacks: {
    // This callback handles redirects after successful authentication
    async redirect({ url, baseUrl }) {
      console.log("url or base url", url, baseUrl);

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Always redirect to the mainpage after login via credentials
      // You can add more complex logic here if you have other dynamic redirects
      return baseUrl + "/mainpage";
    },

    // You might also need a session callback to include custom user data in the session
    // async session({ session, token, user }) {
    //   // For example, if your 'user' object has an 'id' or other custom fields
    //   // session.user.id = user.id;
    //   return session;
    // },
  },
});
