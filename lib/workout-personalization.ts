import { experienceLevelDetails } from "@/lib/onboarding";
import type {
  ExperienceLevel,
  ExerciseDifficultyFeedback,
  WorkoutExercise,
  WorkoutExerciseProgression,
  WorkoutSession,
} from "@/lib/types";

const difficultyLabels: Record<ExerciseDifficultyFeedback, string> = {
  too_easy: "felt easy",
  just_right: "felt right",
  too_hard: "felt hard",
  need_clarity: "needed more guidance",
  need_alternative: "needed an easier option",
};

function normalizeExerciseName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function parseWeight(value?: string) {
  if (!value) {
    return null;
  }

  const match = value.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|lb|lbs)?/i);

  if (!match) {
    return null;
  }

  return {
    value: Number(match[1]),
    unit: (match[2] ?? "kg").toLowerCase().replace("kgs", "kg").replace("lbs", "lb"),
  };
}

function getProgressionStep(unit: string, currentWeight: number) {
  if (unit === "lb") {
    return currentWeight >= 100 ? 10 : 5;
  }

  return currentWeight >= 40 ? 5 : 2.5;
}

function formatWeight(value: number, unit: string) {
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
  return `${rounded}${unit}`;
}

function getRepRange(reps: string) {
  const rangeMatch = reps.match(/(\d+)\s*-\s*(\d+)/);

  if (rangeMatch) {
    return {
      low: Number(rangeMatch[1]),
      high: Number(rangeMatch[2]),
    };
  }

  const singleMatch = reps.match(/(\d+)/);

  if (!singleMatch) {
    return null;
  }

  const value = Number(singleMatch[1]);
  return {
    low: value,
    high: value,
  };
}

function formatLastPerformance(exercise: WorkoutExercise) {
  const feedback = exercise.feedback;
  const parts: string[] = [];

  if (feedback?.loggedWeight && feedback.loggedReps) {
    parts.push(`${feedback.loggedWeight} x ${feedback.loggedReps}`);
  } else if (feedback?.loggedReps) {
    parts.push(`${feedback.loggedReps} reps`);
  } else if (exercise.lastPerformance) {
    parts.push(exercise.lastPerformance);
  }

  if (feedback?.loggedSets) {
    parts.push(`${feedback.loggedSets} sets`);
  }

  if (feedback?.difficulty) {
    parts.push(difficultyLabels[feedback.difficulty]);
  }

  return parts.join(" | ");
}

function findLatestExerciseHistory(
  sessions: WorkoutSession[],
  exerciseName: string,
): WorkoutExercise | undefined {
  const normalizedTarget = normalizeExerciseName(exerciseName);

  for (const session of sessions) {
    const match = session.exercises.find(
      (exercise) => normalizeExerciseName(exercise.name) === normalizedTarget,
    );

    if (match) {
      return match;
    }
  }

  return undefined;
}

function buildFallbackInstruction(exercise: WorkoutExercise, experienceLevel: ExperienceLevel) {
  if (experienceLevel === "beginner") {
    return "Start with a light-to-moderate load you can control for every rep.";
  }

  if (experienceLevel === "advanced") {
    return exercise.intensityTarget
      ? `Build to ${exercise.intensityTarget} and keep 1-2 reps in reserve.`
      : "Build to a strong working load without grinding reps.";
  }

  return "Pick a working weight that leaves 1-2 good reps in reserve.";
}

function buildStartProgression(
  exercise: WorkoutExercise,
  experienceLevel: ExperienceLevel,
): WorkoutExerciseProgression {
  return {
    action: "start",
    label: "NEW",
    instruction: buildFallbackInstruction(exercise, experienceLevel),
    reason: "No matching history yet, so establish a clean baseline today.",
    source: "fallback",
  };
}

