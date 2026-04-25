"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { generateWorkoutRecommendation } from "@/lib/ai/generate-workout";
import { getCurrentUserDateString } from "@/lib/date";
import { getCurrentUserProfile } from "@/lib/data/profile";
import { getCurrentUserWorkoutHistory, getTodaysWorkoutRecommendation } from "@/lib/data/workouts";
import { createClient } from "@/lib/supabase/server";

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

  const parsed = generateWorkoutSchema.parse({
    todaySpecialRequest: formData.get("todaySpecialRequest") || undefined,
  });

  const todaySpecialRequest = parsed.todaySpecialRequest?.trim() || undefined;
  const recentSessions = await getCurrentUserWorkoutHistory();
  const recommendation = await generateWorkoutRecommendation({
    profile,
    recentSessions,
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
}

export async function resetTodaysWorkout() {
  await deleteCurrentRecommendation();
  revalidatePath("/dashboard");
  redirect("/dashboard");
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
      intensity: "moderate",
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
