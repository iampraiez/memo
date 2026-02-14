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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-neutral-200/50 py-4"
          : "bg-transparent py-6",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-10 h-10 bg-linear-to-br from-primary-700 to-primary-900 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/20 transform transition-transform group-hover:scale-110 group-hover:rotate-3">
            <span className="text-white font-serif font-bold text-lg tracking-tight">
              M
            </span>
          </div>
          <span className="text-xl font-display font-bold text-neutral-900 tracking-tight">
            Memory Lane
          </span>
        </div>

        <div className="flex items-center space-x-6">
          <Link href={"/register"}>
            <Button
              className={cn(
                "rounded-full px-4 sm:px-8 py-2 sm:py-2.5 font-medium transition-all duration-300 shadow-md text-sm sm:text-base",
                scrolled
                  ? "bg-primary-800 text-white hover:bg-primary-900 shadow-primary-900/10"
                  : "bg-white text-primary-900 hover:bg-neutral-50 border border-primary-100 shadow-xl shadow-black/5",
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
