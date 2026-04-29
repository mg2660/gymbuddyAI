import { experienceLevelDetails } from "@/lib/onboarding";
import type {
  ExperienceLevel,
  ExerciseDifficultyFeedback,
  WorkoutExercise,
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

function getUpperRepTarget(reps: string) {
  const rangeMatch = reps.match(/(\d+)\s*-\s*(\d+)/);

  if (rangeMatch) {
    return Number(rangeMatch[2]);
  }

  const singleMatch = reps.match(/(\d+)/);
  return singleMatch ? Number(singleMatch[1]) : null;
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

function inferGuidedLoadSuggestion(exercise: WorkoutExercise, previous?: WorkoutExercise) {
  if (exercise.loadGuidance) {
    return exercise.loadGuidance;
  }

  if (previous?.feedback?.difficulty === "too_hard") {
    return "Start lighter than last time and aim for smooth, controlled reps.";
  }

  if (previous?.feedback?.difficulty === "too_easy") {
    return "Start light, then move slightly heavier only if every rep still feels clean.";
  }

  if (previous?.feedback?.loggedWeight) {
    return `Use a comfortable load near your last session (${previous.feedback.loggedWeight}) if form still feels solid.`;
  }

  return "Start with a light-to-moderate load you can control for every rep.";
}

function inferIntermediateLoadSuggestion(exercise: WorkoutExercise, previous?: WorkoutExercise) {
  if (exercise.loadGuidance) {
    return exercise.loadGuidance;
  }

  const previousWeight = parseWeight(previous?.feedback?.loggedWeight);

  if (!previousWeight) {
    return "Find a working weight that leaves 1-2 good reps in reserve.";
  }

  const previousReps = previous?.feedback?.loggedReps;
  const difficulty = previous?.feedback?.difficulty;
  const repCeiling = getUpperRepTarget(exercise.reps);
  let nextWeight = previousWeight.value;

  if (difficulty === "too_easy") {
    nextWeight += getProgressionStep(previousWeight.unit, previousWeight.value);
  } else if (difficulty === "too_hard") {
    nextWeight = Math.max(previousWeight.value - getProgressionStep(previousWeight.unit, previousWeight.value), 0);
  } else if (difficulty !== "need_alternative" && repCeiling && previousReps && previousReps >= repCeiling) {
    nextWeight += getProgressionStep(previousWeight.unit, previousWeight.value);
  }

  return `Try ${formatWeight(nextWeight, previousWeight.unit)} for ${exercise.reps}.`;
}

function inferAdvancedLoadSuggestion(exercise: WorkoutExercise, previous?: WorkoutExercise) {
  if (exercise.loadGuidance) {
    return exercise.loadGuidance;
  }

  const previousWeight = parseWeight(previous?.feedback?.loggedWeight);

  if (!previousWeight) {
    return exercise.intensityTarget
      ? `Work up to ${exercise.intensityTarget}.`
      : "Build to a strong working load without grinding reps.";
  }

  const step = getProgressionStep(previousWeight.unit, previousWeight.value);
  const difficulty = previous?.feedback?.difficulty;
  const nextWeight =
    difficulty === "too_easy"
      ? previousWeight.value + step
      : difficulty === "too_hard"
        ? Math.max(previousWeight.value - step, 0)
        : previousWeight.value;

  return `Planned load: ${formatWeight(nextWeight, previousWeight.unit)}${exercise.intensityTarget ? ` at ${exercise.intensityTarget}` : ""}.`;
}

export function personalizeWorkoutExercise(
  exercise: WorkoutExercise,
  experienceLevel: ExperienceLevel,
  sessions: WorkoutSession[],
): WorkoutExercise {
  const previous = findLatestExerciseHistory(sessions, exercise.name);
  const previousPerformance = previous ? formatLastPerformance(previous) : undefined;

  if (experienceLevel === "beginner") {
    return {
      ...exercise,
      lastPerformance: previousPerformance,
      loadGuidance: inferGuidedLoadSuggestion(exercise, previous),
    };
  }

  if (experienceLevel === "advanced") {
    return {
      ...exercise,
      lastPerformance: previousPerformance,
      loadGuidance: inferAdvancedLoadSuggestion(exercise, previous),
      intensityTarget: exercise.intensityTarget ?? "RPE 8-9",
      tempo: exercise.tempo ?? "Controlled tempo",
      fatigueNote: exercise.fatigueNote ?? "Stop 1-2 reps before breakdown in form.",
    };
  }

  return {
    ...exercise,
    lastPerformance: previousPerformance,
    loadGuidance: inferIntermediateLoadSuggestion(exercise, previous),
  };
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
