import { NextResponse } from "next/server";
import { ALLOWED_MODELS } from "@/lib/models";

export async function GET() {
  return NextResponse.json({ models: ALLOWED_MODELS });
}
