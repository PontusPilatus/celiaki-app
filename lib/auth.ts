import type { NextRequest } from "next/server";

// Den delade koden (server-side). Är den inte satt är appen öppen.
export function passcode(): string | null {
  const p = process.env.APP_PASSCODE;
  return p && p.length > 0 ? p : null;
}

// Är koden giltig? Om ingen kod är konfigurerad släpper vi igenom (öppen app).
export function codeOk(code: string | null): boolean {
  const p = passcode();
  if (!p) return true;
  return code === p;
}

export function codeFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-app-code");
}
