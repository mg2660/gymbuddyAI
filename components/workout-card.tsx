import { ActionSubmitButton } from "@/components/action-submit-button";
import { saveExerciseCardFeedback } from "@/lib/actions/workouts";
import { hasSavedFeedback } from "@/lib/workout-personalization";
import type { ExperienceLevel, WorkoutExercise } from "@/lib/types";

interface WorkoutCardProps {
  exercise: WorkoutExercise;
  index: number;
  experienceLevel: ExperienceLevel;
}

function FeedbackPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-ink/78">
      {label}
    </span>
  );
}

function ProgressionBadge({ exercise }: { exercise: WorkoutExercise }) {
  if (!exercise.progression) {
    return null;
  }

  const toneClass =
    exercise.progression.action === "increase"
      ? "bg-moss text-cream"
      : exercise.progression.action === "decrease"
        ? "bg-clay text-white"
        : exercise.progression.action === "maintain"
          ? "bg-ink text-cream"
          : "bg-sand text-ink";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={["rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]", toneClass].join(" ")}>
          {exercise.progression.label}
        </span>
        <p className="text-xs uppercase tracking-[0.18em] text-moss">Next action</p>
      </div>
      <div className="rounded-[22px] border border-black/8 bg-white/70 px-4 py-3">
        <p className="text-sm font-semibold leading-6 text-ink">{exercise.progression.instruction}</p>
        <p className="mt-1 text-sm leading-6 text-ink/64">{exercise.progression.reason}</p>
      </div>
    </div>
  );
}

function SavedFeedbackSummary({ exercise }: { exercise: WorkoutExercise }) {
  if (!hasSavedFeedback(exercise)) {
    return null;
  }

  const items = [
    exercise.feedback?.completionStatus ? `Status: ${exercise.feedback.completionStatus}` : null,
    exercise.feedback?.difficulty ? `Feedback: ${exercise.feedback.difficulty.replaceAll("_", " ")}` : null,
    exercise.feedback?.loggedWeight ? `Weight: ${exercise.feedback.loggedWeight}` : null,
    exercise.feedback?.loggedReps ? `Reps: ${exercise.feedback.loggedReps}` : null,
    exercise.feedback?.loggedSets ? `Sets: ${exercise.feedback.loggedSets}` : null,
    exercise.feedback?.loggedRpe ? `RPE: ${exercise.feedback.loggedRpe}` : null,
    exercise.feedback?.notes ? `Note: ${exercise.feedback.notes}` : null,
  ].filter(Boolean);

  return (
    <div className="rounded-[22px] border border-moss/15 bg-moss/10 px-4 py-3 text-sm leading-6 text-ink/74">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">Saved feedback</p>
      <p className="mt-2">{items.join(" | ")}</p>
    </div>
  );
}

function BeginnerFeedback({ index }: { index: number }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-ink">How did this feel?</p>
        <p className="mt-1 text-sm leading-6 text-ink/70">Keep it simple. One tap is enough for today.</p>
      </div>

      <div className="grid gap-2">
        <form action={saveExerciseCardFeedback}>
          <input type="hidden" name="exerciseIndex" value={index} />
          <input type="hidden" name="completionStatus" value="completed" />
          <button
            type="submit"
            name="difficulty"
            value="just_right"
            className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-left text-sm font-medium text-ink transition hover:border-moss"
          >
            Felt good
          </button>
        </form>

        <form action={saveExerciseCardFeedback}>
          <input type="hidden" name="exerciseIndex" value={index} />
          <button
            type="submit"
            name="difficulty"
            value="need_clarity"
            className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-left text-sm font-medium text-ink transition hover:border-moss"
          >
            Need more guidance
          </button>
        </form>

        <form action={saveExerciseCardFeedback}>
          <input type="hidden" name="exerciseIndex" value={index} />
          <input type="hidden" name="completionStatus" value="substituted" />
          <button
            type="submit"
            name="difficulty"
            value="need_alternative"
            className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-left text-sm font-medium text-ink transition hover:border-moss"
          >
            Used the easier option
          </button>
        </form>
      </div>
    </div>
  );
}

