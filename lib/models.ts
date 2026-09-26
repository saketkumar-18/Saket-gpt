// Server-side model allow-list. Set CHAT_MODELS=comma,separated,ids to expose
// more models (any id your OpenAI-compatible provider accepts).
export const ALLOWED_MODELS: string[] = (
  process.env.CHAT_MODELS ??
  "mimo-v2.5:free,deepseek-v4-flash:free,mimo-v2.6-flash:free"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

/** Human-friendly labels for known model ids; unknown ids fall back to the id. */
export const MODEL_LABELS: Record<string, string> = {
  "mimo-v2.5:free": "MiMo 2.5",
  "mimo-v2.6-flash:free": "MiMo 2.6 Flash",
  "deepseek-v4-flash:free": "DeepSeek V4 Flash",
  "deepseek-v4.1-flash:free": "DeepSeek V4.1 Flash",
  "qwen3.8-flash:free": "Qwen 3.8 Flash",
  "qwen3.8-flash": "Qwen 3.8 Flash",
};

export const SYSTEM_PROMPT = `You are SaketGPT, a fast, friendly AI assistant built by Saket Kumar (IIT Guwahati, Data Science & AI).

How you work:
- Use markdown well: short paragraphs, code blocks with a language tag, tables for comparisons, bold for key terms.
- Match the user's language (answer in Hinglish if they write Hinglish).
- Be direct and honest. Say "I don't know" instead of guessing. Never invent facts, numbers, or citations.
- For math, dates, or anything computable, use your tools rather than estimating.
- Keep casual chat brief and warm; go deep when the question deserves depth.`;