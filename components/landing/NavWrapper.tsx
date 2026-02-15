"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function NavWrapper() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-neutral-200/50 bg-white/90 py-4 backdrop-blur-xl"
          : "bg-transparent py-6",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="group flex cursor-pointer items-center space-x-3">
          <div className="from-primary-700 to-primary-900 shadow-primary-900/20 flex h-10 w-10 transform items-center justify-center rounded-xl bg-linear-to-br shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3">
            <span className="font-serif text-lg font-bold tracking-tight text-white">M</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-neutral-900">
            Memory Lane
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <Link href={"/register"}>
            <Button
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all duration-300 sm:px-8 sm:py-2.5 sm:text-base",
                scrolled
                  ? "bg-primary-800 hover:bg-primary-900 shadow-primary-900/10 text-white"
                  : "text-primary-900 border-primary-100 border bg-white shadow-xl shadow-black/5 hover:bg-neutral-50",
              )}
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
