"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { generateWorkoutRecommendation } from "@/lib/ai/generate-workout";
import { getCurrentUserDateString } from "@/lib/date";
import { getCurrentUserProfile } from "@/lib/data/profile";
import {
  getCurrentUserWorkoutCalendar,
  getCurrentUserWorkoutHistory,
  getTodaysWorkoutRecommendation,
} from "@/lib/data/workouts";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutDayLog, WorkoutExercise } from "@/lib/types";

async function getCurrentProfileId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle<{ id: string }>();

  if (!profile) {
    redirect("/onboarding");
  }

  return { supabase, profileId: profile.id };
}

const generateWorkoutSchema = z.object({
  todaySpecialRequest: z.string().trim().max(280).optional(),
});

const workoutDayLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["completed_elsewhere", "rest_day", "missed"]),
  notes: z.string().trim().max(280).optional(),
});

const exerciseFeedbackSchema = z.object({
  exerciseIndex: z.coerce.number().int().min(0),
  completionStatus: z.enum(["completed", "skipped", "substituted"]).optional(),
  difficulty: z
    .enum(["too_easy", "just_right", "too_hard", "need_clarity", "need_alternative"])
    .optional(),
  loggedWeight: z.preprocess(
    (value) => {
      const text = String(value ?? "").trim();
      return text === "" ? undefined : text;
    },
    z.string().max(32).optional(),
  ),
  loggedReps: z.preprocess(
    (value) => {
      const text = String(value ?? "").trim();
      return text === "" ? undefined : Number(text);
    },
    z.number().int().positive().optional(),
  ),
  loggedSets: z.preprocess(
    (value) => {
      const text = String(value ?? "").trim();
      return text === "" ? undefined : Number(text);
    },
    z.number().int().positive().optional(),
  ),
  loggedRpe: z.preprocess(
    (value) => {
      const text = String(value ?? "").trim();
      return text === "" ? undefined : text;
    },
    z.string().max(16).optional(),
  ),
  notes: z.preprocess(
    (value) => {
      const text = String(value ?? "").trim();
      return text === "" ? undefined : text;
    },
    z.string().max(280).optional(),
  ),
});

function inferSessionIntensity(exercises: WorkoutExercise[]) {
  if (
    exercises.some(
      (exercise) =>
        exercise.intensityTarget ||
        exercise.tempo ||
        exercise.advancedTechnique ||
        exercise.feedback?.loggedRpe,
    )
  ) {
    return "high" as const;
  }

  if (exercises.some((exercise) => exercise.loadGuidance || exercise.feedback?.difficulty === "too_hard")) {
    return "moderate" as const;
  }

  return "light" as const;
}

function parseWorkoutDayResponses(formData: FormData) {
  const responses: z.infer<typeof workoutDayLogSchema>[] = [];

  for (const [key, rawValue] of formData.entries()) {
    if (!key.startsWith("activityStatus__")) {
      continue;
    }

    const date = key.replace("activityStatus__", "");
    const value = String(rawValue).trim();

    if (!value) {
      continue;
    }

    responses.push(
      workoutDayLogSchema.parse({
        date,
        status: value,
        notes: formData.get(`activityNotes__${date}`) || undefined,
      }),
    );
  }

  return responses;
}

