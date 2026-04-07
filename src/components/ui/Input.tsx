"use client";
import React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  require?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  className,
  id,
  require,
  value,
  ...props
}) => {
  const inputId = id;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400",
          "focus:ring-primary-500 focus:border-transparent focus:ring-2 focus:outline-none",
          "transition-all duration-200",
          error && "border-destructive-500 focus:ring-destructive-500",
          className,
        )}
        value={value}
        {...props}
        {...(require ? { required: true } : {})}
      />
      {error && <p className="text-destructive-600 text-sm">{error}</p>}
      {helper && !error && <p className="text-sm text-neutral-500">{helper}</p>}
    </div>
  );
};

export default Input;
