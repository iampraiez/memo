import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isAuthPage = nextUrl.pathname.startsWith("/auth");
      const isPublicPage = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/api");

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/mainpage", nextUrl));
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
