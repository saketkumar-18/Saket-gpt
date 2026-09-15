"use client";

import { useEffect, useState, type FC } from "react";
import { CheckIcon, ChevronDownIcon, Settings2Icon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSettings, DEFAULT_MODELS, type ChatModel } from "@/lib/store";

/** Model picker + custom system instructions + theme toggle. */
export const ChatHeader: FC = () => {
  const { models, model, instructions, setModels, setModel, setInstructions } =
    useSettings();
  const [openSettings, setOpenSettings] = useState(false);
  const [draft, setDraft] = useState(instructions);

  // hydrate picker from the server allow-list (source of truth)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/models")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { models?: string[] } | null) => {
        if (cancelled || !data?.models?.length) return;
        const known = new Map(models.map((m) => [m.id, m]));
        setModels(
          data.models.map(
            (id): ChatModel =>
              known.get(id) ?? { id, label: id, hint: "server" },
          ),
        );
      })
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
      <DropdownMenu open={openSettings} onOpenChange={setOpenSettings}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="aui-model-picker gap-1.5"
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
              <span className="flex-1 truncate">{m.label}</span>
              {m.hint && (
                <span className="text-muted-foreground text-xs">{m.hint}</span>
              )}
              {m.id === model && <CheckIcon className="size-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <div
            className="px-1.5 py-1"
            onKeyDown={(e) => e.stopPropagation()}
          >
            <label className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
              <Settings2Icon className="size-3.5" /> Custom instructions
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
      <ThemeToggle />
    </>
  );
};
