import React from "react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Inter, Playfair_Display } from "next/font/google";
import "./global.css";
import { Providers } from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: "Memory Lane - Your Personal Timeline",
  description: "Capture, organize, and rediscover your most precious memories with AI-powered insights",
  robots: "index, follow",
  keywords: ["memory", "timeline", "AI", "personal history", "family memories"],
  openGraph: {
    title: "Memory Lane - Your Personal Timeline",
    description: "Capture, organize, and rediscover your most precious memories with AI-powered insights",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${inter.className} antialiased selection:bg-primary-100 selection:text-primary-900`}>
        <ErrorBoundary>
          <Providers session={session}>
            {children}
            <Toaster position="top-right" richColors />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
