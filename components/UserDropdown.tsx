"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, Gear, SignOut, CaretDown, Spinner } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { cn } from "@/lib/utils";

export default function UserDropdown() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-2xl border border-transparent p-1.5 transition-all hover:border-neutral-100 hover:bg-neutral-50"
      >
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white bg-neutral-200 font-bold text-neutral-600 shadow-sm">
          {session.user.image ? (
            <Image src={session.user.image} alt={session.user.name || ""} width={32} height={32} />
          ) : (
            <span>{session.user.name?.[0] || "U"}</span>
          )}
        </div>
        <CaretDown
          className={cn(
            "h-3 w-3 text-neutral-400 transition-transform duration-300",
            isOpen && "rotate-180",
          )}
          weight="bold"
        />
      </button>

      {isOpen && (
        <div className="shadow-soft-xl animate-in fade-in zoom-in absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-neutral-100 bg-white py-2 duration-200">
          <div className="border-b border-neutral-50 px-4 py-3">
            <p className="truncate text-sm font-bold text-neutral-900">{session.user.name}</p>
            <p className="truncate text-xs text-neutral-500">{session.user.email}</p>
          </div>

          <div className="py-1">
            <Link
              href={`/profile/${session.user.id}`}
              className="hover:text-primary-900 flex items-center space-x-3 px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50"
              onClick={() => setIsOpen(false)}
              onMouseEnter={() => {
                queryClient.prefetchQuery({
                  queryKey: ["profile", session.user.id],
                  queryFn: () => userService.getProfile(session.user.id),
                });
              }}
            >
              <User className="h-4 w-4" />
              <span>Your Profile</span>
            </Link>
            <Link
              href="/settings"
              className="hover:text-primary-900 flex items-center space-x-3 px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50"
              onClick={() => setIsOpen(false)}
              onMouseEnter={() => {
                queryClient.prefetchQuery({
                  queryKey: ["userSettings"],
                  queryFn: () => userService.getSettings(),
                });
              }}
            >
              <Gear className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>

          <div className="mt-1 border-t border-neutral-50 pt-1">
            <button
              onClick={async () => {
                setIsSigningOut(true);
                await signOut({ callbackUrl: "/" });
              }}
              disabled={isSigningOut}
              className="text-destructive-600 hover:bg-destructive-50 flex w-full items-center space-x-3 px-4 py-2 text-left text-sm transition-colors disabled:opacity-50"
            >
              {isSigningOut ? (
                <Spinner className="h-4 w-4 animate-spin" />
              ) : (
                <SignOut className="h-4 w-4" />
              )}
              <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
