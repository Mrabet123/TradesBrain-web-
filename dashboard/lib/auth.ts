// Light local access gate. Not enterprise auth — the real protection is that
// this app only ever runs on a local machine. We never store the password in a
// cookie; we store a SHA-256 token derived from it, and the middleware compares
// against the token derived from APP_PASSWORD. Uses Web Crypto so it runs in
// both the Edge middleware and Node route handlers.

export const AUTH_COOKIE = "tb_dash";

export async function tokenFor(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`tb-dash:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** True when no APP_PASSWORD is configured — the gate is then disabled. */
export function gateDisabled(): boolean {
  return !process.env.APP_PASSWORD || process.env.APP_PASSWORD.trim() === "";
}