function buildDecisionFromHistory(
  exercise: WorkoutExercise,
  previous: WorkoutExercise,
  experienceLevel: ExperienceLevel,
): WorkoutExerciseProgression {
  const previousWeight = parseWeight(previous.feedback?.loggedWeight);
  const previousReps = previous.feedback?.loggedReps;
  const difficulty = previous.feedback?.difficulty;
  const repRange = getRepRange(exercise.reps);

  if (previousWeight) {
    const step = getProgressionStep(previousWeight.unit, previousWeight.value);

    if (difficulty === "too_hard") {
      const nextWeight = Math.max(previousWeight.value - step, 0);
      return {
        action: "decrease",
        label: `DOWN ${formatWeight(step, previousWeight.unit)}`,
        instruction: `Reduce to ${formatWeight(nextWeight, previousWeight.unit)} for ${exercise.reps}.`,
        reason: "Last session was marked too hard, so back off one step and rebuild quality.",
        targetWeight: formatWeight(nextWeight, previousWeight.unit),
        source: "history",
      };
    }

    if (difficulty === "too_easy") {
      const nextWeight = previousWeight.value + step;
      return {
        action: "increase",
        label: `UP ${formatWeight(step, previousWeight.unit)}`,
        instruction: `Increase to ${formatWeight(nextWeight, previousWeight.unit)} for ${exercise.reps}.`,
        reason: "Last session felt easy, so move up one clear progression step.",
        targetWeight: formatWeight(nextWeight, previousWeight.unit),
        source: "history",
      };
    }

    if (difficulty === "need_alternative") {
      return {
        action: "decrease",
        label: "EASIER",
        instruction: `Reduce load or use the fallback option for ${exercise.reps}.`,
        reason: "The previous attempt needed an easier variation, so keep today clearly more manageable.",
        source: "history",
      };
    }

    if (difficulty === "need_clarity") {
      return {
        action: "maintain",
        label: "SAME",
        instruction: `Maintain ${formatWeight(previousWeight.value, previousWeight.unit)} and prioritize clean form for ${exercise.reps}.`,
        reason: "Form confidence was the limiter, so do not increase until execution feels clearer.",
        targetWeight: formatWeight(previousWeight.value, previousWeight.unit),
        source: "history",
      };
    }

    if (repRange && previousReps && previousReps >= repRange.high) {
      const nextWeight = previousWeight.value + step;
      return {
        action: "increase",
        label: `UP ${formatWeight(step, previousWeight.unit)}`,
        instruction: `Increase to ${formatWeight(nextWeight, previousWeight.unit)} for ${exercise.reps}.`,
        reason: "You hit the top of the target rep range, so progression should move to the next load.",
        targetWeight: formatWeight(nextWeight, previousWeight.unit),
        source: "history",
      };
    }

    if (repRange && previousReps && previousReps < repRange.low) {
      return {
        action: "maintain",
        label: "SAME",
        instruction: `Maintain ${formatWeight(previousWeight.value, previousWeight.unit)} and reach at least ${repRange.low} reps before increasing.`,
        reason: "The previous set did not yet clear the target range, so hold the load steady.",
        targetWeight: formatWeight(previousWeight.value, previousWeight.unit),
        source: "history",
      };
    }

    return {
      action: "maintain",
      label: "SAME",
      instruction:
        difficulty === "just_right"
          ? `Maintain ${formatWeight(previousWeight.value, previousWeight.unit)} and try to beat last time within ${exercise.reps}.`
          : `Maintain ${formatWeight(previousWeight.value, previousWeight.unit)} for ${exercise.reps}.`,
      reason:
        difficulty === "just_right"
          ? "Last session was on target, so keep the load and earn the next increase with more reps or cleaner work."
          : "Current data supports keeping the same load for the next session.",
      targetWeight: formatWeight(previousWeight.value, previousWeight.unit),
      source: "history",
    };
  }

  if (difficulty === "too_hard") {
    return {
      action: "decrease",
      label: "LIGHTER",
      instruction: `Reduce load slightly and keep the reps at ${exercise.reps}.`,
      reason: "No exact weight was logged, but the last attempt was flagged too hard.",
      source: "history",
    };
  }

  if (difficulty === "too_easy") {
    return {
      action: "increase",
      label: "HEAVIER",
      instruction: `Increase load slightly and keep the reps at ${exercise.reps}.`,
      reason: "No exact weight was logged, but the last attempt was flagged too easy.",
      source: "history",
    };
  }

  return {
    action: "maintain",
    label: "BASELINE",
    instruction:
      previousReps && repRange
        ? `Use a similar load and aim to move from ${previousReps} reps toward the top of ${exercise.reps}.`
        : buildFallbackInstruction(exercise, experienceLevel),
    reason: "History exists, but the logged data is incomplete, so use the previous effort as a stable baseline.",
    source: "history",
  };
}

export function getDeterministicProgression(
  exercise: WorkoutExercise,
  previous: WorkoutExercise | undefined,
  experienceLevel: ExperienceLevel,
) {
  return previous
    ? buildDecisionFromHistory(exercise, previous, experienceLevel)
    : buildStartProgression(exercise, experienceLevel);
}

export function personalizeWorkoutExercise(
  exercise: WorkoutExercise,
  experienceLevel: ExperienceLevel,
  sessions: WorkoutSession[],
): WorkoutExercise {
  const previous = findLatestExerciseHistory(sessions, exercise.name);
  const previousPerformance = previous ? formatLastPerformance(previous) : undefined;
  const progression = getDeterministicProgression(exercise, previous, experienceLevel);

  if (experienceLevel === "advanced") {
    return {
      ...exercise,
      lastPerformance: previousPerformance,
      loadGuidance: progression.instruction,
      progression,
      intensityTarget: exercise.intensityTarget ?? "RPE 8-9",
      tempo: exercise.tempo ?? "Controlled tempo",
      fatigueNote: exercise.fatigueNote ?? "Stop 1-2 reps before breakdown in form.",
    };
  }

  return {
    ...exercise,
    lastPerformance: previousPerformance,
    loadGuidance: progression.instruction,
    progression,
  };
}

export function personalizeWorkoutExercises(
  exercises: WorkoutExercise[],
  experienceLevel: ExperienceLevel,
  sessions: WorkoutSession[],
) {
  return exercises.map((exercise) => personalizeWorkoutExercise(exercise, experienceLevel, sessions));
}

export function getExperienceCardCopy(experienceLevel: ExperienceLevel) {
  return experienceLevelDetails[experienceLevel];
}

export function hasSavedFeedback(exercise: WorkoutExercise) {
  return Boolean(
    exercise.feedback?.completionStatus ||
      exercise.feedback?.difficulty ||
      exercise.feedback?.loggedWeight ||
      exercise.feedback?.loggedReps ||
      exercise.feedback?.loggedSets ||
      exercise.feedback?.loggedRpe ||
      exercise.feedback?.notes,
  );
}
