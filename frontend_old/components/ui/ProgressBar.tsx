"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient" | "success" | "warning" | "danger";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

const variantClasses = {
  default: "bg-[#6D28D9]",
  gradient: "bg-gradient-to-r from-[#6D28D9] to-[#10B981]",
  success: "bg-[#10B981]",
  warning: "bg-[#F59E0B]",
  danger: "bg-[#EF4444]",
};

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span className="text-[#94A3B8]">{label}</span>}
          {showLabel && <span className="text-[#F8FAFC]">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-[#334155] rounded-full overflow-hidden", sizeClasses[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", variantClasses[variant])}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
