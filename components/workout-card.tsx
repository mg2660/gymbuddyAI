import type { WorkoutExercise } from "@/lib/types";

interface WorkoutCardProps {
  exercise: WorkoutExercise;
  index: number;
}

export function WorkoutCard({ exercise, index }: WorkoutCardProps) {
  return (
    <article className="card-surface flex min-h-[70svh] snap-center flex-col justify-between rounded-[32px] border border-black/5 p-6 shadow-card sm:min-h-[560px] sm:p-7">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-moss">Exercise {index + 1}</p>
            <h3 className="mt-2 text-[1.75rem] font-semibold leading-tight text-ink">{exercise.name}</h3>
          </div>
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink">
            {exercise.muscleGroup}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm text-ink/75">
          <div className="rounded-2xl bg-white/60 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-moss">Sets</p>
            <p className="mt-1 text-lg font-semibold text-ink">{exercise.sets}</p>
          </div>
          <div className="rounded-2xl bg-white/60 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-moss">Reps</p>
            <p className="mt-1 text-lg font-semibold text-ink">{exercise.reps}</p>
          </div>
          <div className="rounded-2xl bg-white/60 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-moss">Rest</p>
            <p className="mt-1 text-lg font-semibold text-ink">{exercise.restSeconds}s</p>
          </div>
        </div>

        {exercise.warmup && exercise.warmup.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink">Warmup</p>
            <ul className="space-y-1 text-sm text-ink/75">
              {exercise.warmup.map((item) => (
                <li key={item}>* {item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">Tips</p>
          <ul className="space-y-1 text-sm text-ink/75">
            {exercise.tips.map((tip) => (
              <li key={tip}>* {tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {exercise.substitute ? (
        <p className="mt-6 rounded-2xl bg-moss px-4 py-3 text-sm text-cream">
          Substitute if needed: {exercise.substitute}
        </p>
      ) : null}
    </article>
  );
}
