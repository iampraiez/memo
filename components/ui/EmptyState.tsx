"use client";

import React from "react";
import { Sparkle } from "@phosphor-icons/react";
import Button from "./Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "animate-fade-in flex min-h-[460px] flex-col items-center justify-center p-8 text-center",
        className,
      )}
    >
      {/* Premium Graphic Element */}
      <div className="relative mb-10">
        <div className="bg-primary-100/50 absolute inset-0 scale-150 animate-pulse rounded-full blur-3xl" />
        <div className="from-primary-900 to-primary-700 relative flex h-24 w-24 rotate-3 items-center justify-center rounded-3xl bg-gradient-to-br shadow-2xl">
          {icon || <Sparkle className="h-12 w-12 text-white" weight="duotone" />}
        </div>
        <div className="bg-secondary-400 absolute -right-2 -bottom-2 flex h-10 w-10 -rotate-12 items-center justify-center rounded-xl shadow-lg">
          <Sparkle className="text-primary-900 h-5 w-5" weight="fill" />
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h3 className="font-display text-3xl font-bold tracking-tight text-neutral-900">{title}</h3>
        <p className="text-lg leading-relaxed font-light text-neutral-500">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-8">
          <Button
            size="lg"
            onClick={onAction}
            className="shadow-primary-900/10 rounded-full px-8 py-6 shadow-xl transition-all duration-300 hover:scale-105"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
