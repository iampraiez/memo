"use client";

import React from 'react';
import { Sparkle } from '@phosphor-icons/react';
import Button from './Button';
import { cn } from '@/lib/utils';

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
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[460px] p-8 text-center animate-fade-in",
      className
    )}>
      {/* Premium Graphic Element */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-primary-100/50 rounded-full blur-3xl scale-150 animate-pulse" />
        <div className="relative w-24 h-24 bg-gradient-to-br from-primary-900 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
          {icon || <Sparkle className="w-12 h-12 text-secondary-400/40" weight="duotone" />}
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary-400 rounded-xl flex items-center justify-center shadow-lg -rotate-12">
          <Sparkle className="w-5 h-5 text-primary-900" weight="fill" />
        </div>
      </div>
      
      <div className="max-w-md space-y-4">
        <h3 className="text-3xl font-display font-bold text-neutral-900 tracking-tight">
          {title}
        </h3>
        <p className="text-lg text-neutral-500 font-light leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-8">
          <Button
            size="lg"
            onClick={onAction}
            className="rounded-full px-8 py-6 shadow-xl shadow-primary-900/10 hover:scale-105 transition-all duration-300"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
