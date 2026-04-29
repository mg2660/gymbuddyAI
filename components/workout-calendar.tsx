import { getMonthYearLabel, getShortMonthDayLabel } from "@/lib/date";
import type { WorkoutCalendarDay } from "@/lib/types";

interface WorkoutCalendarProps {
  days: WorkoutCalendarDay[];
  view?: "overview" | "weeks" | "log";
}

const statusStyles: Record<WorkoutCalendarDay["status"], string> = {
  completed_in_app: "border-moss/20 bg-moss text-cream",
  completed_elsewhere: "border-clay/20 bg-clay text-white",
  rest_day: "border-sand bg-sand text-ink",
  missed: "border-black/15 bg-ink text-cream",
  unresolved: "border-clay/20 bg-white text-ink",
  idle: "border-black/10 bg-white/75 text-ink/72",
};

const statusLabels: Record<WorkoutCalendarDay["status"], string> = {
  completed_in_app: "GymBuddy workout",
  completed_elsewhere: "Outside workout",
  rest_day: "Rest day",
  missed: "Missed day",
  unresolved: "Needs review",
  idle: "No entry",
};

const statusDots: Record<WorkoutCalendarDay["status"], string> = {
  completed_in_app: "bg-cream/90",
  completed_elsewhere: "bg-white/90",
  rest_day: "bg-ink/70",
  missed: "bg-cream/90",
  unresolved: "bg-clay",
  idle: "bg-black/15",
};

function chunkDays(days: WorkoutCalendarDay[], size: number) {
  const chunks: WorkoutCalendarDay[][] = [];

  for (let index = 0; index < days.length; index += size) {
    chunks.push(days.slice(index, index + size));
  }

  return chunks;
}

function buildStatusCounts(days: WorkoutCalendarDay[]) {
  return days.reduce(
    (counts, day) => {
      counts[day.status] += 1;
      return counts;
    },
    {
      completed_in_app: 0,
      completed_elsewhere: 0,
      rest_day: 0,
      missed: 0,
      unresolved: 0,
      idle: 0,
    } satisfies Record<WorkoutCalendarDay["status"], number>,
  );
}

function OverviewView({ days }: { days: WorkoutCalendarDay[] }) {
  const recent = days.slice(-14);
  const counts = buildStatusCounts(days);

  return (
    <section className="space-y-5">
      <div className="card-surface rounded-[34px] border border-black/5 p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-[24px] bg-white/75 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-moss">GymBuddy</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{counts.completed_in_app}</p>
          </div>
          <div className="rounded-[24px] bg-white/75 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-moss">Elsewhere</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{counts.completed_elsewhere}</p>
          </div>
          <div className="rounded-[24px] bg-white/75 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-moss">Rest</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{counts.rest_day}</p>
          </div>
          <div className="rounded-[24px] bg-white/75 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-moss">Needs review</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{counts.unresolved}</p>
          </div>
        </div>
      </div>

      <div className="card-surface rounded-[34px] border border-black/5 p-5 shadow-card sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Last 14 Days</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Fast mobile snapshot</h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-ink/68">
            Best for quick scanning. Tap into `Weeks` or `Log` when you want more context.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-7">
          {recent.map((day) => (
            <article
              key={day.date}
              className={[
                "rounded-[22px] border p-3 transition",
                statusStyles[day.status],
                day.isToday ? "ring-2 ring-clay/40" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">{day.dayLabel}</p>
                  <p className="mt-2 text-xl font-semibold">{day.dayNumber}</p>
                </div>
                <span className={["mt-1 h-2.5 w-2.5 rounded-full", statusDots[day.status]].join(" ")} />
              </div>
              <p className="mt-2 text-[11px] leading-5">{statusLabels[day.status]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WeeksView({ days }: { days: WorkoutCalendarDay[] }) {
  const weeks = chunkDays(days, 7);

  return (
    <section className="space-y-4">
      {weeks.map((week, index) => (
        <article key={`${week[0]?.date}-${index}`} className="card-surface rounded-[30px] border border-black/5 p-4 shadow-card sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Week {index + 1}</p>
              <h2 className="mt-1 text-lg font-semibold text-ink">
                {getShortMonthDayLabel(week[0].date)} to {getShortMonthDayLabel(week[week.length - 1].date)}
              </h2>
            </div>
            <span className="rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/70">
              7-day strip
            </span>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {week.map((day) => (
              <article
                key={day.date}
                className={[
                  "rounded-[20px] border p-2.5 text-center transition",
                  statusStyles[day.status],
                  day.isToday ? "ring-2 ring-clay/40" : "",
                ].join(" ")}
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] opacity-70">{day.dayLabel}</p>
                <p className="mt-2 text-lg font-semibold">{day.dayNumber}</p>
                <span className={["mx-auto mt-2 block h-2 w-2 rounded-full", statusDots[day.status]].join(" ")} />
              </article>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function LogView({ days }: { days: WorkoutCalendarDay[] }) {
  let previousMonthLabel = "";

  return (
    <section className="space-y-3">
      {days.map((day) => {
        const monthLabel = getMonthYearLabel(day.date);
        const showMonthLabel = monthLabel !== previousMonthLabel;
        previousMonthLabel = monthLabel;

        return (
          <div key={day.date} className="space-y-3">
            {showMonthLabel ? (
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.22em] text-moss">{monthLabel}</p>
            ) : null}

            <article className="card-surface rounded-[26px] border border-black/5 p-4 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">{day.dayLabel}</p>
                  <h3 className="mt-1 text-lg font-semibold text-ink">{getShortMonthDayLabel(day.date)}</h3>
                </div>
                <span
                  className={[
                    "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]",
                    statusStyles[day.status],
                  ].join(" ")}
                >
                  {statusLabels[day.status]}
                </span>
              </div>

              {day.notes ? (
                <p className="mt-3 text-sm leading-6 text-ink/74">{day.notes}</p>
              ) : (
                <p className="mt-3 text-sm leading-6 text-ink/52">
                  {day.status === "idle" ? "No saved note for this day." : "No extra note saved."}
                </p>
              )}
            </article>
          </div>
        );
      })}
    </section>
  );
}

export function WorkoutCalendar({ days, view = "weeks" }: WorkoutCalendarProps) {
  if (days.length === 0) {
    return null;
  }

  if (view === "overview") {
    return <OverviewView days={days} />;
  }

  if (view === "log") {
    return <LogView days={days} />;
  }

  return <WeeksView days={days} />;
}
