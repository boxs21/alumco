"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-forest text-white hover:bg-forest-mid active:bg-forest-light",
  secondary:
    "bg-white text-forest border border-border hover:bg-surface active:bg-teal-light",
  ghost:
    "bg-transparent text-forest hover:bg-surface active:bg-teal-light",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg px-5 py-3
        font-sans text-base font-medium leading-tight
        min-h-[44px]
        transition-colors duration-150
        cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
