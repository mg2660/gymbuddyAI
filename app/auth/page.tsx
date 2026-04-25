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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-5 py-10 sm:px-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-moss">Gym Buddy AI</p>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Build workouts around your goal, your week, and your limitations.
          </h1>
          <p className="max-w-xl text-base leading-7 text-ink/75">
            Create your account first, then we will ask the highest-value questions so future workouts are shaped
            around your training setup, missing machines, movement restrictions, and special requests.
          </p>
        </div>

        <AuthForm />
      </section>
    </main>
  );
}
