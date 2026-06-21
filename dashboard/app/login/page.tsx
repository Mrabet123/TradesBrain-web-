import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, gateDisabled, tokenFor } from "@/lib/auth";

export const metadata = { title: "Sign in · TradesBrain Dashboard" };

async function login(formData: FormData) {
  "use server";
  const password = process.env.APP_PASSWORD?.trim();
  // If the gate is disabled, just let them in.
  if (!password) redirect("/");

  const entered = String(formData.get("password") ?? "");
  if (entered !== password) redirect("/login?error=1");

  cookies().set(AUTH_COOKIE, await tokenFor(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
  redirect("/");
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  if (gateDisabled()) redirect("/");
  const error = searchParams?.error;

  return (
    <main className="grid min-h-screen place-items-center bg-navy p-6">
      <form
        action={login}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-blue">
          TradesBrain · Internal
        </div>
        <h1 className="text-2xl font-extrabold text-navy">Dashboard sign in</h1>
        <p className="mt-2 text-sm text-slate-500">
          Local access gate. Enter the shared team password to continue.
        </p>

        <label className="mt-6 block text-sm font-semibold text-navy" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-3 text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
        />

        {error && (
          <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
            Wrong password — try again.
          </p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-blue px-5 py-3 text-base font-semibold text-white transition hover:bg-blue-600"
        >
          Enter
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          This tool runs locally only. Never deploy it.
        </p>
      </form>
    </main>
  );
}
