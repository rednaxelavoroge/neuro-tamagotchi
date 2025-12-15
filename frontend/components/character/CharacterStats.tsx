"use client";

import { motion } from "framer-motion";
import { Zap, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterStatsProps {
  energy: number;
  mood: number;
  bond: number;
  showLabels?: boolean;
  compact?: boolean;
  className?: string;
}

export function CharacterStats({
  energy,
  mood,
  bond,
  showLabels = true,
  compact = false,
  className,
}: CharacterStatsProps) {
  const stats = [
    {
      key: "energy",
      label: "Energy",
      value: energy,
      max: 100,
      icon: Zap,
      gradient: "from-yellow-400 to-orange-500",
      iconColor: "text-yellow-400",
    },
    {
      key: "mood",
      label: "Mood",
      value: mood,
      max: 100,
      icon: Heart,
      gradient: "from-pink-400 to-red-500",
      iconColor: "text-pink-400",
    },
    {
      key: "bond",
      label: "Bond",
      value: Math.min(bond, 100),
      max: 100,
      icon: Sparkles,
      gradient: "from-purple-400 to-indigo-500",
      iconColor: "text-purple-400",
      displayValue: bond,
    },
  ];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {stats.map((stat) => (
          <div key={stat.key} className="flex items-center gap-1.5">
            <stat.icon className={cn("w-4 h-4", stat.iconColor)} />
            <span className="text-sm font-medium text-[#F8FAFC]">
              {stat.displayValue ?? stat.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {stats.map((stat) => (
        <div key={stat.key} className="flex items-center gap-3">
          <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
          <div className="flex-1">
            {showLabels && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#94A3B8]">{stat.label}</span>
                <span className="text-[#F8FAFC]">
                  {stat.displayValue ?? stat.value}
                  {stat.max && stat.displayValue === undefined && "%"}
                </span>
              </div>
            )}
            <div className="h-2 bg-[#334155] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn("h-full rounded-full bg-gradient-to-r", stat.gradient)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CharacterStats;
