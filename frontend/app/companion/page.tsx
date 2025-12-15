"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  Zap,
  Star,
  Trophy,
  MessageCircle,
  Coins,
  Sparkles,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { Button, Card, Spinner } from "@/components/ui";
import { CharacterAvatar } from "@/components/character/CharacterAvatar";
import { CharacterStats } from "@/components/character/CharacterStats";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { MissionCard } from "@/components/missions/MissionCard";
import { apiClient } from "@/lib/api";
import { Character, ChatMessage as ChatMessageType, Mission } from "@/types";
import { cn } from "@/lib/utils";

function CompanionPageContent() {
  const { user, logout, updateBalance } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "missions">("chat");
  const [lastInteraction, setLastInteraction] = useState<Date | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [characters, missionsData] = await Promise.all([
        apiClient.getCharacters(),
        apiClient.getMissions(),
      ]);

      if (characters.length > 0) {
        setCharacter(characters[0]);
        const history = await apiClient.getChatHistory(characters[0].id);
        setMessages(history.items || []);
      }
      setMissions(missionsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      // Demo data for preview
      setCharacter({
        id: "demo",
        user_id: "user",
        name: "Luna",
        style: "anime",
        avatar_url: null,
        inworld_agent_id: null,
        inworld_scene_id: null,
        params: {
          energy: 85,
          mood: 90,
          bond: 42,
        },
        status: "happy",
        created_at: new Date().toISOString(),
      });
      setMessages([
        {
          id: "1",
          character_id: "demo",
          role: "assistant",
          content: "Hi there! 👋 I'm so happy to see you! How are you doing today?",
          emotion: "happy",
          created_at: new Date().toISOString(),
        },
      ]);
      setMissions([
        {
          id: "1",
          name: "Покорми питомца",
          description: "Накорми своего питомца вкусной едой",
          cost_ntg: 50,
          type: "feed",
          cooldown_seconds: 3600,
          cooldown_minutes: 60,
          is_active: true,
        },
        {
          id: "2",
          name: "Смени прическу",
          description: "Измени внешний вид своего питомца",
          cost_ntg: 150,
          type: "hairstyle",
          cooldown_seconds: 7200,
          cooldown_minutes: 120,
          is_active: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!character || isSending) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      character_id: character.id,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);
    setIsTyping(true);
    setLastInteraction(new Date());

    try {
      const response = await apiClient.sendMessage(character.id, { content, session_id: sessionId || undefined });
      setMessages((prev) => [...prev, response.message]);
      
      // Store session ID for continuity
      if (response.message) {
        setSessionId(response.message.id.split('_')[0] || sessionId);
      }
      
      // Update character params based on the param_changes
      if (response.character_reaction?.param_changes) {
        setCharacter((prev) => {
          if (!prev) return null;
          const changes = response.character_reaction?.param_changes || {};
          return {
            ...prev,
            params: {
              energy: Math.max(0, Math.min(100, prev.params.energy + (changes.energy || 0))),
              mood: Math.max(0, Math.min(100, prev.params.mood + (changes.mood || 0))),
              bond: Math.max(0, prev.params.bond + (changes.bond || 0)),
            },
          };
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Demo response with proper param updates
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const demoResponse: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        character_id: character.id,
        role: "assistant",
        content: getRandomResponse(),
        emotion: "happy",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, demoResponse]);
      
      // Apply demo param changes (energy -1, mood +2 for positive)
      setCharacter((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          params: {
            energy: Math.max(0, prev.params.energy - 1),
            mood: Math.min(100, prev.params.mood + 2),
            bond: prev.params.bond + (messages.length % 10 === 0 ? 1 : 0),
          },
        };
      });
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleExecuteMission = async (mission: Mission) => {
    if (!character || !user) return;

    if (user.balance_ntg < mission.cost_ntg) {
      alert("Insufficient NTG balance!");
      return;
    }

    try {
      const result = await apiClient.executeMission(mission.id, {
        character_id: character.id,
      });

      if (result.success) {
        updateBalance(result.new_balance);
        if (result.character_params) {
          setCharacter((prev) => prev ? {
            ...prev,
            params: result.character_params!,
          } : null);
        }
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to execute mission:", error);
      alert(error instanceof Error ? error.message : "Mission failed");
    }
  };

  const getRandomResponse = (): string => {
    const responses = [
      "That's really interesting! Tell me more about that! 😊",
      "I love hearing from you! You always make my day better! ✨",
      "Hmm, let me think about that... I think you're absolutely right!",
      "Oh wow! That's amazing! I'm so happy you shared that with me! 💕",
      "You know what? You're pretty awesome. Just thought I'd say that! 🌟",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-[#94A3B8]">Loading your companion...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Card className="max-w-md text-center bg-[#1E293B] border-[#334155]">
          <Bot className="w-16 h-16 mx-auto text-[#64748B] mb-4" />
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">No Companion Yet</h2>
          <p className="text-[#94A3B8] mb-6">
            Create your first AI companion to get started!
          </p>
          <Link href="/studio/step1">
            <Button variant="primary">Create Companion</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-[#1E293B] border-r border-[#334155] z-50 lg:hidden overflow-y-auto"
            >
              <SidebarContent
                character={character}
                user={user}
                onClose={() => setSidebarOpen(false)}
                onLogout={logout}
                lastInteraction={lastInteraction}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 bg-[#1E293B] border-r border-[#334155] overflow-y-auto">
        <SidebarContent character={character} user={user} onLogout={logout} lastInteraction={lastInteraction} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <header className="bg-[#1E293B]/80 backdrop-blur-xl border-b border-[#334155] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-[#94A3B8] hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#10B981] flex items-center justify-center text-white font-semibold">
                  {character.name[0]}
                </div>
                <div>
                  <h1 className="font-semibold text-[#F8FAFC]">{character.name}</h1>
                  <p className="text-xs text-[#10B981]">● Online</p>
                </div>
              </div>
            </div>

            {/* Balance and Tab buttons */}
            <div className="flex items-center gap-4">
              {/* Balance */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#6D28D9]/20 border border-[#6D28D9]/30 rounded-lg">
                <Coins className="w-4 h-4 text-[#A78BFA]" />
                <span className="text-sm font-medium text-[#A78BFA]">
                  {user?.balance_ntg || 0} NTG
                </span>
              </div>

              {/* Tab buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    activeTab === "chat"
                      ? "bg-[#6D28D9] text-white"
                      : "text-[#94A3B8] hover:text-white"
                  )}
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveTab("missions")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    activeTab === "missions"
                      ? "bg-[#6D28D9] text-white"
                      : "text-[#94A3B8] hover:text-white"
                  )}
                >
                  <Trophy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        {activeTab === "chat" ? (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  characterName={character.name}
                />
              ))}
              {isTyping && <TypingIndicator name={character.name} />}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isSending}
              placeholder={`Message ${character.name}...`}
            />
          </>
        ) : (
          /* Missions Tab */
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#F8FAFC]">Available Missions</h2>
              <div className="flex items-center gap-2 text-[#94A3B8]">
                <Coins className="w-4 h-4" />
                <span>{user?.balance_ntg || 0} NTG</span>
              </div>
            </div>
            <div className="grid gap-4">
              {missions.map((mission) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1E293B] border border-[#334155] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#F8FAFC]">{mission.name}</h3>
                      <p className="text-sm text-[#94A3B8] mt-1">{mission.description}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      mission.type === "feed" && "bg-[#10B981]/20 text-[#10B981]",
                      mission.type === "hairstyle" && "bg-[#6D28D9]/20 text-[#A78BFA]",
                      mission.type === "selfie" && "bg-[#F59E0B]/20 text-[#F59E0B]"
                    )}>
                      {mission.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <span>⏱️ {mission.cooldown_minutes} min cooldown</span>
                    </div>
                    <button
                      onClick={() => handleExecuteMission(mission)}
                      disabled={(user?.balance_ntg || 0) < mission.cost_ntg}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                        (user?.balance_ntg || 0) >= mission.cost_ntg
                          ? "bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-[#6D28D9]/25"
                          : "bg-[#334155] text-[#64748B] cursor-not-allowed"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        {mission.cost_ntg} NTG
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

interface SidebarContentProps {
  character: Character;
  user: any;
  onClose?: () => void;
  onLogout: () => void;
  lastInteraction?: Date | null;
}

function SidebarContent({ character, user, onClose, onLogout, lastInteraction }: SidebarContentProps) {
  // Format last interaction time
  const formatLastInteraction = (date: Date | null) => {
    if (!date) return "Never";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#10B981] flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-[#F8FAFC]">NeuroTamagotchi</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Character Avatar */}
      <div className="flex flex-col items-center py-6">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#6D28D9] to-[#10B981] p-1">
          <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center overflow-hidden">
            {character.avatar_url ? (
              <img 
                src={character.avatar_url} 
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                {character.style === "anime" ? "🎌" : character.style === "cyberpunk" ? "🤖" : "✨"}
              </motion.span>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#F8FAFC] mt-4">{character.name}</h2>
        <p className="text-[#94A3B8] capitalize">{character.style} Style</p>
        
        {/* Last interaction timestamp */}
        <p className="text-xs text-[#64748B] mt-2 flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          Last chat: {formatLastInteraction(lastInteraction)}
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-yellow-400" />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#94A3B8]">Energy</span>
              <span className="text-[#F8FAFC]">{character.params.energy}%</span>
            </div>
            <div className="h-2 bg-[#334155] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${character.params.energy}%` }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-pink-400" />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#94A3B8]">Mood</span>
              <span className="text-[#F8FAFC]">{character.params.mood}%</span>
            </div>
            <div className="h-2 bg-[#334155] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${character.params.mood}%` }}
                className="h-full bg-gradient-to-r from-pink-400 to-red-500 rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#94A3B8]">Bond</span>
              <span className="text-[#F8FAFC]">{character.params.bond}</span>
            </div>
            <div className="h-2 bg-[#334155] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(character.params.bond, 100)}%` }}
                className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="p-4 bg-[#6D28D9]/10 border border-[#6D28D9]/30 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-[#94A3B8]">Balance</span>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#A78BFA]" />
            <span className="text-xl font-bold text-[#F8FAFC]">{user?.balance_ntg || 0}</span>
            <span className="text-[#A78BFA]">NTG</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 pt-4 border-t border-[#334155]">
        <Link href="/admin">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#334155]/50 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function CompanionPage() {
  return (
    <ProtectedRoute>
      <CompanionPageContent />
    </ProtectedRoute>
  );
}
