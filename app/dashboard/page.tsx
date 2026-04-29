import { redirect } from "next/navigation";
import { GenerateWorkoutButton } from "@/components/generate-workout-button";
import { CalendarLinkButton } from "@/components/calendar-link-button";
import { MarkWorkoutDoneButton } from "@/components/mark-workout-done-button";
import { MobileNav } from "@/components/mobile-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { WorkoutCard } from "@/components/workout-card";
import { WorkoutRoutineActions } from "@/components/workout-routine-actions";
import { WorkoutSummaryCard } from "@/components/workout-summary-card";
import { getCurrentUserProfile } from "@/lib/data/profile";
import {
  getCurrentUserWorkoutCalendar,
  getCurrentUserWorkoutHistory,
  getTodaysWorkoutRecommendation,
} from "@/lib/data/workouts";
import { personalizeWorkoutExercise } from "@/lib/workout-personalization";
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

  const [todayRecommendation, calendar, workoutHistory] = await Promise.all([
    getTodaysWorkoutRecommendation(),
    getCurrentUserWorkoutCalendar(),
    getCurrentUserWorkoutHistory(),
  ]);
  const personalizedExercises = todayRecommendation
    ? todayRecommendation.exercises.map((exercise) =>
        personalizeWorkoutExercise(exercise, profile.experienceLevel, workoutHistory),
      )
    : [];

  return (
    <main className="screen-fade mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
      <header className="flex items-center justify-between gap-2">
        <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.34em] text-moss sm:text-xs">
          Gym Buddy AI
        </p>
        <MobileNav active="dashboard" compact />
        <div className="flex items-center gap-2">
          <CalendarLinkButton compact />
          <SignOutButton compact />
        </div>
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
            {personalizedExercises.map((exercise, index) => (
              <div key={exercise.name} className="w-[88vw] max-w-[360px] shrink-0 sm:w-[360px]">
                <WorkoutCard exercise={exercise} index={index} experienceLevel={profile.experienceLevel} />
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
          <article className="ink-surface float-in rounded-[30px] px-5 py-5 text-cream sm:px-6 sm:py-6">
            <p className="text-xs uppercase tracking-[0.24em] text-cream/60">Today</p>
            <h2 className="mt-2 max-w-sm text-2xl font-semibold leading-tight sm:text-[2.35rem]">
              Let&apos;s build the right session.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-cream/80">
              We&apos;ll use your profile, recent activity, and recovery context before generating today&apos;s plan.
            </p>
          </article>

          <section className="card-surface rounded-[34px] border border-black/5 p-5 shadow-card sm:p-6">
            <GenerateWorkoutButton unresolvedDates={calendar.unresolvedDates} />
          </section>
        </section>
      )}
    </main>
  );
}
