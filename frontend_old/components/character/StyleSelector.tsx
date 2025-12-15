"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CharacterStyle } from "@/types";

interface StyleOption {
  id: CharacterStyle;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  features: string[];
}

const styleOptions: StyleOption[] = [
  {
    id: "anime",
    name: "Anime",
    description: "Vibrant and expressive with big eyes and dynamic expressions.",
    emoji: "🎌",
    gradient: "from-pink-500 to-purple-600",
    features: ["Big expressive eyes", "Vibrant colors", "Cel-shaded art"],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic and edgy with neon accents and tech aesthetics.",
    emoji: "🤖",
    gradient: "from-cyan-500 to-blue-600",
    features: ["Neon glow effects", "High-tech accessories", "Digital patterns"],
  },
  {
    id: "fantasy",
    name: "Fantasy",
    description: "Magical and ethereal with mystical elements and soft lighting.",
    emoji: "✨",
    gradient: "from-purple-500 to-indigo-600",
    features: ["Magical aura", "Ethereal glow", "Fantasy elements"],
  },
];

interface StyleSelectorProps {
  value?: CharacterStyle | null;
  onChange?: (style: CharacterStyle) => void;
  className?: string;
}

/**
 * Style selector component for character creation.
 * Displays available styles with visual preview and features.
 */
export function StyleSelector({ value, onChange, className }: StyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<CharacterStyle | null>(value || null);

  const handleSelect = (style: CharacterStyle) => {
    setSelectedStyle(style);
    onChange?.(style);
  };

  return (
    <div className={cn("grid md:grid-cols-3 gap-6", className)}>
      {styleOptions.map((style, index) => (
        <motion.button
          key={style.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => handleSelect(style.id)}
          className={cn(
            "relative p-6 rounded-2xl border-2 text-left transition-all",
            selectedStyle === style.id
              ? "border-[#6D28D9] bg-[#6D28D9]/10"
              : "border-[#334155] bg-[#1E293B] hover:border-[#6D28D9]/50"
          )}
        >
          {/* Selection indicator */}
          {selectedStyle === style.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 w-6 h-6 bg-[#6D28D9] rounded-full flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          )}

          {/* Emoji */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={cn(
              "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
              style.gradient
            )}
          >
            <span className="text-4xl">{style.emoji}</span>
          </motion.div>

          {/* Content */}
          <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">
            {style.name}
          </h3>
          <p className="text-[#94A3B8] mb-4">{style.description}</p>

          {/* Features */}
          <ul className="space-y-2">
            {style.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-[#64748B]"
              >
                <Sparkles className="w-3 h-3 text-[#6D28D9]" />
                {feature}
              </li>
            ))}
          </ul>
        </motion.button>
      ))}
    </div>
  );
}

export default StyleSelector;
