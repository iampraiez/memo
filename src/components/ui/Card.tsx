"use client";
import React from "react";
import { cn } from "../../lib/utils";
import Link from "next/link";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
  href?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = "md",
  onClick,
  href,
}) => {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const classes = cn(
    "shadow-soft relative rounded-xl border border-neutral-200 bg-white",
    hover && "hover:shadow-soft-lg transition-shadow duration-200",
    paddingStyles[padding],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn("block", classes)} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