async function upsertWorkoutDayLogs(dayLogs: z.infer<typeof workoutDayLogSchema>[]) {
  if (dayLogs.length === 0) {
    return;
  }

  const { supabase, profileId } = await getCurrentProfileId();
  const { error } = await supabase.from("workout_day_logs").upsert(
    dayLogs.map((item) => ({
      profile_id: profileId,
      activity_date: item.date,
      status: item.status,
      notes: item.notes || null,
    })),
    {
      onConflict: "profile_id,activity_date",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

function mergeRecentActivityTimeline(
  existingTimeline: WorkoutDayLog[],
  dayResponses: z.infer<typeof workoutDayLogSchema>[],
) {
  const merged = new Map(existingTimeline.map((item) => [item.date, item] as const));

  for (const response of dayResponses) {
    merged.set(response.date, {
      date: response.date,
      status: response.status,
      notes: response.notes || undefined,
    });
  }

  return Array.from(merged.values()).sort((left, right) => left.date.localeCompare(right.date));
}

async function updateTodayRecommendationExercise(
  exerciseIndex: number,
  updater: (exercise: WorkoutExercise) => WorkoutExercise,
) {
  const recommendation = await getTodaysWorkoutRecommendation();

  if (!recommendation) {
    redirect("/dashboard");
  }

  const currentExercise = recommendation.exercises[exerciseIndex];

  if (!currentExercise) {
    throw new Error("Exercise feedback target was not found.");
  }

  const nextExercises = recommendation.exercises.map((exercise, index) =>
    index === exerciseIndex ? updater(exercise) : exercise,
  );

  const { supabase } = await getCurrentProfileId();
  const { error } = await supabase
    .from("ai_workout_recommendations")
    .update({
      exercises: nextExercises,
    })
    .eq("id", recommendation.id);

  if (error) {
    throw new Error(error.message);
  }
}

async function deleteCurrentRecommendation() {
  const recommendation = await getTodaysWorkoutRecommendation();

  if (!recommendation) {
    return;
  }

  const { supabase } = await getCurrentProfileId();
  const { error } = await supabase.from("ai_workout_recommendations").delete().eq("id", recommendation.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function generateTodaysWorkout(formData: FormData) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  const existingRecommendation = await getTodaysWorkoutRecommendation();

  if (existingRecommendation) {
    redirect("/dashboard");
  }

  const calendar = await getCurrentUserWorkoutCalendar();
  const parsed = generateWorkoutSchema.parse({
    todaySpecialRequest: formData.get("todaySpecialRequest") || undefined,
  });
  const dayResponses = parseWorkoutDayResponses(formData);

  if (calendar.unresolvedDates.length > 0) {
    const responseDates = new Set(dayResponses.map((item) => item.date));
    const missingResponses = calendar.unresolvedDates.filter((date) => !responseDates.has(date));

    if (missingResponses.length > 0) {
      throw new Error("Please review the missed dates before generating the next workout.");
    }

    await upsertWorkoutDayLogs(dayResponses);
  }

  const todaySpecialRequest = parsed.todaySpecialRequest?.trim() || undefined;
  const recentSessions = await getCurrentUserWorkoutHistory();
  const recommendation = await generateWorkoutRecommendation({
    profile,
    recentSessions,
    recentActivityTimeline: mergeRecentActivityTimeline(calendar.recentActivityTimeline, dayResponses),
    todaySpecialRequest,
  });

  const { supabase, profileId } = await getCurrentProfileId();
  const today = getCurrentUserDateString();

  const { error } = await supabase.from("ai_workout_recommendations").upsert(
    {
      profile_id: profileId,
      recommendation_date: today,
      title: recommendation.title,
      focus: recommendation.focus,
      rationale: recommendation.rationale,
      summary_bullets: recommendation.summaryBullets,
      exercises: recommendation.exercises,
      today_special_request: todaySpecialRequest ?? null,
    },
    {
      onConflict: "profile_id,recommendation_date",
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function regenerateTodaysWorkout(formData: FormData) {
  await deleteCurrentRecommendation();
  await generateTodaysWorkout(formData);
  revalidatePath("/dashboard");
}

export async function resetTodaysWorkout() {
  await deleteCurrentRecommendation();
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function saveExerciseCardFeedback(formData: FormData) {
  const parsed = exerciseFeedbackSchema.parse({
    exerciseIndex: formData.get("exerciseIndex"),
    completionStatus: formData.get("completionStatus") || undefined,
    difficulty: formData.get("difficulty") || undefined,
    loggedWeight: formData.get("loggedWeight") || undefined,
    loggedReps: formData.get("loggedReps") || undefined,
    loggedSets: formData.get("loggedSets") || undefined,
    loggedRpe: formData.get("loggedRpe") || undefined,
    notes: formData.get("notes") || undefined,
  });

  await updateTodayRecommendationExercise(parsed.exerciseIndex, (exercise) => ({
    ...exercise,
    feedback: {
      ...exercise.feedback,
      ...(parsed.completionStatus ? { completionStatus: parsed.completionStatus } : {}),
      ...(parsed.difficulty ? { difficulty: parsed.difficulty } : {}),
      ...(parsed.loggedWeight ? { loggedWeight: parsed.loggedWeight } : {}),
      ...(parsed.loggedReps ? { loggedReps: parsed.loggedReps } : {}),
      ...(parsed.loggedSets ? { loggedSets: parsed.loggedSets } : {}),
      ...(parsed.loggedRpe ? { loggedRpe: parsed.loggedRpe } : {}),
      ...(parsed.notes ? { notes: parsed.notes } : {}),
    },
  }));

  revalidatePath("/dashboard");
}

export async function markTodaysWorkoutDone() {
  const recommendation = await getTodaysWorkoutRecommendation();

  if (!recommendation) {
    redirect("/dashboard");
  }

  const { supabase, profileId } = await getCurrentProfileId();
  const performedAt = new Date().toISOString();

  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({
      profile_id: profileId,
      performed_at: performedAt,
      focus: recommendation.focus,
      intensity: inferSessionIntensity(recommendation.exercises),
      duration_minutes: recommendation.exercises.length * 12,
      muscle_groups_hit: Array.from(new Set(recommendation.exercises.map((exercise) => exercise.muscleGroup))),
      notes: recommendation.todaySpecialRequest
        ? `Completed AI workout: ${recommendation.title}. Today request: ${recommendation.todaySpecialRequest}`
        : `Completed AI workout: ${recommendation.title}`,
      summary_text: recommendation.summaryBullets.join(" | "),
    })
    .select("id")
    .single<{ id: string }>();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const { error: exercisesError } = await supabase.from("workout_exercises").insert(
    recommendation.exercises.map((exercise, index) => ({
      workout_session_id: session.id,
      exercise_order: index,
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      sets_count: exercise.sets,
      reps_text: exercise.reps,
      rest_seconds: exercise.restSeconds,
      warmup: exercise.warmup ?? [],
      tips: exercise.tips,
      substitute: exercise.substitute ?? null,
      load_guidance: exercise.loadGuidance ?? null,
      last_performance: exercise.lastPerformance ?? null,
      intensity_target: exercise.intensityTarget ?? null,
      tempo: exercise.tempo ?? null,
      advanced_technique: exercise.advancedTechnique ?? null,
      fatigue_note: exercise.fatigueNote ?? null,
      completion_status: exercise.feedback?.completionStatus ?? null,
      difficulty_feedback: exercise.feedback?.difficulty ?? null,
      logged_weight: exercise.feedback?.loggedWeight ?? null,
      logged_reps: exercise.feedback?.loggedReps ?? null,
      logged_sets: exercise.feedback?.loggedSets ?? null,
      logged_rpe: exercise.feedback?.loggedRpe ?? null,
      feedback_notes: exercise.feedback?.notes ?? null,
    })),
  );

  if (exercisesError) {
    throw new Error(exercisesError.message);
  }

  const { error: deleteError } = await supabase
    .from("ai_workout_recommendations")
    .delete()
    .eq("id", recommendation.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
