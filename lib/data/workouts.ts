import { cache } from "react";
import {
  getCurrentUserDateString,
  getDatesBetweenExclusive,
  getDayNumberLabel,
  getRecentDateStrings,
  getShortWeekdayLabel,
  getUserDateStringFromTimestamp,
  shiftDateString,
} from "@/lib/date";
import type {
  ExerciseCompletionStatus,
  ExerciseDifficultyFeedback,
  WorkoutCalendarDay,
  WorkoutDayLog,
  WorkoutDayStatus,
  WorkoutRecommendation,
  WorkoutSession,
} from "@/lib/types";
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
  load_guidance: string | null;
  last_performance: string | null;
  intensity_target: string | null;
  tempo: string | null;
  advanced_technique: string | null;
  fatigue_note: string | null;
  completion_status: ExerciseCompletionStatus | null;
  difficulty_feedback: ExerciseDifficultyFeedback | null;
  logged_weight: string | null;
  logged_reps: number | null;
  logged_sets: number | null;
  logged_rpe: string | null;
  feedback_notes: string | null;
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

interface DayLogRow {
  activity_date: string;
  status: Exclude<WorkoutDayStatus, "completed_in_app">;
  notes: string | null;
}

interface WorkoutCalendarData {
  calendarDays: WorkoutCalendarDay[];
  unresolvedDates: string[];
  recentActivityTimeline: WorkoutDayLog[];
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
        loadGuidance: exercise.load_guidance ?? undefined,
        lastPerformance: exercise.last_performance ?? undefined,
        intensityTarget: exercise.intensity_target ?? undefined,
        tempo: exercise.tempo ?? undefined,
        advancedTechnique: exercise.advanced_technique ?? undefined,
        fatigueNote: exercise.fatigue_note ?? undefined,
        feedback:
          exercise.completion_status ||
          exercise.difficulty_feedback ||
          exercise.logged_weight ||
          exercise.logged_reps ||
          exercise.logged_sets ||
          exercise.logged_rpe ||
          exercise.feedback_notes
            ? {
                completionStatus: exercise.completion_status ?? undefined,
                difficulty: exercise.difficulty_feedback ?? undefined,
                loggedWeight: exercise.logged_weight ?? undefined,
                loggedReps: exercise.logged_reps ?? undefined,
                loggedSets: exercise.logged_sets ?? undefined,
                loggedRpe: exercise.logged_rpe ?? undefined,
                notes: exercise.feedback_notes ?? undefined,
              }
            : undefined,
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

function mapDayLog(row: DayLogRow): WorkoutDayLog {
  return {
    date: row.activity_date,
    status: row.status,
    notes: row.notes ?? undefined,
  };
}

function buildActivityTimeline(
  sessions: WorkoutSession[],
  dayLogs: WorkoutDayLog[],
  windowDates: string[],
) {
  const sessionDates = new Map<string, WorkoutSession[]>();

  for (const session of sessions) {
    const date = getUserDateStringFromTimestamp(session.performedAt);
    const existing = sessionDates.get(date) ?? [];
    existing.push(session);
    sessionDates.set(date, existing);
  }

  const dayLogMap = new Map(dayLogs.map((item) => [item.date, item] as const));

  return windowDates.flatMap((date) => {
    if (sessionDates.has(date)) {
      const sessionsOnDate = sessionDates.get(date) ?? [];
      return [
        {
          date,
          status: "completed_in_app" as const,
          notes: sessionsOnDate[0]?.notes,
        },
      ];
    }

    const log = dayLogMap.get(date);

    return log ? [log] : [];
  });
}

function buildCalendarData(
  sessions: WorkoutSession[],
  dayLogs: WorkoutDayLog[],
  rangeDays: number,
): WorkoutCalendarData {
  const today = getCurrentUserDateString();
  const yesterday = shiftDateString(today, -1);
  const windowDates = getRecentDateStrings(rangeDays);
  const timeline = buildActivityTimeline(sessions, dayLogs, windowDates);
  const timelineMap = new Map(timeline.map((item) => [item.date, item] as const));
  const trackedDates = timeline
    .map((item) => item.date)
    .filter((date) => date <= yesterday)
    .sort();
  const firstTrackedDate = trackedDates[0];
  const unresolvedDates = firstTrackedDate
    ? getDatesBetweenExclusive(shiftDateString(firstTrackedDate, -1), today).filter((date) => !timelineMap.has(date))
    : sessions.length > 0 || dayLogs.length > 0
      ? getRecentDateStrings(7, yesterday).filter((date) => !timelineMap.has(date))
      : [];
  const unresolvedSet = new Set(unresolvedDates);

  return {
    unresolvedDates,
    recentActivityTimeline: timeline,
    calendarDays: windowDates.map((date) => {
      const known = timelineMap.get(date);

      return {
        date,
        dayLabel: getShortWeekdayLabel(date),
        dayNumber: getDayNumberLabel(date),
        isToday: date === today,
        status: known?.status ?? (unresolvedSet.has(date) ? "unresolved" : "idle"),
        notes: known?.notes,
      };
    }),
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
      "workout_session_id, exercise_order, name, muscle_group, sets_count, reps_text, rest_seconds, warmup, tips, substitute, load_guidance, last_performance, intensity_target, tempo, advanced_technique, fatigue_note, completion_status, difficulty_feedback, logged_weight, logged_reps, logged_sets, logged_rpe, feedback_notes",
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

export const getCurrentUserWorkoutCalendar = cache(async (rangeDays = 21) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      calendarDays: [],
      unresolvedDates: [],
      recentActivityTimeline: [],
    } satisfies WorkoutCalendarData;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle<{ id: string }>();

  if (!profile) {
    return {
      calendarDays: [],
      unresolvedDates: [],
      recentActivityTimeline: [],
    } satisfies WorkoutCalendarData;
  }

  const [sessions, { data: dayLogs }] = await Promise.all([
    getCurrentUserWorkoutHistory(),
    supabase
      .from("workout_day_logs")
      .select("activity_date, status, notes")
      .eq("profile_id", profile.id)
      .gte("activity_date", shiftDateString(getCurrentUserDateString(), -(rangeDays - 1)))
      .order("activity_date", { ascending: true })
      .returns<DayLogRow[]>(),
  ]);

  return buildCalendarData(
    sessions,
    (dayLogs ?? []).map(mapDayLog),
    rangeDays,
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
