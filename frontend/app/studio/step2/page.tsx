"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw, Check, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CharacterStyle } from "@/types";
import { apiClient } from "@/lib/api";

function StudioStep2Content() {
  const router = useRouter();
  const [style, setStyle] = useState<CharacterStyle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

  useEffect(() => {
    // Get style from previous step
    const savedStyle = sessionStorage.getItem("characterStyle") as CharacterStyle;
    if (!savedStyle) {
      router.push("/studio/step1");
      return;
    }
    setStyle(savedStyle);
    generateAvatars(savedStyle);
  }, [router]);

  const generateAvatars = async (characterStyle: CharacterStyle) => {
    setIsGenerating(true);
    setSelectedAvatar(null);

    try {
      // In demo mode, use placeholder images
      const placeholders = getPlaceholderAvatars(characterStyle);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setAvatars(placeholders);
    } catch (error) {
      console.error("Failed to generate avatars:", error);
      setAvatars(getPlaceholderAvatars(characterStyle || "anime"));
    } finally {
      setIsGenerating(false);
    }
  };

  const getPlaceholderAvatars = (characterStyle: CharacterStyle): string[] => {
    const colors: Record<CharacterStyle, string[]> = {
      anime: ["ff6b9d", "c084fc", "67e8f9", "fbbf24"],
      cyberpunk: ["22d3ee", "a855f7", "f472b6", "84cc16"],
      fantasy: ["a78bfa", "f472b6", "34d399", "fcd34d"],
    };

    const styleColors = colors[characterStyle] || colors.anime;
    return styleColors.map(
      (color, i) =>
        `https://via.placeholder.com/256x256/${color}/ffffff?text=${characterStyle}+${i + 1}`
    );
  };

  const handleContinue = () => {
    if (selectedAvatar !== null) {
      sessionStorage.setItem("selectedAvatar", avatars[selectedAvatar]);
      router.push("/studio/step3");
    }
  };

  const handleRegenerate = () => {
    if (style) {
      generateAvatars(style);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/studio/step1"
            className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to style selection
          </Link>

          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step <= 2
                      ? "bg-[#6D28D9] text-white"
                      : "bg-[#334155] text-[#64748B]"
                  }`}
                >
                  {step < 2 ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 rounded ${
                      step < 2 ? "bg-[#6D28D9]" : "bg-[#334155]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">
              Choose Your Avatar
            </h1>
            <p className="text-xl text-[#94A3B8]">
              Select the appearance that speaks to you, or generate new options.
            </p>
          </motion.div>
        </div>

        {/* Avatar grid */}
        <div className="mb-8">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-12 h-12 text-[#6D28D9]" />
              </motion.div>
              <p className="mt-4 text-[#94A3B8]">Generating avatars...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {avatars.map((avatar, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedAvatar(index)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedAvatar === index
                      ? "border-[#6D28D9] ring-4 ring-[#6D28D9]/30"
                      : "border-[#334155] hover:border-[#6D28D9]/50"
                  }`}
                >
                  <img
                    src={avatar}
                    alt={`Avatar option ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Selection overlay */}
                  {selectedAvatar === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-[#6D28D9]/30 flex items-center justify-center"
                    >
                      <div className="w-12 h-12 bg-[#6D28D9] rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] rounded-xl border border-[#334155] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`} />
            Generate New
          </button>

          <button
            onClick={handleContinue}
            disabled={selectedAvatar === null || isGenerating}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
              selectedAvatar !== null && !isGenerating
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

export default function StudioStep2Page() {
  return (
    <ProtectedRoute>
      <StudioStep2Content />
    </ProtectedRoute>
  );
}
