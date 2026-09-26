"use client";

import { useEffect, useState, type FC } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  MoonIcon,
  SparklesIcon,
  SunIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import {
  useSettings,
  DEFAULT_MODELS,
  type ChatModel,
} from "@/lib/store";

export const ChatHeader: FC = () => {
  const { models, model, instructions, setModels, setModel, setInstructions } =
    useSettings();
  const { resolvedTheme, setTheme } = useTheme();
  const [draft, setDraft] = useState(instructions);

  // hydrate picker from the server allow-list (source of truth)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/models")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (data: {
          models?: Array<string | { id: string; label?: string; hint?: string }>;
        } | null) => {
          if (cancelled || !data?.models?.length) return;
          const known = new Map(models.map((m) => [m.id, m]));
          setModels(
            data.models.map((entry): ChatModel => {
              const id = typeof entry === "string" ? entry : entry.id;
              if (typeof entry !== "string" && entry.label) {
                return { id, label: entry.label, hint: entry.hint ?? "" };
              }
              return known.get(id) ?? { id, label: id, hint: "server" };
            }),
          );
        },
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current =
    models.find((m) => m.id === model) ??
    DEFAULT_MODELS.find((m) => m.id === model) ?? {
      label: model,
      hint: "",
    };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Model & settings"
          render={
            <Button
              variant="outline"
              size="sm"
              className="aui-model-picker h-9 gap-1.5 rounded-xl"
            />
          }
        >
          <SparklesIcon className="size-3.5" />
          <span className="max-w-32 truncate">{current.label}</span>
          {current.hint && (
            <span className="text-muted-foreground hidden text-xs sm:inline">
              · {current.hint}
            </span>
          )}
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Model</DropdownMenuLabel>
          {models.map((m) => (
            <DropdownMenuItem key={m.id} onClick={() => setModel(m.id)}>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{m.label}</span>
                {m.hint && (
                  <span className="text-muted-foreground text-xs">{m.hint}</span>
                )}
              </span>
              {m.id === model && <CheckIcon className="size-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <div
            className="px-1.5 py-1"
            onKeyDown={(e) => e.stopPropagation()}
          >
            <label className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
              Custom instructions
            </label>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => setInstructions(draft)}
              placeholder="e.g. Always answer in Hinglish. Be terse."
              rows={3}
              className="text-sm"
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        className="aui-theme-toggle size-9 rounded-xl"
        aria-label={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {resolvedTheme === "dark" ? (
          <SunIcon className="size-4.5" />
        ) : (
          <MoonIcon className="size-4.5" />
        )}
      </Button>
    </>
  );
};
