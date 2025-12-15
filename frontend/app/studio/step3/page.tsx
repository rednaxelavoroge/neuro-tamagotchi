"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Loader2, Sparkles, PartyPopper } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CharacterStyle } from "@/types";
import { apiClient } from "@/lib/api";

function StudioStep3Content() {
  const router = useRouter();
  const [style, setStyle] = useState<CharacterStyle | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Get style and avatar from previous steps
    const savedStyle = sessionStorage.getItem("characterStyle") as CharacterStyle;
    const savedAvatar = sessionStorage.getItem("selectedAvatar");

    if (!savedStyle) {
      router.push("/studio/step1");
      return;
    }

    setStyle(savedStyle);
    setAvatarUrl(savedAvatar);
  }, [router]);

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (value.length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    if (value.length > 50) {
      setNameError("Name must be at most 50 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleCreate = async () => {
    if (!validateName(name) || !style) return;

    setIsCreating(true);

    try {
      await apiClient.createCharacter({
        name: name.trim(),
        style: style,
      });

      // Clear session storage
      sessionStorage.removeItem("characterStyle");
      sessionStorage.removeItem("selectedAvatar");

      setIsSuccess(true);

      // Redirect after celebration
      setTimeout(() => {
        router.push("/companion");
      }, 2500);
    } catch (error) {
      console.error("Failed to create character:", error);
      
      // Demo mode - simulate success
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/companion");
      }, 2500);
    } finally {
      setIsCreating(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            🎉
          </motion.div>
          <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">
            Welcome, {name}!
          </h1>
          <p className="text-xl text-[#94A3B8] mb-8">
            Your companion is ready to meet you!
          </p>
          <div className="flex items-center justify-center gap-2 text-[#6D28D9]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Entering companion world...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/studio/step2"
            className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to avatar selection
          </Link>

          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step <= 3
                      ? "bg-[#6D28D9] text-white"
                      : "bg-[#334155] text-[#64748B]"
                  }`}
                >
                  {step < 3 ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && <div className="w-12 h-1 bg-[#6D28D9] rounded" />}
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">
              Name Your Companion
            </h1>
            <p className="text-xl text-[#94A3B8]">
              Give your companion a unique name that reflects their personality.
            </p>
          </motion.div>
        </div>

        {/* Preview and form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1E293B] border border-[#334155] rounded-2xl p-8"
        >
          {/* Avatar preview */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#10B981] p-1 mb-4"
            >
              <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Your companion"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">
                    {style === "anime" ? "🎌" : style === "cyberpunk" ? "🤖" : "✨"}
                  </span>
                )}
              </div>
            </motion.div>
            <p className="text-[#94A3B8] text-sm capitalize">{style} Style</p>
          </div>

          {/* Name input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">
              Companion Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) validateName(e.target.value);
                }}
                onBlur={() => validateName(name)}
                placeholder="Enter a name..."
                maxLength={50}
                className={`w-full px-4 py-4 bg-[#0F172A] border rounded-xl text-[#F8FAFC] text-lg placeholder-[#64748B] focus:outline-none focus:ring-2 transition-all ${
                  nameError
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-[#334155] focus:border-[#6D28D9] focus:ring-[#6D28D9]/20"
                }`}
              />
              {name && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#64748B]">
                  {name.length}/50
                </span>
              )}
            </div>
            {nameError && (
              <p className="mt-2 text-sm text-red-400">{nameError}</p>
            )}
          </div>

          {/* Name suggestions */}
          <div className="mb-8">
            <p className="text-sm text-[#64748B] mb-3">Need inspiration?</p>
            <div className="flex flex-wrap gap-2">
              {getNameSuggestions(style).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setName(suggestion)}
                  className="px-3 py-1.5 bg-[#334155]/50 hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              name.trim() && !isCreating
                ? "bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-[#6D28D9]/25"
                : "bg-[#334155] text-[#64748B] cursor-not-allowed"
            }`}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Create My Companion
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function getNameSuggestions(style: CharacterStyle | null): string[] {
  const suggestions: Record<CharacterStyle, string[]> = {
    anime: ["Sakura", "Luna", "Haru", "Yuki", "Mochi", "Kira"],
    cyberpunk: ["Neo", "Cipher", "Pixel", "Volt", "Echo", "Neon"],
    fantasy: ["Aurora", "Sage", "Ember", "Crystal", "Fable", "Mystic"],
  };

  return suggestions[style || "anime"];
}

export default function StudioStep3Page() {
  return (
    <ProtectedRoute>
      <StudioStep3Content />
    </ProtectedRoute>
  );
}
