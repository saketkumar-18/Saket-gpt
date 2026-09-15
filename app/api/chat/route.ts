import { createOpenAI } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/ai-sdk";
import {
  type JSONSchema7,
  streamText,
  convertToModelMessages,
  tool,
  stepCountIs,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { ALLOWED_MODELS, SYSTEM_PROMPT } from "@/lib/models";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// SaketGPT works with ANY OpenAI-compatible provider — no lock-in.
// Set LLM_BASE_URL + LLM_API_KEY (and optionally CHAT_MODELS) in .env.local.
const provider = createOpenAI({
  name: "saketgpt",
  baseURL: process.env.LLM_BASE_URL ?? "https://api.b.ai/v1",
  apiKey:
    process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? "missing-key",
});

// ---- server-side tools (zero external keys) ------------------------------

const arith = (expr: string): number => {
  // strict arithmetic-only evaluator: digits, operators, parens, dot, spaces
  if (!/^[-+*/().%\d\s]+$/.test(expr)) {
    throw new Error("only + - * / % ( ) and numbers are allowed");
  }
  const fn = new Function(`"use strict"; return (${expr});`) as () => number;
  const value = fn();
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("expression did not evaluate to a finite number");
  }
  return value;
};

const serverTools = {
  calculate: tool({
    description:
      "Evaluate an arithmetic expression exactly (supports + - * / % and parentheses). Use this for ANY math instead of mental calculation.",
    inputSchema: z.object({
      expression: z.string().describe("e.g. '(23*7+5)/2'"),
    }),
    execute: async ({ expression }) => {
      try {
        return { expression, result: arith(expression) };
      } catch (err) {
        return {
          expression,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  }),

  current_datetime: tool({
    description:
      "Get the current date and time, in UTC and in a chosen timezone (defaults to IST / Asia/Kolkata). Use whenever the answer depends on 'now'.",
    inputSchema: z.object({
      timezone: z
        .string()
        .optional()
        .describe("IANA timezone, defaults to Asia/Kolkata"),
    }),
    execute: async ({ timezone }) => {
      const tz = timezone || "Asia/Kolkata";
      const now = new Date();
      try {
        return {
          iso: now.toISOString(),
          local: new Intl.DateTimeFormat("en-CA", {
            timeZone: tz,
            dateStyle: "full",
            timeStyle: "long",
          }).format(now),
          timezone: tz,
          unix: Math.floor(now.getTime() / 1000),
        };
      } catch {
        return { iso: now.toISOString(), error: `unknown timezone: ${tz}` };
      }
    },
  }),
};

// ---- route ----------------------------------------------------------------

export const maxDuration = 60;

export async function POST(req: Request) {
  const limited = rateLimit(clientIp(req), 20, 60_000);
  if (!limited.ok) {
    return new Response(
      JSON.stringify({
        error: `Rate limit exceeded. Try again in ${limited.retryAfterSec}s.`,
      }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": String(limited.retryAfterSec),
        },
      },
    );
  }

  const {
    messages,
    system,
    tools,
    model: requestedModel,
  }: {
    messages: UIMessage[];
    system?: string;
    tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
    model?: string;
  } = await req.json();

  const modelId = ALLOWED_MODELS.includes(requestedModel ?? "")
    ? (requestedModel as string)
    : ALLOWED_MODELS[0];

  const result = streamText({
    model: provider.chat(modelId),
    messages: await convertToModelMessages(messages),
    system: system
      ? `${SYSTEM_PROMPT}\n\nAdditional user instructions: ${system}`
      : SYSTEM_PROMPT,
    tools: {
      ...serverTools,
      ...frontendTools(tools ?? {}),
    },
    stopWhen: stepCountIs(6),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    onError: (error) =>
      error instanceof Error ? error.message : String(error),
  });
}
