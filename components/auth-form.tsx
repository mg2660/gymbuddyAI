"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "sign_in" | "sign_up";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("sign_up");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function getPostAuthRoute() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return "/auth";
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle<{ id: string }>();

    return profile ? "/dashboard" : "/onboarding";
  }

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    startTransition(async () => {
      if (mode === "sign_up") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        setMessage("Account created. If email confirmation is enabled, verify your email and then continue.");
        router.refresh();
        router.push("/onboarding");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const nextRoute = await getPostAuthRoute();
      router.refresh();
      router.push(nextRoute);
    });
  }

  return (
    <div className="card-surface w-full rounded-[30px] border border-black/5 p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-2 rounded-full bg-sand p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("sign_up")}
          className={`flex-1 rounded-full px-4 py-2 transition ${mode === "sign_up" ? "bg-ink text-cream" : "text-ink/70"}`}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => setMode("sign_in")}
          className={`flex-1 rounded-full px-4 py-2 transition ${mode === "sign_in" ? "bg-ink text-cream" : "text-ink/70"}`}
        >
          Sign In
        </button>
      </div>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
            placeholder="Minimum 6 characters"
            required
          />
        </div>

        {error ? <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-ink px-5 py-4 text-sm font-semibold text-cream transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Working..." : mode === "sign_up" ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
