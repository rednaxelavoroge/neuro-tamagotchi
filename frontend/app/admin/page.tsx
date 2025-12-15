"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Coins,
  Bot,
  Settings,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  RefreshCw,
  Trash2,
  Plus,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { Button, Card } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { Character } from "@/types";

function AdminPageContent() {
  const { user, logout, refreshUser } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const chars = await apiClient.getCharacters();
      setCharacters(chars);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!confirm("Are you sure you want to delete this character? This action cannot be undone.")) {
      return;
    }

    try {
      await apiClient.deleteCharacter(characterId);
      setCharacters((prev) => prev.filter((c) => c.id !== characterId));
    } catch (error) {
      console.error("Failed to delete character:", error);
      alert("Failed to delete character");
    }
  };

  const menuItems = [
    { id: "profile", icon: User, label: "Profile" },
    { id: "characters", icon: Bot, label: "My Characters" },
    { id: "billing", icon: Coins, label: "Billing & NTG" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "security", icon: Shield, label: "Security" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="bg-[#1E293B]/80 backdrop-blur-xl border-b border-[#334155]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/companion"
              className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Companion
            </Link>
            <h1 className="text-xl font-bold text-[#F8FAFC]">Settings</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeSection === item.id
                    ? "bg-[#6D28D9] text-white"
                    : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#334155]/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}

            <hr className="border-[#334155] my-4" />

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </aside>

          {/* Main content */}
          <main className="space-y-6">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-[#F8FAFC] mb-6">Profile</h2>

                <Card className="bg-[#1E293B] border-[#334155] p-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#10B981] flex items-center justify-center text-3xl font-bold text-white">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#F8FAFC]">
                        {user?.username}
                      </h3>
                      <p className="text-[#94A3B8]">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={user?.username || ""}
                        readOnly
                        className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-[#F8FAFC]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        readOnly
                        className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl text-[#F8FAFC]"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Characters Section */}
            {activeSection === "characters" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#F8FAFC]">My Characters</h2>
                  <Link href="/studio/step1">
                    <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      Create New
                    </Button>
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-[#6D28D9] animate-spin" />
                  </div>
                ) : characters.length === 0 ? (
                  <Card className="bg-[#1E293B] border-[#334155] p-8 text-center">
                    <Bot className="w-12 h-12 mx-auto text-[#64748B] mb-4" />
                    <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">
                      No Characters Yet
                    </h3>
                    <p className="text-[#94A3B8] mb-6">
                      Create your first AI companion to get started!
                    </p>
                    <Link href="/studio/step1">
                      <Button variant="primary">Create Character</Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {characters.map((character) => (
                      <Card
                        key={character.id}
                        className="bg-[#1E293B] border-[#334155] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#10B981] flex items-center justify-center">
                              <span className="text-2xl">
                                {character.style === "anime"
                                  ? "🎌"
                                  : character.style === "cyberpunk"
                                  ? "🤖"
                                  : "✨"}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-[#F8FAFC]">
                                {character.name}
                              </h3>
                              <p className="text-sm text-[#94A3B8] capitalize">
                                {character.style} Style
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href="/companion">
                              <Button variant="secondary" size="sm">
                                Chat
                              </Button>
                            </Link>
                            <button
                              onClick={() => handleDeleteCharacter(character.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Billing Section */}
            {activeSection === "billing" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-[#F8FAFC] mb-6">
                  Billing & NTG
                </h2>

                {/* Current Balance */}
                <Card className="bg-gradient-to-r from-[#6D28D9]/20 to-[#10B981]/20 border-[#6D28D9]/30 p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#94A3B8] mb-1">Current Balance</p>
                      <p className="text-4xl font-bold text-[#F8FAFC]">
                        {user?.balance_ntg || 0}{" "}
                        <span className="text-xl text-[#A78BFA]">NTG</span>
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      leftIcon={<Coins className="w-5 h-5" />}
                    >
                      Buy More
                    </Button>
                  </div>
                </Card>

                {/* NTG Packages */}
                <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">
                  Token Packages
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { usd: 0.99, ntg: 100, bonus: 0 },
                    { usd: 4.99, ntg: 550, bonus: 50 },
                    { usd: 9.99, ntg: 1200, bonus: 200 },
                  ].map((pkg) => (
                    <Card
                      key={pkg.usd}
                      className="bg-[#1E293B] border-[#334155] p-4 text-center hover:border-[#6D28D9]/50 transition-colors cursor-pointer"
                    >
                      <p className="text-3xl font-bold text-[#F8FAFC] mb-1">
                        {pkg.ntg} NTG
                      </p>
                      {pkg.bonus > 0 && (
                        <p className="text-sm text-[#10B981] mb-2">
                          +{pkg.bonus} bonus
                        </p>
                      )}
                      <p className="text-xl text-[#A78BFA]">${pkg.usd}</p>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Other sections */}
            {["notifications", "security", "settings"].includes(activeSection) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-bold text-[#F8FAFC] mb-6 capitalize">
                  {activeSection}
                </h2>
                <Card className="bg-[#1E293B] border-[#334155] p-8 text-center">
                  <Settings className="w-12 h-12 mx-auto text-[#64748B] mb-4" />
                  <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-[#94A3B8]">
                    This section is under development.
                  </p>
                </Card>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminPageContent />
    </ProtectedRoute>
  );
}
