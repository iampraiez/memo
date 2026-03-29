"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import * as idb from "idb-keyval";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { SyncProvider } from "@/components/providers/SyncProvider";

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
  { ssr: false },
);

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const persister = createAsyncStoragePersister({
        storage: {
          getItem: async (key) => await idb.get(key),
          setItem: async (key, value) => await idb.set(key, value),
          removeItem: async (key) => await idb.del(key),
        },
      });

      persistQueryClient({
        queryClient,
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      // Explicit SW Registration
      if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => console.log("SW registered:", reg))
            .catch((err) => console.error("SW registration failed:", err));
        });
      }
    }
  }, [queryClient]);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <SyncProvider>
          {children}
          {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
        </SyncProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
