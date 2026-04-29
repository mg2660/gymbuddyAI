import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarLinkButton } from "@/components/calendar-link-button";
import { MobileNav } from "@/components/mobile-nav";
import { SectionHeading } from "@/components/section-heading";
import { SignOutButton } from "@/components/sign-out-button";
import { WorkoutCalendar } from "@/components/workout-calendar";
import { getCurrentUserWorkoutCalendar } from "@/lib/data/workouts";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const viewOptions = [
  {
    key: "overview",
    label: "Overview",
    description: "Quick 14-day snapshot",
  },
  {
    key: "weeks",
    label: "Weeks",
    description: "7-day strips",
  },
  {
    key: "log",
    label: "Log",
    description: "Detailed daily list",
  },
] as const;

const rangeOptions = [
  { key: "14", label: "2 weeks" },
  { key: "28", label: "4 weeks" },
  { key: "56", label: "8 weeks" },
] as const;

function normalizeView(value?: string) {
  return value === "overview" || value === "weeks" || value === "log" ? value : "weeks";
}

function normalizeRange(value?: string) {
  if (value === "14" || value === "28" || value === "56") {
    return Number(value);
  }

  return 28;
}

function buildCalendarHref(view: string, range: number) {
  return `/calendar?view=${view}&range=${range}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string; range?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const params = (await searchParams) ?? {};
  const activeView = normalizeView(params.view);
  const activeRange = normalizeRange(params.range);
  const calendar = await getCurrentUserWorkoutCalendar(activeRange);

  return (
    <main className="screen-fade mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
      <header className="flex items-center justify-between gap-2">
        <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.34em] text-moss sm:text-xs">
          Gym Buddy AI
        </p>
        <MobileNav active="calendar" compact />
        <div className="flex items-center gap-2">
          <CalendarLinkButton compact />
          <SignOutButton compact />
        </div>
      </header>

      <section className="card-surface rounded-[34px] border border-black/5 p-5 shadow-card sm:p-6">
        <SectionHeading
          eyebrow="Calendar"
          title="Your training rhythm"
          description=""
        />

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">View Mode</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {viewOptions.map((option) => {
                const isActive = option.key === activeView;

                return (
                  <Link
                    key={option.key}
                    href={buildCalendarHref(option.key, activeRange)}
                    className={[
                      "rounded-[24px] border px-4 py-4 transition",
                      isActive
                        ? "border-ink bg-ink text-cream shadow-card"
                        : "border-black/10 bg-white/75 text-ink hover:border-moss",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className={["mt-1 text-xs leading-5", isActive ? "text-cream/76" : "text-ink/62"].join(" ")}>
                      {option.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Time Window</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {rangeOptions.map((option) => {
                const isActive = Number(option.key) === activeRange;

                return (
                  <Link
                    key={option.key}
                    href={buildCalendarHref(activeView, Number(option.key))}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      isActive ? "bg-clay text-white" : "bg-white/80 text-ink hover:bg-white",
                    ].join(" ")}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <WorkoutCalendar days={calendar.calendarDays} view={activeView} />
    </main>
  );
}
