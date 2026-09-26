import { NextResponse } from "next/server";
import { ALLOWED_MODELS, MODEL_LABELS } from "@/lib/models";

export async function GET() {
  return NextResponse.json({
    models: ALLOWED_MODELS.map((id) => ({
      id,
      label: MODEL_LABELS[id] ?? id,
      hint: "free",
    })),
  });
}