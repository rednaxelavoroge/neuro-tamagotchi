"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CharacterAvatarProps {
  name: string;
  style: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  status?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

const emojiByStyle: Record<string, string> = {
  anime: "🎌",
  cyberpunk: "🤖",
  fantasy: "✨",
};

const statusColors: Record<string, string> = {
  happy: "bg-[#10B981]",
  normal: "bg-[#3B82F6]",
  bored: "bg-[#F59E0B]",
  tired: "bg-[#F97316]",
  sad: "bg-[#8B5CF6]",
  exhausted: "bg-[#EF4444]",
};

export function CharacterAvatar({
  name,
  style,
  avatarUrl,
  size = "md",
  showStatus = false,
  status = "normal",
  className,
}: CharacterAvatarProps) {
  const emoji = emojiByStyle[style] || "✨";
  const statusColor = statusColors[status] || statusColors.normal;

  return (
    <div className={cn("relative", className)}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={cn(
          sizeClasses[size],
          "rounded-full bg-gradient-to-br from-[#6D28D9] to-[#10B981] p-0.5"
        )}
      >
        <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "block",
                size === "sm" && "text-lg",
                size === "md" && "text-2xl",
                size === "lg" && "text-4xl",
                size === "xl" && "text-5xl"
              )}
            >
              {emoji}
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Status indicator */}
      {showStatus && (
        <div
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-[#1E293B]",
            statusColor,
            size === "sm" && "w-3 h-3",
            size === "md" && "w-4 h-4",
            size === "lg" && "w-5 h-5",
            size === "xl" && "w-6 h-6"
          )}
        />
      )}
    </div>
  );
}

export default CharacterAvatar;
