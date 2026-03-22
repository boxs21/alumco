"use client";

import { ReactNode } from "react";

type BadgeVariant = "green" | "teal" | "gold" | "gray" | "sede-concepcion" | "sede-coyhaique";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: "bg-forest-light/15 text-forest-light",
  teal: "bg-teal-light text-teal",
  gold: "bg-[#fdf3e3] text-gold",
  gray: "bg-[#e4ede9] text-muted",
  "sede-concepcion": "bg-teal-light text-teal",
  "sede-coyhaique": "bg-[#fdf3e3] text-gold",
};

export default function Badge({
  variant = "gray",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        rounded-full px-3 py-1
        text-sm font-medium leading-tight
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
