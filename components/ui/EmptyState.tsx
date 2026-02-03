"use client";

import React from 'react';
import { Calendar, Plus, Sparkle } from '@phosphor-icons/react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          {icon || <Calendar className="w-10 h-10 text-primary-600" weight="duotone" />}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-neutral-900">
            {title}
          </h3>
          <p className="text-neutral-600 leading-relaxed">
            {description}
          </p>
        </div>

        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {actionLabel && onAction && (
              <Button
                onClick={onAction}
                className="inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" weight="bold" />
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button
                variant="secondary"
                onClick={onSecondaryAction}
                className="inline-flex items-center"
              >
                <Sparkle className="w-4 h-4 mr-2" weight="duotone" />
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
