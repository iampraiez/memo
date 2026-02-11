import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/auth");
      const isLandingPage = nextUrl.pathname === "/";
      const isApiRoute = nextUrl.pathname.startsWith("/api");
      const isLegalPage = nextUrl.pathname === "/privacy" || nextUrl.pathname === "/terms";
      const isOnboardingPage = nextUrl.pathname === "/onboarding";
        const isStaticFile =
          /\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|ttf)$/i.test(
            nextUrl.pathname,
          );
      const isTechnicalRequest = nextUrl.pathname.startsWith("/.well-known") || nextUrl.pathname.endsWith(".json");
      const isPublicPage =
        isLandingPage ||
        isApiRoute ||
        isLegalPage ||
        isStaticFile ||
        isTechnicalRequest;

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/timeline", nextUrl));
        }
        return true;
      }

      // Redirect logged-in users who haven't completed onboarding
      if (isLoggedIn && !auth.user.isOnboarded && !isOnboardingPage && !isPublicPage) {
        return Response.redirect(new URL("/onboarding", nextUrl));
      }

      // Prevent onboarded users from accessing onboarding page
      if (isLoggedIn && auth.user.isOnboarded && isOnboardingPage) {
        return Response.redirect(new URL("/timeline", nextUrl));
      }

      if (!isLoggedIn && !isPublicPage && !isOnboardingPage) {
        return false;
      }

      if (!isLoggedIn && !isPublicPage && !isOnboardingPage) {
        return false;
      }

      return true;
    },
    // Add lightweight callbacks for middleware to access token data
    async jwt({ token, user }) {
      if (user) {
        token.isOnboarded = user.isOnboarded;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.isOnboarded !== undefined) {
        session.user.isOnboarded = token.isOnboarded as boolean;
      }
      return session;
    },
  },
  providers: [], // Providers are configured in auth.ts
} satisfies NextAuthConfig;
