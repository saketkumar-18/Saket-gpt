import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChatModel = {
  id: string;
  label: string;
  hint: string;
};

/**
 * Fallback catalogue (matches the server default in lib/models.ts).
 * On first load the client hydrates this from GET /api/models, so the picker
 * always reflects the server's allow-list — the server is the source of truth.
 */
export const DEFAULT_MODELS: ChatModel[] = [
  { id: "qwen3.8-flash", label: "Qwen 3.8 Flash", hint: "fast" },
];

type SettingsState = {
  models: ChatModel[];
  model: string;
  instructions: string;
  setModels: (models: ChatModel[]) => void;
  setModel: (model: string) => void;
  setInstructions: (instructions: string) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      models: DEFAULT_MODELS,
      model: DEFAULT_MODELS[0].id,
      instructions: "",
      setModels: (models) =>
        set((s) => ({
          models,
          // keep current selection valid when the allow-list changes
          model: models.some((m) => m.id === s.model)
            ? s.model
            : models[0]?.id ?? s.model,
        })),
      setModel: (model) => set({ model }),
      setInstructions: (instructions) => set({ instructions }),
    }),
    { name: "saketgpt:settings" },
  ),
);
