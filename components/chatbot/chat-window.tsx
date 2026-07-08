"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Minimize2, Loader2, Bot } from "lucide-react";
import { useTheme } from "next-themes";
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

/** Simple markdown-to-JSX renderer for chat messages */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";

    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="mt-2 mb-1 text-sm font-semibold">
          {renderInline(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="mt-2 mb-1 text-sm font-bold">
          {renderInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith("• ") || line.startsWith("- ")) {
      elements.push(
        <div key={i} className="ml-2 flex gap-1.5 text-[13px] leading-relaxed">
          <span className="shrink-0 opacity-60">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(
        <p key={i} className="text-[13px] leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold**, *italic*, _italic_, `code`, and [links](url)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|`(.+?)`|\[(.+?)\]\((.+?)\)|🔗|📧|📱|📍|💼|🐙|📄|📝|🏆|💻|🎓|⭐|🤖|🌐|🗄️|🛠️)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={match.index} className="italic opacity-80">{match[3]}</em>);
    } else if (match[4]) {
      // _italic_
      parts.push(<em key={match.index} className="italic opacity-80">{match[4]}</em>);
    } else if (match[5]) {
      // `code`
      parts.push(
        <code key={match.index} className="rounded bg-black/10 px-1 py-0.5 text-xs font-mono dark:bg-white/10">
          {match[5]}
        </code>
      );
    } else if (match[6] && match[7]) {
      // [text](url)
      parts.push(
        <a
          key={match.index}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6366f1] underline underline-offset-2 hover:text-[#8b5cf6] dark:text-[#a5b4fc] dark:hover:text-[#c4b5fd]"
        >
          {match[6]}
        </a>
      );
    } else {
      // Emoji pass-through
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export function ChatWindow({ isOpen, onMinimize, settings }: ChatWindowProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hasInitialized = React.useRef(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
      const response = await generateResponse(text, messages);
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
          animate={
            isMinimized
              ? { opacity: 1, y: 0, scale: 1, height: 56 }
              : { opacity: 1, y: 0, scale: 1, height: "auto" }
          }
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn(
            "fixed bottom-24 right-4 z-50 flex w-[380px] flex-col overflow-hidden rounded-2xl",
            "shadow-2xl md:right-8",
            isDark
              ? "border border-white/[0.1] bg-[rgba(15,23,42,0.97)] backdrop-blur-xl"
              : "border border-slate-200 bg-white/[0.98] backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.12)]",
            isMinimized ? "h-[56px]" : "max-h-[520px]"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3",
              isDark
                ? "border-b border-white/[0.08] bg-gradient-to-r from-[#6366f1]/15 via-[#8b5cf6]/15 to-[#06b6d4]/15"
                : "border-b border-slate-100 bg-gradient-to-r from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#06b6d4]/5"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#06b6d4]">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>
                  {settings?.chatbot_name ?? "Portfolio Assistant"}
                </p>
                <p className={cn("flex items-center gap-1.5 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  isDark
                    ? "text-slate-400 hover:bg-white/[0.08] hover:text-white"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                )}
                aria-label="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  isDark
                    ? "text-slate-400 hover:bg-white/[0.08] hover:text-white"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                )}
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div
                className={cn(
                  "flex-1 overflow-y-auto px-4 py-4 space-y-3",
                  isDark ? "bg-[#0c1222]" : "bg-slate-50/50"
                )}
                style={{ maxHeight: 350 }}
              >
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
                        "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                        msg.role === "user"
                          ? "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white rounded-br-md"
                          : isDark
                            ? "bg-white/[0.06] text-slate-200 rounded-bl-md border border-white/[0.06]"
                            : "bg-white text-slate-700 rounded-bl-md border border-slate-100 shadow-sm"
                      )}
                    >
                      <div>
                        {msg.role === "assistant"
                          ? renderMarkdown(msg.content)
                          : <span className="whitespace-pre-wrap">{msg.content}</span>
                        }
                      </div>
                      <p
                        className={cn(
                          "mt-1.5 text-[10px]",
                          msg.role === "user"
                            ? "text-white/50"
                            : isDark
                              ? "text-slate-500"
                              : "text-slate-400"
                        )}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-2xl rounded-bl-md px-4 py-3",
                        isDark
                          ? "bg-white/[0.06] border border-white/[0.06]"
                          : "bg-white border border-slate-100 shadow-sm"
                      )}
                    >
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8b5cf6]" />
                      <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions */}
              {messages.length <= 1 && (
                <div
                  className={cn(
                    "px-4 py-3",
                    isDark ? "border-t border-white/[0.06]" : "border-t border-slate-100"
                  )}
                >
                  <p className={cn("mb-2 text-xs font-medium", isDark ? "text-slate-500" : "text-slate-400")}>
                    Quick questions:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedQuestions.slice(0, 3).map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSuggestion(q)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs transition-all",
                          isDark
                            ? "bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:bg-[#6366f1]/20 hover:text-white hover:border-[#6366f1]/30"
                            : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-[#6366f1]/10 hover:text-[#6366f1] hover:border-[#6366f1]/20"
                        )}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div
                className={cn(
                  "px-4 py-3",
                  isDark
                    ? "border-t border-white/[0.08] bg-white/[0.02]"
                    : "border-t border-slate-100 bg-white"
                )}
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about the portfolio..."
                    className={cn(
                      "flex-1 rounded-xl px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1",
                      isDark
                        ? "border border-white/[0.08] bg-white/[0.04] text-white placeholder-slate-500 focus:border-[#6366f1]/50 focus:ring-[#6366f1]/30"
                        : "border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-[#6366f1]/50 focus:ring-[#6366f1]/30 focus:bg-white"
                    )}
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                      input.trim() && !isTyping
                        ? "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                        : isDark
                          ? "bg-white/[0.05] text-slate-600 cursor-not-allowed"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
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
