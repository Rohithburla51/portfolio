"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Minimize2, Loader2 } from "lucide-react";
import { generateResponse } from "@/lib/chatbot-engine";
import type { ChatMessage, ChatbotSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  isOpen: boolean;
  onMinimize: () => void;
  settings: ChatbotSettings | null;
}

const STORAGE_KEY = "rohith-chat-history";
const MAX_HISTORY = 50;

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as ChatMessage[];
    return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]) {
  try {
    const toStore = messages.slice(-MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {}
}

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function ChatWindow({ isOpen, onMinimize, settings }: ChatWindowProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hasInitialized = React.useRef(false);

  // Track mounted state to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize with welcome message
  React.useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    const saved = loadHistory();
    if (saved.length > 0) {
      setMessages(saved);
    } else if (settings?.welcome_message) {
      const welcomeMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: settings.welcome_message,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
      saveHistory([welcomeMsg]);
    }
  }, [settings]);

  // Auto scroll
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await generateResponse(text);
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    if (settings?.welcome_message) {
      const welcomeMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: settings.welcome_message,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
      saveHistory([welcomeMsg]);
    }
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const suggestedQuestions = settings?.suggested_questions ?? [
    "Who is Rohith?",
    "What projects has he built?",
    "What skills does he know?",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={isMinimized 
            ? { opacity: 1, y: 0, scale: 1, height: 52 } 
            : { opacity: 1, y: 0, scale: 1, height: "auto" }
          }
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn(
            "fixed bottom-24 right-4 z-50 flex w-[360px] flex-col overflow-hidden rounded-2xl border border-white/[0.1]",
            "bg-[rgba(15,23,42,0.95)] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
            "md:right-8",
            isMinimized ? "h-[52px]" : "max-h-[500px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-gradient-to-r from-[#6366f1]/20 via-[#8b5cf6]/20 to-[#06b6d4]/20 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#06b6d4]">
                <span className="text-xs font-bold text-white">AI</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {settings?.chatbot_name ?? "Portfolio Assistant"}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="rounded-lg p-1.5 text-[#94a3b8] transition-colors hover:bg-white/[0.08] hover:text-white"
                aria-label="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-lg p-1.5 text-[#94a3b8] transition-colors hover:bg-white/[0.08] hover:text-white"
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: 340 }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white rounded-br-md"
                          : "bg-white/[0.06] text-[#e2e8f0] rounded-bl-md border border-white/[0.06]"
                      )}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <p className={cn(
                        "mt-1 text-[10px]",
                        msg.role === "user" ? "text-white/50" : "text-[#64748b]"
                      )}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3 border border-white/[0.06]">
                      <Loader2 className="h-4 w-4 animate-spin text-[#8b5cf6]" />
                      <span className="text-xs text-[#94a3b8]">Thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions (show when few messages) */}
              {messages.length <= 1 && (
                <div className="border-t border-white/[0.06] px-4 py-3">
                  <p className="mb-2 text-xs font-medium text-[#64748b]">Suggested:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedQuestions.slice(0, 3).map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSuggestion(q)}
                        className="rounded-full bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 text-xs text-[#94a3b8] transition-all hover:bg-[#6366f1]/20 hover:text-white hover:border-[#6366f1]/30"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-white/[0.08] bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about Rohith's portfolio..."
                    className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-[#64748b] transition-colors focus:border-[#6366f1]/50 focus:outline-none focus:ring-1 focus:ring-[#6366f1]/30"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                      input.trim() && !isTyping
                        ? "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                        : "bg-white/[0.05] text-[#475569] cursor-not-allowed"
                    )}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}