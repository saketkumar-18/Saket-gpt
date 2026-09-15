"use client";

import { useMemo, type ReactNode } from "react";
import {
  createLocalStorageAdapter,
  createSimpleTitleAdapter,
  RuntimeAdapterProvider,
} from "@assistant-ui/core/react";
import { useAui, type RemoteThreadListAdapter, type ThreadHistoryAdapter } from "@assistant-ui/react";

/** localStorage wrapped in the async interface the adapter expects, with an
 * in-memory fallback for private-mode browsers where storage throws. */
const memory = new Map<string, string>();
const safeStorage = {
  async getItem(key: string) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  async setItem(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  async removeItem(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  },
};

// ---- history adapter with `withFormat` (required by useChatRuntime) --------

type StoredRow = {
  id: string;
  parent_id: string | null;
  format: string;
  content: Record<string, unknown>;
};

function useSaketGptAdapters() {
  const aui = useAui();

  const history = useMemo(
    () => ({
      async load() {
        return { messages: [] as never[] };
      },
      async append() {},
      // AI SDK v7 runtime always goes through withFormat: it hands us its
      // format adapter, we round-trip UIMessages through it and persist the
      // encoded rows in localStorage keyed by the thread's remoteId.
      withFormat: (fmt: {
        format: string;
        encode: (item: never) => Record<string, unknown>;
        decode: (stored: StoredRow) => never;
        getId: (message: never) => string;
      }) => {
        const rowsKey = (remoteId: string) =>
          `saketgpt:uimsg:${remoteId}`;

        const readRows = async (
          remoteId: string,
        ): Promise<{ headId: string | null; rows: StoredRow[] }> => {
          const raw = await safeStorage.getItem(rowsKey(remoteId));
          if (!raw) return { headId: null, rows: [] };
          try {
            const parsed = JSON.parse(raw) as {
              headId?: string | null;
              rows?: StoredRow[];
            };
            return {
              headId: parsed.headId ?? null,
              rows: Array.isArray(parsed.rows) ? parsed.rows : [],
            };
          } catch {
            return { headId: null, rows: [] };
          }
        };

        const writeRows = async (
          remoteId: string,
          headId: string | null,
          rows: StoredRow[],
        ) => {
          await safeStorage.setItem(
            rowsKey(remoteId),
            JSON.stringify({ headId, rows }),
          );
        };

        const upsert = async (item: { parentId?: string | null; message: never }) => {
          const { remoteId } = aui.threadListItem.getState();
          const resolved =
            remoteId ?? (await aui.threadListItem.initialize()).remoteId;
          const { rows } = await readRows(resolved);
          const id = fmt.getId(item.message);
          const row: StoredRow = {
            id,
            parent_id: item.parentId ?? null,
            format: fmt.format,
            content: fmt.encode(item as never),
          };
          const idx = rows.findIndex((r) => r.id === id);
          if (idx >= 0) rows[idx] = row;
          else rows.push(row);
          await writeRows(resolved, id, rows);
        };

        return {
          async load() {
            const { remoteId } = aui.threadListItem.getState();
            if (!remoteId) return { messages: [], headId: null };
            const { headId, rows } = await readRows(remoteId);
            return {
              messages: rows.map((row) => fmt.decode(row)),
              headId:
                headId && rows.some((r) => r.id === headId)
                  ? headId
                  : undefined,
            };
          },
          append: (item: { parentId?: string | null; message: never }) =>
            upsert(item),
          update: (item: { parentId?: string | null; message: never }) =>
            upsert(item),
          async delete(
            items: { parentId?: string | null; message: never }[],
          ) {
            const { remoteId } = aui.threadListItem.getState();
            if (!remoteId) return;
            const { headId, rows } = await readRows(remoteId);
            const drop = new Set(
              items.map((i) => fmt.getId(i.message)).filter(Boolean),
            );
            const kept = rows.filter((r) => !drop.has(r.id));
            await writeRows(
              remoteId,
              headId && drop.has(headId) ? null : headId,
              kept,
            );
          },
        };
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aui],
  );

  return useMemo(
    () => ({ history: history as unknown as ThreadHistoryAdapter }),
    [history],
  );
}

// ---- thread list adapter ---------------------------------------------------

let adapter: RemoteThreadListAdapter | undefined;

/** Stable singleton — RemoteThreadListAdapter must not change identity. */
export function getThreadListAdapter(): RemoteThreadListAdapter {
  if (!adapter) {
    const base = createLocalStorageAdapter({
      storage: safeStorage,
      prefix: "saketgpt:",
      titleGenerator: createSimpleTitleAdapter(),
    });

    function Provider({ children }: { children?: ReactNode }) {
      const adapters = useSaketGptAdapters();
      return (
        <RuntimeAdapterProvider adapters={adapters}>
          {children}
        </RuntimeAdapterProvider>
      );
    }

    adapter = {
      ...base,
      // override the built-in history provider (it predates AI SDK v7's
      // withFormat contract) with our own
      unstable_Provider: Provider,
      unstable_useAdapters: useSaketGptAdapters,
    };
  }
  return adapter;
}
