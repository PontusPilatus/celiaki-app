import { NextRequest, NextResponse } from "next/server";
import { passcode, codeOk } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let code: string | null = null;
  try {
    const body = await req.json();
    code = typeof body?.code === "string" ? body.code : null;
  } catch {
    code = null;
  }
  const required = passcode() !== null;
  const ok = codeOk(code);
  return NextResponse.json({ required, ok }, { status: ok ? 200 : 401 });
}
