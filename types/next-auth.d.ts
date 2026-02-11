import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      isOnboarded?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string | null;
    isOnboarded?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string | null;
    name?: string | null;
    image?: string | null;
    isOnboarded?: boolean;
  }
}
