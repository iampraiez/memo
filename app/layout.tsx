import React from "react";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/app/_lib/auth"; // Import auth from your local auth config
import { handlers } from "@/app/_lib/auth"; // Import handlers from your local auth config
import { Inter } from "next/font/google";
import "./global.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Memory Lane",
  description: "Your digital family memory book",
  robots: "index, follow",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth(); // Fetch session server-side

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </SessionProvider>
  );
}
