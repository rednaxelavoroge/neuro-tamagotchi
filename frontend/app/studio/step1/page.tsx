"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Bot, Sparkles, Check } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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

function StudioStep1Content() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<CharacterStyle | null>(null);

  const handleContinue = () => {
    if (selectedStyle) {
      // Store selection in sessionStorage for next step
      sessionStorage.setItem("characterStyle", selectedStyle);
      router.push("/studio/step2");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === 1
                      ? "bg-[#6D28D9] text-white"
                      : "bg-[#334155] text-[#64748B]"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && <div className="w-12 h-1 bg-[#334155] rounded" />}
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">
              Choose Your Style
            </h1>
            <p className="text-xl text-[#94A3B8]">
              Select the visual style that best represents your companion.
            </p>
          </motion.div>
        </div>

        {/* Style options */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {styleOptions.map((style, index) => (
            <motion.button
              key={style.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedStyle(style.id)}
              className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                selectedStyle === style.id
                  ? "border-[#6D28D9] bg-[#6D28D9]/10"
                  : "border-[#334155] bg-[#1E293B] hover:border-[#6D28D9]/50"
              }`}
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
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center mb-4`}
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

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <button
            onClick={handleContinue}
            disabled={!selectedStyle}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
              selectedStyle
                ? "bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-[#6D28D9]/25"
                : "bg-[#334155] text-[#64748B] cursor-not-allowed"
            }`}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default function StudioStep1Page() {
  return (
    <ProtectedRoute>
      <StudioStep1Content />
    </ProtectedRoute>
  );
}
