"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Use a password with at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    startTransition(async () => {
      try {
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
          setError("This reset link is invalid or has expired. Request a new one from the sign-in page.");
          return;
        }

        setMessage("Password updated. Taking you to your dashboard...");
        router.refresh();
        router.push("/dashboard");
      } catch {
        setError("Unable to update your password right now. Please try again.");
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-8 sm:px-8">
      <section className="card-surface w-full rounded-[30px] border border-black/5 p-5 shadow-card sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">Password reset</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Choose a new password</h1>
        <p className="mt-3 text-sm leading-6 text-ink/70">Use a new password to secure your Gym Buddy account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm font-medium text-ink">
            New password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-ink">
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          {error ? <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-ink px-5 py-4 text-sm font-semibold text-cream transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Updating password..." : "Update password"}
          </button>
        </form>
      </section>
    </main>
  );
}
