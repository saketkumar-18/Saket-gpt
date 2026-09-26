"use client";

import { type FC } from "react";
import { useAui } from "@assistant-ui/react";
import {
  CalculatorIcon,
  Code2Icon,
  Globe2Icon,
  GraduationCapIcon,
  LightbulbIcon,
  SparklesIcon,
  KeyboardIcon,
  MicIcon,
  GitBranchIcon,
} from "lucide-react";

const QUICK_PROMPTS: {
  icon: FC<{ className?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  prompt: string;
}[] = [
  {
    icon: GraduationCapIcon,
    title: "Explain a concept",
    subtitle: "Transformers, like I'm in 2nd year",
    prompt: "Explain transformers in LLMs like I'm a 2nd-year CS student.",
  },
  {
    icon: Code2Icon,
    title: "Write code",
    subtitle: "Python, with tests",
    prompt:
      "Write a Python function to deduplicate a list while preserving order, with tests.",
  },
  {
    icon: LightbulbIcon,
    title: "Brainstorm",
    subtitle: "5 AI × sustainability ideas",
    prompt:
      "Give me 5 hackathon project ideas combining AI and sustainability.",
  },
  {
    icon: CalculatorIcon,
    title: "Solve math",
    subtitle: "(17 × 23 + 456) ÷ 7",
    prompt: "What is (17 * 23 + 456) / 7? Use your calculator tool.",
  },
];

const FEATURES = [
  { icon: GitBranchIcon, label: "Multi-thread · saved locally" },
  { icon: MicIcon, label: "Voice in & out" },
  { icon: SparklesIcon, label: "Model picker + tools" },
];

export const SaketGptWelcome: FC = () => {
  const aui = useAui();

  return (
    <div className="aui-thread-welcome-root mb-8 flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col items-center justify-center px-4 text-center">
      <div className="sg-hero-badge fade-in animate-in fill-mode-both flex size-16 items-center justify-center rounded-2xl duration-500">
        <SparklesIcon className="text-primary size-8" strokeWidth={1.8} />
      </div>

      <h1 className="sg-hero-title fade-in slide-in-from-bottom-1 animate-in fill-mode-both mt-5 text-4xl font-bold tracking-tight duration-500 [animation-delay:60ms]">
        SaketGPT
      </h1>
      <p className="text-muted-foreground fade-in slide-in-from-bottom-1 animate-in fill-mode-both mt-2 max-w-md text-sm leading-relaxed duration-500 [animation-delay:120ms]">
        Your own chat, your own model. Ask anything — pick a starter or type
        below.
      </p>

      <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {QUICK_PROMPTS.map(({ icon: Icon, title, subtitle, prompt }, i) => (
          <button
            key={title}
            type="button"
            onClick={() => aui.thread.append(prompt)}
            className="sg-prompt-card border-border/70 bg-card hover:bg-accent/40 fade-in slide-in-from-bottom-2 animate-in fill-mode-both group flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-left"
            style={{ animationDelay: `${160 + i * 70}ms` }}
          >
            <span className="bg-primary/10 text-primary group-hover:bg-primary/15 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors">
              <Icon className="size-4.5" strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{title}</span>
              <span className="text-muted-foreground block truncate text-xs leading-relaxed">
                {subtitle}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="text-muted-foreground fade-in animate-in fill-mode-both mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] [animation-delay:480ms]">
        {FEATURES.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <Icon className="size-3.5 opacity-70" />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <KeyboardIcon className="size-3.5 opacity-70" />
          Press Enter to send
        </span>
      </div>
    </div>
  );
};
