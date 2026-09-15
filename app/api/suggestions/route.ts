import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { ALLOWED_MODELS } from "@/lib/models";

const provider = createOpenAI({
  name: "saketgpt",
  baseURL: process.env.LLM_BASE_URL ?? "https://api.b.ai/v1",
  apiKey:
    process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? "missing-key",
});

export const maxDuration = 20;

export async function POST(req: Request) {
  const { prompt, model }: { prompt?: string; model?: string } =
    await req.json();

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ suggestions: [] }, { status: 400 });
  }

  const modelId = ALLOWED_MODELS.includes(model ?? "")
    ? (model as string)
    : ALLOWED_MODELS[0];

  try {
    const { text } = await generateText({
      model: provider.chat(modelId),
      prompt: `${prompt}\n\nReply with ONLY the lines, no preamble.`,
      maxOutputTokens: 200,
    });
    const suggestions = text
      .split("\n")
      .map((s) =>
        s
          .replace(/^\s*\d+[.)]\s*/, "")
          .replace(/^[-*•]\s*/, "")
          .replace(/^["']|["']$/g, "")
          .trim(),
      )
      .filter((s) => s.length > 0 && s.length < 120)
      .slice(0, 3);
    return Response.json({ suggestions });
  } catch {
    return Response.json({ suggestions: [] });
  }
}
