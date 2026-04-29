import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUserProfile } from "@/lib/data/profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const profile = await getCurrentUserProfile();
    redirect(profile ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-6 px-5 py-8 sm:px-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-moss">Gym Buddy AI</p>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Your workouts should feel guided, not complicated.
          </h1>
          <p className="max-w-xl text-sm leading-7 text-ink/75 sm:text-base">
            Sign in first, then we&apos;ll build a training profile around your goal, schedule, equipment, and real-world
            limits so every session feels ready to follow.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Fast mobile workout cards",
              "Smarter weight suggestions",
              "Calendar-based training memory",
              "AI that adapts to missed days",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-white/65 px-4 py-3 text-sm font-medium text-ink">
                {item}
              </div>
            ))}
          </div>
        </div>

        <AuthForm />
      </section>
    </main>
  );
}
