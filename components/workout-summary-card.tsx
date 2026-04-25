import type { WorkoutRecommendation } from "@/lib/types";

interface WorkoutSummaryCardProps {
  recommendation: WorkoutRecommendation;
  variant: "overview" | "why";
}

export function WorkoutSummaryCard({ recommendation, variant }: WorkoutSummaryCardProps) {
  if (variant === "why") {
    return (
      <article className="ink-surface flex min-h-[70svh] snap-center flex-col justify-between rounded-[32px] p-6 text-cream sm:min-h-[560px] sm:p-7">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cream/60">Finish Card</p>
            <h3 className="mt-2 text-[1.55rem] font-semibold leading-tight">Why this works today</h3>
          </div>

          <div className="space-y-3">
            {recommendation.rationale.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-4 text-sm leading-6 text-cream/82"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-4 text-sm leading-6 text-cream/74">
          Swipe back through the exercise cards if you want to review the session before marking it done.
        </div>
      </article>
    );
  }

  return (
    <article className="ink-surface flex min-h-[70svh] snap-center flex-col justify-between rounded-[32px] p-6 text-cream sm:min-h-[560px] sm:p-7">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cream/60">Summary Card</p>
          <h3 className="mt-2 text-[1.55rem] font-semibold leading-tight">{recommendation.title}</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-cream/78">
            {recommendation.focus.replaceAll("_", " ")}
          </span>
          {recommendation.todaySpecialRequest ? (
            <span className="rounded-full bg-clay px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white">
              Today: {recommendation.todaySpecialRequest}
            </span>
          ) : null}
        </div>

        <div className="space-y-3">
          {recommendation.summaryBullets.map((item) => (
            <div
              key={item}
              className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-4 text-sm leading-6 text-cream/84"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-4 text-sm leading-6 text-cream/74">
        Summary stays in the same card rail so the whole workout feels like one flow.
      </div>
    </article>
  );
}
