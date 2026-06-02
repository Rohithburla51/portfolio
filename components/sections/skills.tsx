import * as React from "react";
import {
  Code2,
  Brain,
  Layout,
  Database,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface Skill {
  name: string;
  level: number; // 0-100
  icon?: string;
}

interface SkillCategory {
  title: string;
  icon: LucideIcon;
  accent: string;
  skills: Skill[];
}

const CATEGORIES: SkillCategory[] = [
  {
    title: "Programming",
    icon: Code2,
    accent: "from-[#6366f1] to-[#8b5cf6]",
    skills: [
      { name: "Python", level: 92 },
      { name: "Java", level: 75 },
      { name: "C", level: 70 },
      { name: "C++", level: 72 },
    ],
  },
  {
    title: "AI & ML",
    icon: Brain,
    accent: "from-[#8b5cf6] to-[#06b6d4]",
    skills: [
      { name: "Machine Learning", level: 88 },
      { name: "Deep Learning (CNN, SegFormer)", level: 85 },
      { name: "Computer Vision", level: 88 },
      { name: "MediaPipe", level: 82 },
      { name: "PyTorch", level: 80 },
      { name: "NLP", level: 75 },
    ],
  },
  {
    title: "Frontend & Mobile",
    icon: Layout,
    accent: "from-[#06b6d4] to-[#6366f1]",
    skills: [
      { name: "HTML5", level: 85 },
      { name: "JavaScript", level: 78 },
      { name: "Flutter", level: 70 },
    ],
  },
  {
    title: "Database",
    icon: Database,
    accent: "from-[#6366f1] to-[#06b6d4]",
    skills: [
      { name: "MySQL", level: 78 },
      { name: "Firebase", level: 72 },
      { name: "Firestore", level: 72 },
    ],
  },
  {
    title: "Tools",
    icon: Wrench,
    accent: "from-[#8b5cf6] to-[#6366f1]",
    skills: [
      { name: "Git", level: 85 },
      { name: "GitHub", level: 88 },
    ],
  },
];

export function Skills() {
  return (
    <section id="skills" className="section relative" aria-label="Skills">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="Skills"
          title="A toolkit for "
          gradientWord="intelligent products"
          description="Languages, frameworks, and tools I use to design, train, and ship AI systems."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <SkillCard key={cat.title} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillCard({ category }: { category: SkillCategory }) {
  const Icon = category.icon;
  return (
    <GlassCard className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white",
            category.accent,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-display text-xl font-semibold tracking-tight">
          {category.title}
        </h3>
      </div>

      <ul className="space-y-3">
        {category.skills.map((s) => (
          <li key={s.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-white/90">{s.name}</span>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {s.level}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className={cn("h-full rounded-full bg-gradient-to-r", category.accent)}
                style={{ width: `${s.level}%` }}
                role="progressbar"
                aria-valuenow={s.level}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${s.name} proficiency`}
              />
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
