"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClasses = {
  default: "bg-[#1E293B] border border-[#334155]",
  glass: "bg-[#1E293B]/50 backdrop-blur-xl border border-[#334155]/50",
  outlined: "bg-transparent border-2 border-[#334155]",
};

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl",
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
