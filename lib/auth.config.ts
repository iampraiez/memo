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

      if (!isLoggedIn && !isPublicPage) {
        return false;
      }

      return true;
    },
    // We can keep the simpler redirects here or in the specialized auth.ts
    // For middleware 'authorized' callback is key.
  },
  providers: [], // Providers are configured in auth.ts
} satisfies NextAuthConfig;
