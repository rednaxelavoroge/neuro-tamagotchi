"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, type = "text", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "w-full py-3 bg-[#1E293B] border rounded-xl text-[#F8FAFC] placeholder-[#64748B]",
              "focus:outline-none focus:ring-2 transition-all",
              leftIcon ? "pl-12" : "pl-4",
              rightIcon ? "pr-12" : "pr-4",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-[#334155] focus:border-[#6D28D9] focus:ring-[#6D28D9]/20",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="mt-2 text-sm text-[#64748B]">{hint}</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