function IntermediateFeedback({
  index,
  exercise,
}: {
  index: number;
  exercise: WorkoutExercise;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-ink">Quick adjustment</p>
        <p className="mt-1 text-sm leading-6 text-ink/70">
          Save one tap if you want the next suggestion to adapt automatically.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <form action={saveExerciseCardFeedback}>
          <input type="hidden" name="exerciseIndex" value={index} />
          <input type="hidden" name="completionStatus" value="completed" />
          <button
            type="submit"
            name="difficulty"
            value="too_easy"
            className="w-full rounded-2xl border border-black/10 bg-white/80 px-3 py-3 text-sm font-semibold text-ink transition hover:border-moss"
          >
            +2.5kg
          </button>
        </form>

        <form action={saveExerciseCardFeedback}>
          <input type="hidden" name="exerciseIndex" value={index} />
          <input type="hidden" name="completionStatus" value="completed" />
          <button
            type="submit"
            name="difficulty"
            value="just_right"
            className="w-full rounded-2xl border border-black/10 bg-white/80 px-3 py-3 text-sm font-semibold text-ink transition hover:border-moss"
          >
            Same
          </button>
        </form>

        <form action={saveExerciseCardFeedback}>
          <input type="hidden" name="exerciseIndex" value={index} />
          <input type="hidden" name="completionStatus" value="completed" />
          <button
            type="submit"
            name="difficulty"
            value="too_hard"
            className="w-full rounded-2xl border border-black/10 bg-white/80 px-3 py-3 text-sm font-semibold text-ink transition hover:border-moss"
          >
            Too hard
          </button>
        </form>
      </div>

      <form action={saveExerciseCardFeedback} className="space-y-3 rounded-[24px] bg-white/65 p-4">
        <input type="hidden" name="exerciseIndex" value={index} />
        <input type="hidden" name="completionStatus" value="completed" />

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5 text-sm text-ink/72">
            <span>Weight</span>
            <input
              name="loggedWeight"
              defaultValue={exercise.feedback?.loggedWeight ?? ""}
              placeholder="12.5kg"
              className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
            />
          </label>
          <label className="space-y-1.5 text-sm text-ink/72">
            <span>Reps</span>
            <input
              name="loggedReps"
              type="number"
              min={1}
              defaultValue={exercise.feedback?.loggedReps ?? ""}
              placeholder="10"
              className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
            />
          </label>
        </div>

        <ActionSubmitButton label="Save result" loadingLabel="Saving..." variant="secondary" />
      </form>
    </div>
  );
}

function AdvancedFeedback({
  index,
  exercise,
}: {
  index: number;
  exercise: WorkoutExercise;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-ink">Performance log</p>
        <p className="mt-1 text-sm leading-6 text-ink/70">
          Capture the working result so the next prescription can be tighter.
        </p>
      </div>

      <form action={saveExerciseCardFeedback} className="space-y-3 rounded-[24px] bg-white/65 p-4">
        <input type="hidden" name="exerciseIndex" value={index} />
        <input type="hidden" name="completionStatus" value="completed" />

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5 text-sm text-ink/72">
            <span>Weight / %</span>
            <input
              name="loggedWeight"
              defaultValue={exercise.feedback?.loggedWeight ?? ""}
              placeholder="80kg or 80% 1RM"
              className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
            />
          </label>
          <label className="space-y-1.5 text-sm text-ink/72">
            <span>RPE / effort</span>
            <input
              name="loggedRpe"
              defaultValue={exercise.feedback?.loggedRpe ?? ""}
              placeholder="8.5"
              className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
            />
          </label>
          <label className="space-y-1.5 text-sm text-ink/72">
            <span>Sets</span>
            <input
              name="loggedSets"
              type="number"
              min={1}
              defaultValue={exercise.feedback?.loggedSets ?? exercise.sets}
              className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
            />
          </label>
          <label className="space-y-1.5 text-sm text-ink/72">
            <span>Reps</span>
            <input
              name="loggedReps"
              type="number"
              min={1}
              defaultValue={exercise.feedback?.loggedReps ?? ""}
              className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
            />
          </label>
        </div>

        <label className="block space-y-1.5 text-sm text-ink/72">
          <span>Notes</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={exercise.feedback?.notes ?? ""}
            placeholder="Bar speed slowed on set 4, left 1 rep in reserve."
            className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-moss"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="submit"
            name="difficulty"
            value="just_right"
            className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-ink transition hover:border-moss"
          >
            On target
          </button>
          <button
            type="submit"
            name="difficulty"
            value="too_hard"
            className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold text-ink transition hover:border-moss"
          >
            Too hard
          </button>
        </div>

        <ActionSubmitButton label="Save performance" loadingLabel="Saving..." variant="secondary" />
      </form>
    </div>
  );
}

