import type { UserProfile, WorkoutRecommendation, WorkoutSessionSummary } from "@/lib/types";

export interface WorkoutGenerationInput {
  profile: UserProfile;
  recentExactSessions: WorkoutSessionSummary[];
  olderSessionSummaries: WorkoutSessionSummary[];
  todaySpecialRequest?: string;
}

export const workoutResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "focus", "rationale", "summaryBullets", "exercises"],
  properties: {
    title: { type: "string" },
    focus: {
      type: "string",
      enum: [
        "push",
        "pull",
        "legs",
        "upper_body",
        "lower_body",
        "full_body",
        "single_muscle",
        "recovery",
      ],
    },
    rationale: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 5,
    },
    summaryBullets: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 5,
    },
    exercises: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "muscleGroup", "sets", "reps", "restSeconds", "warmup", "tips", "substitute"],
        properties: {
          name: { type: "string" },
          muscleGroup: { type: "string" },
          sets: { type: "number" },
          reps: { type: "string" },
          restSeconds: { type: "number" },
          warmup: {
            type: "array",
            items: { type: "string" },
          },
          tips: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 3,
          },
          substitute: {
            type: ["string", "null"],
          },
        },
      },
    },
  },
} as const;

export function buildWorkoutPrompt(input: WorkoutGenerationInput): string {
  return `
You are Gym Buddy AI, a workout planning assistant.

Always optimize for the user's main goal while respecting recovery, recent training load, equipment access, limitations, and custom workout requests.

Rules:
- Ask the maximum relevant onboarding questions before planning if profile data is incomplete.
- Use the last 7-10 days of exact sessions as the strongest signal.
- Use older summaries as supporting context, not the main driver.
- Never recommend exercises requiring unavailable equipment.
- Always respect stored limitations such as injuries, equipment gaps, disliked movements, and schedule constraints.
- Always consider the user's special requests when they do not conflict with safety or recovery.
- If the user gave a one-day special request for today, treat it as a temporary modifier for this workout only.
- Return one workout that fits the target session length.
- Explain briefly why this workout is recommended today.

User profile:
${JSON.stringify(input.profile, null, 2)}

Recent exact sessions:
${JSON.stringify(input.recentExactSessions, null, 2)}

Older session summaries:
${JSON.stringify(input.olderSessionSummaries, null, 2)}

Today's special request:
${JSON.stringify(input.todaySpecialRequest ?? null, null, 2)}

Return valid JSON only.
`.trim();
}

export function isWorkoutRecommendation(value: unknown): value is WorkoutRecommendation {
  return typeof value === "object" && value !== null && "title" in value && "exercises" in value;
}
