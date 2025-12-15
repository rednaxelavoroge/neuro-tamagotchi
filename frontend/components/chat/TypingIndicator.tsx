"use client";

import { motion } from "framer-motion";

interface TypingIndicatorProps {
  name?: string;
}

export function TypingIndicator({ name = "Companion" }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3 max-w-[85%] mr-auto"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center flex-shrink-0 text-sm font-medium text-white">
        {name[0]}
      </div>

      {/* Typing bubble */}
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-[#1E293B] border border-[#334155]">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#64748B]"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default TypingIndicator;
