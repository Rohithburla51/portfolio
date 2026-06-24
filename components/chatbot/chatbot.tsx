"use client";

import * as React from "react";
import { ChatButton } from "./chat-button";
import { ChatWindow } from "./chat-window";
import { loadKnowledgeBase } from "@/lib/chatbot-engine";
import type { ChatbotSettings } from "@/lib/types";
import { createBrowserClient } from "@supabase/ssr";

export function Chatbot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [settings, setSettings] = React.useState<ChatbotSettings | null>(null);
  const [enabled, setEnabled] = React.useState(true);

  React.useEffect(() => {
    // Pre-load knowledge base on mount for faster first response
    loadKnowledgeBase();

    // Fetch settings
    const fetchSettings = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data } = await supabase
          .from("chatbot_settings")
          .select("key, value")
          .in("key", ["enabled", "chatbot_name", "welcome_message", "suggested_questions"]);

        if (!data) return;

        const s: Partial<ChatbotSettings> = {};
        data.forEach((row) => {
          const value = row.value as { value: unknown };
          switch (row.key) {
            case "enabled":
              s.enabled = value.value as boolean;
              break;
            case "chatbot_name":
              s.chatbot_name = value.value as string;
              break;
            case "welcome_message":
              s.welcome_message = value.value as string;
              break;
            case "suggested_questions":
              s.suggested_questions = value.value as string[];
              break;
          }
        });

        setSettings(s as ChatbotSettings);
        setEnabled(s.enabled ?? true);
      } catch {
        // Use defaults if fetch fails
      }
    };

    fetchSettings();
  }, []);

  if (!enabled) return null;

  return (
    <>
      <ChatButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <ChatWindow
        isOpen={isOpen}
        onMinimize={() => setIsOpen(false)}
        settings={settings}
      />
    </>
  );
}