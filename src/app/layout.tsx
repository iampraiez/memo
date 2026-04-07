import { ReactNode } from "react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Inter, Playfair_Display } from "next/font/google";
import "./global.css";
import { Providers } from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Memory Lane - Your Personal Timeline",
  description:
    "Capture, organize, and rediscover your most precious memories with AI-powered insights",
  robots: "index, follow",
  keywords: ["memory", "timeline", "AI", "personal history", "family memories"],
  openGraph: {
    title: "Memory Lane - Your Personal Timeline",
    description:
      "Capture, organize, and rediscover your most precious memories with AI-powered insights",
    type: "website",
  },
};

export function generateViewport() {
  return {
    themeColor: "#6366f1",
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${inter.className} selection:bg-primary-100 selection:text-primary-900 antialiased`}
      >
        <ErrorBoundary>
          <Providers session={session}>
            {children}
            <Toaster
              position="top-right"
              richColors
              expand={false}
              duration={4000}
              closeButton
              theme="light"
              toastOptions={{
                classNames: {
                  toast:
                    "group font-sans rounded-2xl border border-primary-50 bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] shadow-primary-600/10 p-4",
                  title: "font-display font-bold text-neutral-900 text-sm",
                  description: "text-neutral-500 text-xs mt-0.5",
                  actionButton:
                    "bg-primary-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold",
                  cancelButton:
                    "bg-neutral-100 text-neutral-600 rounded-lg px-3 py-1.5 text-xs font-bold",
                  success: "text-primary-600 border-primary-100",
                  error: "text-red-600 border-red-100",
                },
              }}
            />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
