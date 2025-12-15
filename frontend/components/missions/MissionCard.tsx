"use client";

import { motion } from "framer-motion";
import { Clock, Coins, Utensils, Scissors, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Mission } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface MissionCardProps {
  mission: Mission;
  onExecute: () => void;
  userBalance: number;
  isLoading?: boolean;
  onCooldown?: boolean;
  cooldownTime?: number;
}

const missionIcons: Record<string, React.ReactNode> = {
  feed: <Utensils className="w-5 h-5" />,
  hairstyle: <Scissors className="w-5 h-5" />,
  selfie: <Camera className="w-5 h-5" />,
};

const missionColors: Record<string, { bg: string; text: string; border: string }> = {
  feed: {
    bg: "bg-[#10B981]/10",
    text: "text-[#10B981]",
    border: "border-[#10B981]/30",
  },
  hairstyle: {
    bg: "bg-[#6D28D9]/10",
    text: "text-[#A78BFA]",
    border: "border-[#6D28D9]/30",
  },
  selfie: {
    bg: "bg-[#F59E0B]/10",
    text: "text-[#F59E0B]",
    border: "border-[#F59E0B]/30",
  },
};

export function MissionCard({
  mission,
  onExecute,
  userBalance,
  isLoading = false,
  onCooldown = false,
  cooldownTime = 0,
}: MissionCardProps) {
  const icon = missionIcons[mission.type] || <Utensils className="w-5 h-5" />;
  const colors = missionColors[mission.type] || missionColors.feed;
  const canAfford = userBalance >= mission.cost_ntg;
  const canExecute = canAfford && !onCooldown && mission.is_active;

  const formatCooldown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "p-5 rounded-xl border transition-all",
        "bg-[#1E293B] border-[#334155]",
        !canExecute && "opacity-60"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center border",
              colors.bg,
              colors.text,
              colors.border
            )}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-[#F8FAFC]">{mission.name}</h3>
            <Badge variant="default" size="sm" className="mt-1">
              {mission.type}
            </Badge>
          </div>
        </div>
        <div className={cn("flex items-center gap-1", colors.text)}>
          <Coins className="w-4 h-4" />
          <span className="font-medium">{mission.cost_ntg}</span>
        </div>
      </div>

      {/* Description */}
      {mission.description && (
        <p className="text-sm text-[#94A3B8] mb-4">{mission.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#64748B] text-sm">
          <Clock className="w-4 h-4" />
          <span>{mission.cooldown_minutes}m cooldown</span>
        </div>

        {onCooldown ? (
          <div className="text-[#F59E0B] text-sm font-medium">
            ⏱️ {formatCooldown(cooldownTime)}
          </div>
        ) : (
          <Button
            onClick={onExecute}
            disabled={!canExecute}
            isLoading={isLoading}
            size="sm"
            variant={canAfford ? "primary" : "secondary"}
          >
            {canAfford ? "Execute" : "Insufficient NTG"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default MissionCard;
