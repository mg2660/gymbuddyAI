import { ActionSubmitButton } from "@/components/action-submit-button";
import { TodaySpecialRequestInput } from "@/components/today-special-request-input";
import { getShortMonthDayLabel, getShortWeekdayLabel } from "@/lib/date";
import { generateTodaysWorkout } from "@/lib/actions/workouts";

interface GenerateWorkoutButtonProps {
  defaultSpecialRequest?: string;
  unresolvedDates?: string[];
}

export function GenerateWorkoutButton({
  defaultSpecialRequest,
  unresolvedDates = [],
}: GenerateWorkoutButtonProps) {
  return (
    <form action={generateTodaysWorkout} className="space-y-5">
      {unresolvedDates.length > 0 ? (
        <section className="rounded-[28px] border border-clay/20 bg-sand/55 p-4 sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">Before we generate</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">Help us fill the missing days</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/72">
              We found recent dates without a logged workout. Tell GymBuddy whether you trained outside the app,
              took a planned rest day, or missed the session, and add notes if anything matters for recovery.
            </p>
          </div>

          <div className="mt-4 space-y-4">
            {unresolvedDates.map((date) => (
              <div key={date} className="rounded-[24px] bg-white/75 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sand px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                    {getShortWeekdayLabel(date)}
                  </span>
                  <p className="text-sm font-semibold text-ink">{getShortMonthDayLabel(date)}</p>
                </div>

                <div className="mt-3 grid gap-2">
                  <label className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink transition hover:border-moss has-[:checked]:border-moss">
                    <input
                      type="radio"
                      name={`activityStatus__${date}`}
                      value="completed_elsewhere"
                      className="mr-2"
                      required
                    />
                    Worked out outside GymBuddy
                  </label>

                  <label className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink transition hover:border-moss has-[:checked]:border-moss">
                    <input type="radio" name={`activityStatus__${date}`} value="rest_day" className="mr-2" required />
                    Planned rest day
                  </label>

                  <label className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink transition hover:border-moss has-[:checked]:border-moss">
                    <input type="radio" name={`activityStatus__${date}`} value="missed" className="mr-2" required />
                    Missed it
                  </label>
                </div>

                <textarea
                  name={`activityNotes__${date}`}
                  rows={2}
                  className="mt-3 w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-moss"
                  placeholder="Optional note: played football, deliberate recovery day, travel, low sleep, soreness, etc."
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <TodaySpecialRequestInput defaultValue={defaultSpecialRequest} />
      <ActionSubmitButton label="Generate Today&apos;s Workout" loadingLabel="Building workout..." />
    </form>
  );
}
