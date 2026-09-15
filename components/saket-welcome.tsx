"use client";

import { type FC } from "react";
import { useAui } from "@assistant-ui/react";
import { Button } from "@/components/ui/button";

const QUICK_PROMPTS: { title: string; prompt: string }[] = [
  {
    title: "Explain a concept",
    prompt: "Explain transformers in LLMs like I'm a 2nd-year CS student.",
  },
  {
    title: "Code help",
    prompt: "Write a Python function to deduplicate a list while preserving order, with tests.",
  },
  {
    title: "Brainstorm",
    prompt: "Give me 5 hackathon project ideas combining AI and sustainability.",
  },
  {
    title: "Daily math",
    prompt: "What is (17 * 23 + 456) / 7? Use your calculator tool.",
  },
];

export const SaketGptWelcome: FC = () => {
  const aui = useAui();

  return (
    <div className="aui-thread-welcome-root mb-6 flex w-full max-w-[var(--thread-max-width)] flex-col items-center px-4 text-center">
      <div className="from-foreground/90 to-foreground/50 bg-gradient-to-b flex items-center gap-2">
        <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-2xl font-semibold tracking-tight duration-200">
          SaketGPT
        </h1>
      </div>
      <p className="text-muted-foreground fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-sm duration-300 [animation-delay:80ms]">
        Your own chat, your own model. Ask anything — or start here:
      </p>
      <div className="mt-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {QUICK_PROMPTS.map((s, i) => (
          <Button
            key={s.title}
            variant="outline"
            className="fade-in slide-in-from-bottom-2 animate-in fill-mode-both h-auto justify-start rounded-xl px-4 py-3 text-left text-sm font-normal"
            style={{ animationDelay: `${120 + i * 60}ms` }}
            onClick={() => aui.thread.append(s.prompt)}
          >
            <span>
              <span className="font-medium">{s.title}</span>
              <span className="text-muted-foreground block truncate text-xs">
                {s.prompt}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
