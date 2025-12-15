"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
  MessageCircle,
  Palette,
  Trophy,
  Coins,
  ArrowRight,
  Heart,
  Zap,
  Star,
} from "lucide-react";

/**
 * Landing page for NeuroTamagotchi.
 * 
 * Features:
 * - Hero section with animated character
 * - Feature highlights
 * - Call to action buttons
 */
export default function LandingPage() {
  const features = [
    {
      icon: Bot,
      title: "AI Companion",
      description: "Create your unique virtual companion with distinct personality and style.",
      color: "text-[#6D28D9]",
      bg: "bg-[#6D28D9]/10",
    },
    {
      icon: MessageCircle,
      title: "Chat & Bond",
      description: "Have meaningful conversations and build a strong connection over time.",
      color: "text-[#10B981]",
      bg: "bg-[#10B981]/10",
    },
    {
      icon: Palette,
      title: "Style & Customize",
      description: "Choose from anime, cyberpunk, or fantasy styles. Make it truly yours.",
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10",
    },
    {
      icon: Trophy,
      title: "Complete Missions",
      description: "Feed, style, and care for your companion. Earn rewards and level up.",
      color: "text-[#EC4899]",
      bg: "bg-[#EC4899]/10",
    },
  ];

  const stats = [
    { value: "10K+", label: "Happy Companions" },
    { value: "1M+", label: "Messages Sent" },
    { value: "50K+", label: "Missions Completed" },
    { value: "4.9", label: "User Rating" },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-[#334155]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D28D9] to-[#10B981] flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#F8FAFC]">
                Neuro<span className="text-[#6D28D9]">Tamagotchi</span>
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-40 left-10 w-72 h-72 bg-[#6D28D9]/20 rounded-full blur-3xl" />
          <div className="absolute top-60 right-10 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-[#EC4899]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#6D28D9]/20 border border-[#6D28D9]/30 rounded-full text-[#A78BFA] text-sm mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Your AI companion awaits
              </motion.div>

              <h1 className="text-5xl lg:text-6xl font-bold text-[#F8FAFC] mb-6 leading-tight">
                Meet Your
                <span className="block bg-gradient-to-r from-[#6D28D9] to-[#10B981] bg-clip-text text-transparent">
                  AI Companion
                </span>
              </h1>

              <p className="text-xl text-[#94A3B8] mb-8 max-w-lg">
                Create, nurture, and bond with your unique virtual pet. 
                Chat, play, and grow together in this next-gen tamagotchi experience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#6D28D9]/25"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#features"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] font-semibold rounded-xl border border-[#334155] transition-all"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>

            {/* Right: Animated character */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#6D28D9] to-[#10B981] rounded-full blur-3xl opacity-30 scale-75" />
                
                {/* Character container */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-80 h-80 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#10B981] p-1"
                >
                  <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center">
                    <span className="text-[150px]">🐱</span>
                  </div>
                </motion.div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-[#EC4899]/20 rounded-2xl flex items-center justify-center border border-[#EC4899]/30"
                >
                  <Heart className="w-8 h-8 text-[#EC4899]" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#F59E0B]/20 rounded-2xl flex items-center justify-center border border-[#F59E0B]/30"
                >
                  <Zap className="w-8 h-8 text-[#F59E0B]" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-1/2 -right-8 w-12 h-12 bg-[#10B981]/20 rounded-xl flex items-center justify-center border border-[#10B981]/30"
                >
                  <Star className="w-6 h-6 text-[#10B981]" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-[#334155]/50 bg-[#1E293B]/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-[#F8FAFC] mb-1">
                  {stat.value}
                </div>
                <div className="text-[#94A3B8]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#F8FAFC] mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto">
              A complete companion experience with all the features you love.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-[#1E293B] border border-[#334155] rounded-2xl hover:border-[#6D28D9]/50 transition-colors group"
              >
                <div
                  className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#94A3B8]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 bg-gradient-to-r from-[#6D28D9]/20 to-[#10B981]/20 border border-[#6D28D9]/30 rounded-3xl text-center overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6D28D9]/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Coins className="w-6 h-6 text-[#F59E0B]" />
                <span className="text-[#F59E0B] font-medium">
                  Start with 100 FREE NTG tokens!
                </span>
              </div>

              <h2 className="text-4xl font-bold text-[#F8FAFC] mb-4">
                Ready to Meet Your Companion?
              </h2>
              <p className="text-xl text-[#94A3B8] mb-8 max-w-2xl mx-auto">
                Create your account now and start building an amazing bond with your AI companion.
              </p>

              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#6D28D9]/25"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#334155]/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#10B981] flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-[#F8FAFC]">NeuroTamagotchi</span>
            </div>
            <p className="text-[#64748B] text-sm">
              © 2024 NeuroTamagotchi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
