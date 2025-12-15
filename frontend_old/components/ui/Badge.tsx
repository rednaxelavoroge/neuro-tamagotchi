"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantClasses = {
  default: "bg-[#334155] text-[#94A3B8]",
  primary: "bg-[#6D28D9]/20 text-[#A78BFA] border border-[#6D28D9]/30",
  secondary: "bg-[#1E293B] text-[#F8FAFC] border border-[#334155]",
  success: "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30",
  warning: "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30",
  danger: "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
