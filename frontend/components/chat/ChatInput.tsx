"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Send, Smile, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

const MAX_MESSAGE_LENGTH = 2000;

export function ChatInput({
  onSend,
  isLoading = false,
  placeholder = "Type a message...",
  disabled = false,
  maxLength = MAX_MESSAGE_LENGTH,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading && !disabled && trimmedMessage.length <= maxLength) {
      onSend(trimmedMessage);
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Only allow input up to maxLength
    if (value.length <= maxLength) {
      setMessage(value);
    }
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isAtLimit = characterCount >= maxLength;

  return (
    <div className="p-4 bg-[#1E293B]/80 backdrop-blur-xl border-t border-[#334155]">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        {/* Emoji button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 text-[#64748B] hover:text-[#F8FAFC] transition-colors"
          type="button"
        >
          <Smile className="w-6 h-6" />
        </motion.button>

        {/* Input area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            maxLength={maxLength}
            className={cn(
              "w-full px-4 py-3 pr-16 bg-[#0F172A] border border-[#334155] rounded-xl",
              "text-[#F8FAFC] placeholder-[#64748B] resize-none",
              "focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/50 focus:border-[#6D28D9]",
              "transition-all min-h-[48px] max-h-[120px]",
              disabled && "opacity-50 cursor-not-allowed",
              isAtLimit && "border-red-500/50"
            )}
          />
          
          {/* Character counter */}
          {message.length > 0 && (
            <span
              className={cn(
                "absolute right-3 bottom-3 text-xs transition-colors",
                isAtLimit
                  ? "text-red-400"
                  : isNearLimit
                  ? "text-yellow-400"
                  : "text-[#64748B]"
              )}
            >
              {characterCount}/{maxLength}
            </span>
          )}
        </div>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled || isAtLimit}
          className={cn(
            "p-2.5 rounded-xl transition-all",
            message.trim() && !isLoading && !isAtLimit
              ? "bg-[#6D28D9] text-white hover:bg-[#7C3AED] shadow-lg shadow-[#6D28D9]/25"
              : "bg-[#334155] text-[#64748B] cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Send className="w-6 h-6" />
          )}
        </motion.button>
      </div>

      {/* Hint text */}
      <p className="text-center text-xs text-[#64748B] mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}

export default ChatInput;
