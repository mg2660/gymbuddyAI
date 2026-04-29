import OpenAI from "openai";
import type { UserProfile, WorkoutDayLog, WorkoutRecommendation, WorkoutSession } from "@/lib/types";
import { buildWorkoutPrompt, workoutResponseSchema } from "@/lib/ai/workout-prompt";
import { workoutRecommendationSchema } from "@/lib/ai/validation";

export interface GenerateWorkoutArgs {
  profile: UserProfile;
  recentSessions: WorkoutSession[];
  recentActivityTimeline: WorkoutDayLog[];
  todaySpecialRequest?: string;
}

export async function generateWorkoutRecommendation({
  profile,
  recentSessions,
  recentActivityTimeline,
  todaySpecialRequest,
}: GenerateWorkoutArgs): Promise<WorkoutRecommendation> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const recentExactSessions = recentSessions
    .slice(0, 10)
    .map(({ focus, muscleGroupsHit, intensity, notes, exercises, performedAt, durationMinutes }) => ({
      focus,
      muscleGroupsHit,
      intensity,
      notes,
      performedAt,
      durationMinutes,
      exercises,
    }));

  const olderSessionSummaries = recentSessions
    .slice(10, 20)
    .map(({ focus, muscleGroupsHit, intensity, notes }) => ({ focus, muscleGroupsHit, intensity, notes }));

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: buildWorkoutPrompt({
      profile,
      recentExactSessions,
      olderSessionSummaries,
      recentActivityTimeline,
      todaySpecialRequest,
    }),
    text: {
      format: {
        type: "json_schema",
        name: "workout_recommendation",
        schema: workoutResponseSchema,
      },
    },
  });

  const parsed = workoutRecommendationSchema.safeParse(JSON.parse(response.output_text));

  if (!parsed.success) {
    throw new Error("AI returned an invalid workout structure.");
  }

  return {
    ...parsed.data,
    todaySpecialRequest,
    exercises: parsed.data.exercises.map((exercise) => ({
      ...exercise,
      substitute: exercise.substitute ?? undefined,
      loadGuidance: exercise.loadGuidance ?? undefined,
      lastPerformance: exercise.lastPerformance ?? undefined,
      intensityTarget: exercise.intensityTarget ?? undefined,
      tempo: exercise.tempo ?? undefined,
      advancedTechnique: exercise.advancedTechnique ?? undefined,
      fatigueNote: exercise.fatigueNote ?? undefined,
    })),
  };
}
