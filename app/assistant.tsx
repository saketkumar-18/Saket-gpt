"use client";

import { useMemo, type FC } from "react";
import {
  AssistantRuntimeProvider,
  useRemoteThreadListRuntime,
  WebSpeechDictationAdapter,
  WebSpeechSynthesisAdapter,
  createSuggestionAdapter,
  type RemoteThreadListAdapter,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { Thread } from "@/components/assistant-ui/elements/thread.aui";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/elements/threadlist-sidebar.aui";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/lib/store";
import { getThreadListAdapter } from "@/lib/thread-storage";
import { ChatHeader } from "@/components/chat-header";
import { SaketGptWelcome } from "@/components/saket-welcome";

/** Reads current settings fresh on every request — no runtime remount needed. */
function makeTransport() {
  return new AssistantChatTransport({
    api: "/api/chat",
    body: () => {
      const { model, instructions } = useSettings.getState();
      return {
        model,
        system: instructions.trim() || undefined,
      };
    },
  });
}

/** Chat runtime per thread, mounted inside the localStorage thread list. */
const useSaketGptRuntime = () => {
  // one transport per thread (the remote thread list mounts this hook per
  // thread); body() is resolved per request so setting changes apply live.
  const transport = useMemo(() => makeTransport(), []);

  const adapters = useMemo(
    () => ({
      speech: new WebSpeechSynthesisAdapter(),
      dictation: new WebSpeechDictationAdapter(),
      suggestion: createSuggestionAdapter({
        complete: async ({ prompt, signal }) => {
          const { model } = useSettings.getState();
          const res = await fetch("/api/suggestions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ prompt, model }),
            signal,
          });
          if (!res.ok) return [];
          const { suggestions } = (await res.json()) as {
            suggestions: string[];
          };
          return Array.isArray(suggestions) ? suggestions : [];
        },
        count: 3,
      }),
    }),
    [],
  );

  return useChatRuntime({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    adapters,
  });
};

export const Assistant: FC = () => {
  const threadListAdapter = useMemo<RemoteThreadListAdapter>(
    () => getThreadListAdapter(),
    [],
  );

  const runtime = useRemoteThreadListRuntime({
    adapter: threadListAdapter,
    allowNesting: true,
    runtimeHook: useSaketGptRuntime,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <ThreadListSidebar />
          <SidebarInset>
            <header className="aui-chat-header flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-1 h-4" />
              <span className="text-sm font-semibold tracking-tight">
                SaketGPT
              </span>
              <div className="ms-auto flex items-center gap-2">
                <ChatHeader />
              </div>
            </header>
            <div className="flex-1 overflow-hidden">
              <Thread components={{ Welcome: SaketGptWelcome }} />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
