"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Save, Loader2, MessageCircle, Plus, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface ChatbotSettings {
  enabled: boolean;
  chatbot_name: string;
  welcome_message: string;
  suggested_questions: string[];
}

export default function AdminChatbotPage() {
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const [settings, setSettings] = React.useState<ChatbotSettings>({
    enabled: true,
    chatbot_name: "Rohith's AI Portfolio Assistant",
    welcome_message: "Hi! I'm Rohith's AI Portfolio Assistant. Ask me anything about his projects, skills, certifications, achievements, education, or experience.",
    suggested_questions: [
      "Who is Rohith?",
      "What projects has he built?",
      "What machine learning projects does he have?",
      "What certifications does he have?",
      "What skills does he know?",
    ],
  });
  const [newQuestion, setNewQuestion] = React.useState("");

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/chatbot");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          enabled: data.enabled ?? true,
          chatbot_name: data.chatbot_name ?? settings.chatbot_name,
          welcome_message: data.welcome_message ?? settings.welcome_message,
          suggested_questions: data.suggested_questions ?? settings.suggested_questions,
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      toast.success("Chatbot settings saved successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    setSettings((prev) => ({
      ...prev,
      suggested_questions: [...prev.suggested_questions, newQuestion.trim()],
    }));
    setNewQuestion("");
  };

  const removeQuestion = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      suggested_questions: prev.suggested_questions.filter((_, i) => i !== index),
    }));
  };

  const handleQuestionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addQuestion();
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Chatbot Settings</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Configure the AI portfolio assistant
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4] px-6 py-2.5 text-sm font-medium text-white",
            "transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Enable/Disable */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Chatbot Status</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Enable or disable the portfolio chatbot
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
            className={cn(
              "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
              settings.enabled ? "bg-green-500" : "bg-white/[0.1]"
            )}
          >
            <span
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full bg-white transition-transform",
                settings.enabled ? "translate-x-6" : "translate-x-1"
              )}
            >
              {settings.enabled ? (
                <Eye className="h-3 w-3 text-green-600" />
              ) : (
                <EyeOff className="h-3 w-3 text-gray-400" />
              )}
            </span>
          </button>
        </div>
        <div className="mt-4 rounded-lg bg-white/[0.02] border border-white/[0.05] p-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            {settings.enabled
              ? "The chatbot is currently visible to visitors on all portfolio pages."
              : "The chatbot is currently hidden from visitors."}
          </p>
        </div>
      </div>

      {/* Chatbot Name */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Chatbot Name</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          The name displayed in the chat window header
        </p>
        <input
          type="text"
          value={settings.chatbot_name}
          onChange={(e) => setSettings((prev) => ({ ...prev, chatbot_name: e.target.value }))}
          className="mt-4 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
          placeholder="e.g. Rohith's AI Portfolio Assistant"
        />
      </div>

      {/* Welcome Message */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Welcome Message</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          The first message visitors see when they open the chatbot
        </p>
        <textarea
          value={settings.welcome_message}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, welcome_message: e.target.value }))
          }
          rows={4}
          className="mt-4 w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
          placeholder="Hi! I'm Rohith's AI Portfolio Assistant..."
        />
      </div>

      {/* Suggested Questions */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Suggested Questions</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Quick-reply buttons shown to visitors when they first open the chat
        </p>

        <div className="mt-4 space-y-2">
          {settings.suggested_questions.map((q, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5"
            >
              <span className="text-sm text-white">{q}</span>
              <button
                onClick={() => removeQuestion(i)}
                className="rounded p-1 text-[#64748b] transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={handleQuestionKeyDown}
            placeholder="Add a new suggested question..."
            className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]/50"
          />
          <button
            onClick={addQuestion}
            disabled={!newQuestion.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/[0.12] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-[#6366f1]/20 bg-[#6366f1]/5 p-6">
        <h3 className="text-sm font-semibold text-white">How it works</h3>
        <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-muted)]">
          <li>• The chatbot fetches data directly from your Supabase database</li>
          <li>• When you update projects, certificates, achievements, or experience through the admin dashboard, the chatbot automatically uses the new content</li>
          <li>• No manual retraining or code changes required</li>
          <li>• Chat history is stored locally in the visitor&apos;s browser</li>
        </ul>
      </div>
    </div>
  );
}