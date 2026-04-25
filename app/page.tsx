import Link from "next/link";
import { redirect } from "next/navigation";
import { SectionHeading } from "@/components/section-heading";
import { WorkoutCard } from "@/components/workout-card";
import { getCurrentUserProfile } from "@/lib/data/profile";
import { onboardingQuestions } from "@/lib/onboarding";
import { recentSessions, sampleProfile, sampleRecommendation } from "@/lib/sample-data";
import { createClient } from "@/lib/supabase/server";

const productRules = [
  "Exact workout memory for the last 7-10 days",
  "Older sessions compressed into AI-friendly summaries",
  "Equipment and machine limitations always remembered",
  "Special requests saved as persistent training preferences",
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getCurrentUserProfile() : null;

  if (user && profile) {
    redirect("/dashboard");
  }

  if (user && !profile) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-5 py-6 sm:px-8 lg:px-10">
      <section className="card-surface overflow-hidden rounded-[34px] border border-black/5 shadow-card">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-moss">Gym Buddy AI</p>
              <h1 className="max-w-xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                AI workouts that remember your goal, your recovery, and your real-world limits.
              </h1>
              <p className="max-w-xl text-base leading-7 text-ink/75">
                Mobile-first workout planning for people who train seriously but do not want the hassle of
                tracking splits, equipment gaps, and what comes next.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {productRules.map((rule) => (
                <div key={rule} className="rounded-[24px] bg-white/65 p-4">
                  <p className="text-sm font-medium text-ink">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[30px] bg-ink p-6 text-cream">
            <p className="text-xs uppercase tracking-[0.24em] text-cream/70">Today&apos;s suggestion</p>
            <h2 className="mt-3 text-3xl font-semibold">{sampleRecommendation.title}</h2>
            <p className="mt-3 text-sm leading-6 text-cream/75">{sampleRecommendation.rationale[0]}</p>

            <div className="mt-6 space-y-3">
              {sampleRecommendation.summaryBullets.map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                  * {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/auth"
                className="w-full rounded-full bg-clay px-5 py-4 text-center text-sm font-semibold text-white transition hover:opacity-90"
              >
                Start with account setup
              </Link>
              <p className="text-center text-xs uppercase tracking-[0.16em] text-cream/60">
                Then continue to onboarding and dashboard
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="card-surface rounded-[30px] border border-black/5 p-6 shadow-card sm:p-8">
          <SectionHeading
            eyebrow="Onboarding"
            title="Ask the right questions once"
            description="Gym Buddy AI should collect only the questions that meaningfully change the workout plan, then keep those answers persistent in the profile."
          />

          <div className="mt-6 space-y-3">
            {onboardingQuestions.map((question) => (
              <div key={question.id} className="rounded-2xl bg-white/60 px-4 py-3 text-sm leading-6 text-ink/80">
                <p className="font-medium text-ink">{question.prompt}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-moss">{question.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-[30px] border border-black/5 p-6 shadow-card sm:p-8">
          <SectionHeading
            eyebrow="Profile Memory"
            title="Persistent limits and requests"
            description="These are long-lived constraints the planner should always remember before generating a workout."
          />

          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] bg-white/60 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-moss">Main Goal</p>
              <p className="mt-2 text-lg font-semibold text-ink">{sampleProfile.goal.replace("_", " ")}</p>
            </div>

            <div className="rounded-[24px] bg-white/60 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-moss">Limitations Database</p>
              <div className="mt-3 space-y-2">
                {sampleProfile.limitations.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-sand px-4 py-3 text-sm text-ink">
                    <p className="font-medium">{item.label}</p>
                    {item.notes ? <p className="mt-1 text-ink/70">{item.notes}</p> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-white/60 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-moss">Special Requests</p>
              <div className="mt-3 space-y-2">
                {sampleProfile.specialRequests.map((item) => (
                  <div key={item.title} className="rounded-2xl bg-cream px-4 py-3 text-sm text-ink">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-ink/70">{item.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card-surface rounded-[30px] border border-black/5 p-6 shadow-card sm:p-8">
        <SectionHeading
          eyebrow="Workout Flow"
          title="Card-based session built for mobile"
          description="The first card summarizes the whole workout. The rest break the session into individual exercise cards with warmups, reps, tips, and substitutions."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <article className="rounded-[28px] bg-ink p-6 text-cream">
            <p className="text-xs uppercase tracking-[0.28em] text-cream/70">Summary Card</p>
            <h3 className="mt-3 text-2xl font-semibold">{sampleRecommendation.title}</h3>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-cream/80">
              {sampleRecommendation.summaryBullets.map((item) => (
                <li key={item}>* {item}</li>
              ))}
            </ul>
          </article>

          <div className="flex snap-x gap-4 overflow-x-auto pb-2">
            {sampleRecommendation.exercises.map((exercise, index) => (
              <div key={exercise.name} className="min-w-[280px] max-w-[320px] flex-1">
                <WorkoutCard exercise={exercise} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="card-surface rounded-[30px] border border-black/5 p-6 shadow-card sm:p-8">
          <SectionHeading
            eyebrow="Recent Memory"
            title="Use exact recent sessions"
            description="Recent sessions should stay detailed so the planner can infer recovery, weekly balance, and what to recommend next."
          />

          <div className="mt-6 space-y-3">
            {recentSessions.map((session) => (
              <div key={session.performedAt} className="rounded-[22px] bg-white/60 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-moss">{session.focus}</p>
                <p className="mt-2 text-sm text-ink/80">{session.notes}</p>
                <p className="mt-2 text-sm font-medium text-ink">Hit: {session.muscleGroupsHit.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-[30px] border border-black/5 p-6 shadow-card sm:p-8">
          <SectionHeading
            eyebrow="Now Built"
            title="First real product loop"
            description="Auth, onboarding, and persistent profile memory are the first working slice before today&apos;s AI workout generation."
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Supabase auth entry flow",
              "Protected onboarding page",
              "Saved limitations and special requests",
              "Dashboard that loads persisted profile data",
              "RLS-ready schema for user-owned records",
              "AI route ready for live user context",
            ].map((item) => (
              <div key={item} className="rounded-[22px] bg-sand p-4 text-sm font-medium text-ink">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
