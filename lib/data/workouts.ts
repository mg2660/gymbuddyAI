import { cache } from "react";
import { getCurrentUserDateString } from "@/lib/date";
import type { WorkoutRecommendation, WorkoutSession } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

interface SessionRow {
  id: string;
  performed_at: string;
  focus: WorkoutSession["focus"];
  intensity: WorkoutSession["intensity"];
  duration_minutes: number;
  muscle_groups_hit: string[];
  notes: string;
}

interface ExerciseRow {
  workout_session_id: string;
  exercise_order: number;
  name: string;
  muscle_group: string;
  sets_count: number;
  reps_text: string;
  rest_seconds: number;
  warmup: string[] | null;
  tips: string[] | null;
  substitute: string | null;
}

interface RecommendationRow {
  id: string;
  recommendation_date: string;
  title: string;
  focus: WorkoutRecommendation["focus"];
  rationale: string[] | null;
  summary_bullets: string[] | null;
  exercises: WorkoutRecommendation["exercises"];
  today_special_request: string | null;
}

function mapSession(row: SessionRow, exercises: ExerciseRow[]): WorkoutSession {
  return {
    performedAt: row.performed_at,
    focus: row.focus,
    intensity: row.intensity,
    durationMinutes: row.duration_minutes,
    muscleGroupsHit: row.muscle_groups_hit,
    notes: row.notes,
    exercises: exercises
      .sort((a, b) => a.exercise_order - b.exercise_order)
      .map((exercise) => ({
        name: exercise.name,
        muscleGroup: exercise.muscle_group,
        sets: exercise.sets_count,
        reps: exercise.reps_text,
        restSeconds: exercise.rest_seconds,
        warmup: exercise.warmup ?? undefined,
        tips: exercise.tips ?? [],
        substitute: exercise.substitute ?? undefined,
      })),
  };
}

function mapRecommendation(row: RecommendationRow): WorkoutRecommendation & { id: string; recommendationDate: string } {
  return {
    id: row.id,
    recommendationDate: row.recommendation_date,
    title: row.title,
    focus: row.focus,
    rationale: row.rationale ?? [],
    summaryBullets: row.summary_bullets ?? [],
    exercises: row.exercises,
    todaySpecialRequest: row.today_special_request ?? undefined,
  };
}

export const getCurrentUserWorkoutHistory = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle<{ id: string }>();

  if (!profile) {
    return [];
  }

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, performed_at, focus, intensity, duration_minutes, muscle_groups_hit, notes")
    .eq("profile_id", profile.id)
    .order("performed_at", { ascending: false })
    .returns<SessionRow[]>();

  if (!sessions || sessions.length === 0) {
    return [];
  }

  const sessionIds = sessions.map((session) => session.id);
  const { data: exercises } = await supabase
    .from("workout_exercises")
    .select(
      "workout_session_id, exercise_order, name, muscle_group, sets_count, reps_text, rest_seconds, warmup, tips, substitute",
    )
    .in("workout_session_id", sessionIds)
    .returns<ExerciseRow[]>();

  return sessions.map((session) =>
    mapSession(
      session,
      (exercises ?? []).filter((exercise) => exercise.workout_session_id === session.id),
    ),
  );
});

export const getTodaysWorkoutRecommendation = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle<{ id: string }>();

  if (!profile) {
    return null;
  }

  const today = getCurrentUserDateString();
  const { data: recommendation } = await supabase
    .from("ai_workout_recommendations")
    .select("id, recommendation_date, title, focus, rationale, summary_bullets, exercises, today_special_request")
    .eq("profile_id", profile.id)
    .eq("recommendation_date", today)
    .maybeSingle<RecommendationRow>();

  return recommendation ? mapRecommendation(recommendation) : null;
});