function ExerciseFeedbackSection({
  exercise,
  index,
  experienceLevel,
}: {
  exercise: WorkoutExercise;
  index: number;
  experienceLevel: ExperienceLevel;
}) {
  if (experienceLevel === "beginner") {
    return <BeginnerFeedback index={index} />;
  }

  if (experienceLevel === "advanced") {
    return <AdvancedFeedback index={index} exercise={exercise} />;
  }

  return <IntermediateFeedback index={index} exercise={exercise} />;
}

export function WorkoutCard({ exercise, index, experienceLevel }: WorkoutCardProps) {
  const cueTitle = experienceLevel === "beginner" ? "Form cues" : "Execution cues";

  return (
    <article className="card-surface flex min-h-[70svh] snap-center flex-col justify-between rounded-[32px] border border-black/5 p-6 shadow-card sm:min-h-[560px] sm:p-7">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-moss">Exercise {index + 1}</p>
            <h3 className="mt-2 text-[1.75rem] font-semibold leading-tight text-ink">{exercise.name}</h3>
          </div>
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink">{exercise.muscleGroup}</span>
        </div>

        {experienceLevel === "beginner" ? (
          <div className="space-y-3">
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

            <ProgressionBadge exercise={exercise} />

            {exercise.lastPerformance ? (
              <div className="rounded-[24px] bg-white/60 px-4 py-4 text-sm leading-6 text-ink/72">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">Last time</p>
                <p className="mt-2">{exercise.lastPerformance}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {experienceLevel === "intermediate" ? (
          <div className="grid gap-3">
            <ProgressionBadge exercise={exercise} />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[24px] bg-white/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-moss">Last performance</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-ink">
                  {exercise.lastPerformance ?? "No saved history yet"}
                </p>
              </div>
              <div className="rounded-[24px] bg-white/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-moss">Today</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-ink">
                  {exercise.loadGuidance ?? `Work across ${exercise.reps}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FeedbackPill label={`${exercise.sets} sets`} />
              <FeedbackPill label={`${exercise.reps} reps`} />
              <FeedbackPill label={`${exercise.restSeconds}s rest`} />
            </div>
          </div>
        ) : null}

        {experienceLevel === "advanced" ? (
          <div className="grid grid-cols-2 gap-3 text-sm text-ink/78">
            <div className="col-span-2">
              <ProgressionBadge exercise={exercise} />
            </div>
            <div className="rounded-[24px] bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-moss">Target</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink">
                {exercise.loadGuidance ?? exercise.intensityTarget ?? `${exercise.sets} x ${exercise.reps}`}
              </p>
            </div>
            <div className="rounded-[24px] bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-moss">Tempo</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink">{exercise.tempo ?? "Controlled"}</p>
            </div>
            <div className="rounded-[24px] bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-moss">Rest</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink">{exercise.restSeconds}s strict rest</p>
            </div>
            <div className="rounded-[24px] bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-moss">Technique</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink">
                {exercise.advancedTechnique ?? "Clean execution over grinders"}
              </p>
            </div>

            {exercise.lastPerformance ? (
              <div className="col-span-2 rounded-[24px] bg-white/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-moss">Last performance</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-ink">{exercise.lastPerformance}</p>
              </div>
            ) : null}

            {exercise.fatigueNote ? (
              <div className="col-span-2 rounded-[24px] bg-moss px-4 py-4 text-sm leading-6 text-cream">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream/65">Fatigue management</p>
                <p className="mt-2">{exercise.fatigueNote}</p>
              </div>
            ) : null}
          </div>
        ) : null}

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
          <p className="text-sm font-semibold text-ink">{cueTitle}</p>
          <ul className="space-y-1 text-sm text-ink/75">
            {exercise.tips.map((tip) => (
              <li key={tip}>* {tip}</li>
            ))}
          </ul>
        </div>

        {exercise.substitute ? (
          <div className="rounded-[22px] bg-sand/70 px-4 py-3 text-sm leading-6 text-ink/76">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
              {experienceLevel === "beginner" ? "Easier option" : "Fallback option"}
            </p>
            <p className="mt-2">{exercise.substitute}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        <SavedFeedbackSummary exercise={exercise} />
        <ExerciseFeedbackSection exercise={exercise} index={index} experienceLevel={experienceLevel} />
      </div>
    </article>
  );
}
