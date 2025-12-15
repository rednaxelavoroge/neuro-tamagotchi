"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
  characterName?: string;
}

export function ChatMessage({ message, characterName = "Companion" }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium",
          isUser
            ? "bg-[#6D28D9] text-white"
            : "bg-gradient-to-br from-[#10B981] to-[#059669] text-white"
        )}
      >
        {isUser ? "You" : characterName[0]}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 max-w-full",
          isUser
            ? "bg-[#6D28D9] text-white rounded-tr-sm"
            : "bg-[#1E293B] border border-[#334155] text-[#F8FAFC] rounded-tl-sm"
        )}
      >
        {/* Emotion tag for assistant */}
        {!isUser && message.emotion && (
          <span className="text-xs text-[#10B981] mb-1 block capitalize">
            {message.emotion}
          </span>
        )}
        
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        
        {/* Timestamp */}
        <span
          className={cn(
            "text-xs mt-1 block",
            isUser ? "text-white/60" : "text-[#64748B]"
          )}
        >
          {formatTime(message.created_at)}
        </span>
      </div>
    </motion.div>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default ChatMessage;
