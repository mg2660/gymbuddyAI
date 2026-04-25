import { redirect } from "next/navigation";
import { GenerateWorkoutButton } from "@/components/generate-workout-button";
import { MarkWorkoutDoneButton } from "@/components/mark-workout-done-button";
import { MobileNav } from "@/components/mobile-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { WorkoutCard } from "@/components/workout-card";
import { WorkoutRoutineActions } from "@/components/workout-routine-actions";
import { WorkoutSummaryCard } from "@/components/workout-summary-card";
import { getCurrentUserProfile } from "@/lib/data/profile";
import { getTodaysWorkoutRecommendation } from "@/lib/data/workouts";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  const todayRecommendation = await getTodaysWorkoutRecommendation();

  return (
    <main className="screen-fade mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
      <header className="flex items-center justify-between gap-2">
        <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.34em] text-moss sm:text-xs">
          Gym Buddy AI
        </p>
        <MobileNav active="dashboard" compact />
        <SignOutButton compact />
      </header>

      {todayRecommendation ? (
        <section className="space-y-4 pb-28">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar whitespace-nowrap">
            <span className="rounded-full bg-white/80 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-ink/75 shadow-card">
              Goal: {profile.goal.replaceAll("_", " ")}
            </span>
            <span className="rounded-full bg-white/80 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-ink/75 shadow-card">
              {todayRecommendation.focus.replaceAll("_", " ")}
            </span>
            {todayRecommendation.todaySpecialRequest ? (
              <span className="rounded-full bg-clay px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white shadow-card">
                Today: {todayRecommendation.todaySpecialRequest}
              </span>
            ) : null}
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 hide-scrollbar sm:-mx-6 sm:px-6">
            {todayRecommendation.exercises.map((exercise, index) => (
              <div key={exercise.name} className="w-[88vw] max-w-[360px] shrink-0 sm:w-[360px]">
                <WorkoutCard exercise={exercise} index={index} />
              </div>
            ))}
            <div className="w-[88vw] max-w-[360px] shrink-0 sm:w-[360px]">
              <WorkoutSummaryCard recommendation={todayRecommendation} variant="overview" />
            </div>
            <div className="w-[88vw] max-w-[360px] shrink-0 sm:w-[360px]">
              <WorkoutSummaryCard recommendation={todayRecommendation} variant="why" />
            </div>
          </div>

          <div className="sticky bottom-4 z-10">
            <div className="card-surface rounded-[30px] border border-black/5 p-2.5 shadow-card">
              <div className="flex items-center gap-2">
                <WorkoutRoutineActions todaySpecialRequest={todayRecommendation.todaySpecialRequest} />
                <div className="flex-1">
                  <MarkWorkoutDoneButton />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-5">
          <article className="ink-surface float-in rounded-[36px] px-5 py-6 text-cream sm:px-7 sm:py-7">
            <p className="text-xs uppercase tracking-[0.24em] text-cream/60">Generate</p>
            <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight sm:text-[2.7rem]">
              Let&apos;s build the right session for today.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-cream/80">
              Gym Buddy AI keeps your long-term profile in the background so this screen can stay fully focused on
              the daily workout experience.
            </p>
          </article>

          <section className="card-surface rounded-[34px] border border-black/5 p-5 shadow-card sm:p-6">
            <GenerateWorkoutButton />
          </section>
        </section>
      )}
    </main>
  );
}
