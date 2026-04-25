import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { SectionHeading } from "@/components/section-heading";
import { SignOutButton } from "@/components/sign-out-button";
import { getCurrentUserProfile } from "@/lib/data/profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const onboardingHighlights = [
  "Primary fitness goal and training intent",
  "Realistic weekly training frequency",
  "Session length limit",
  "Home or gym equipment access",
  "Machines or movements to avoid",
  "Special workout requests to always remember",
];

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const profile = await getCurrentUserProfile();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-moss">Profile Setup</p>
        <SignOutButton />
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card-surface rounded-[30px] border border-black/5 p-6 shadow-card sm:p-8">
          <SectionHeading
            eyebrow="Relevant Questions"
            title="Ask once, remember always"
            description="These answers become the long-lived planning context the AI uses before generating any workout."
          />

          <div className="mt-6 space-y-3">
            {onboardingHighlights.map((item) => (
              <div key={item} className="rounded-2xl bg-white/60 px-4 py-3 text-sm text-ink/80">
                {item}
              </div>
            ))}
          </div>
        </div>

        <section className="card-surface rounded-[30px] border border-black/5 p-6 shadow-card sm:p-8">
          <SectionHeading
            eyebrow="Onboarding"
            title={profile ? "Update your training profile" : "Create your training profile"}
            description="This saves the goal, constraints, and custom preferences Gym Buddy AI should keep in memory for every future recommendation."
          />

          <div className="mt-8">
            <OnboardingForm initialProfile={profile} />
          </div>
        </section>
      </section>
    </main>
  );
}
