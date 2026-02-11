"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  onClick,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary-900 hover:bg-primary-800 text-white shadow-soft hover:shadow-soft-lg focus:ring-primary-500",
    secondary:
      "bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 shadow-soft hover:shadow-soft-lg focus:ring-primary-500",
    ghost:
      "hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 focus:ring-primary-500",
    destructive:
      "bg-destructive-600 hover:bg-destructive-700 text-white shadow-soft hover:shadow-soft-lg focus:ring-destructive-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "w-10 h-10",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="mr-2">
          <div className="w-4 h-4 rounded-md bg-white/20 flex items-center justify-center animate-pulse relative">
            <div className="absolute inset-0 border-2 border-white/20 border-t-white rounded-md animate-spin" />
            <span className="text-[6px] font-bold">M</span>
          </div>
        </div>
      )}
      {children}
    </button>
  );
};

export default Button;
