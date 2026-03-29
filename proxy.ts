import { authConfig } from "./lib/auth.config";
import NextAuth from "next-auth";

export default NextAuth(authConfig).auth;

export const config = {
  // matcher for (main) protected routes
  // e.g. /timeline, /analytics, /settings, /explore
  matcher: [
    "/timeline/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/explore/:path*",
    "/profile/:path*",
    "/(main)/:path*",
    "/api/memories/:path*",
    "/api/analytics/:path*",
    "/api/user/:path*",
  ],
};
