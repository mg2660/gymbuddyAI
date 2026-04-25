import { z } from "zod";

const workoutFocusSchema = z.enum([
  "push",
  "pull",
  "legs",
  "upper_body",
  "lower_body",
  "full_body",
  "single_muscle",
  "recovery",
]);

export const workoutExerciseSchema = z.object({
  name: z.string().min(1),
  muscleGroup: z.string().min(1),
  sets: z.number().int().positive(),
  reps: z.string().min(1),
  restSeconds: z.number().int().nonnegative(),
  warmup: z.array(z.string()),
  tips: z.array(z.string()).min(1).max(3),
  substitute: z.string().nullable(),
});

export const workoutRecommendationSchema = z.object({
  title: z.string().min(1),
  focus: workoutFocusSchema,
  rationale: z.array(z.string()).min(2).max(5),
  summaryBullets: z.array(z.string()).min(2).max(5),
  exercises: z.array(workoutExerciseSchema).min(3).max(8),
});

export const workoutRequestSchema = z.object({
  profile: z.object({
    fullName: z.string().min(1),
    age: z.number().int().positive().optional(),
    goal: z.enum([
      "bulking",
      "cutting",
      "fat_loss",
      "recomposition",
      "strength",
      "general_fitness",
    ]),
    experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
    trainingDaysPerWeek: z.number().int().min(1).max(7),
    sessionLengthMinutes: z.number().int().min(20).max(180),
    preferredLocation: z.enum(["gym", "home", "hybrid"]),
    availableEquipment: z.array(
      z.enum([
        "full_gym",
        "dumbbells",
        "barbell",
        "bench",
        "cables",
        "bands",
        "pullup_bar",
        "bodyweight_only",
      ]),
    ),
    limitations: z.array(
      z.object({
        label: z.string().min(1),
        kind: z.enum(["equipment_missing", "injury", "movement_dislike", "schedule", "custom"]),
        notes: z.string().optional(),
      }),
    ),
    specialRequests: z.array(
      z.object({
        title: z.string().min(1),
        details: z.string().min(1),
      }),
    ),
  }),
  recentExactSessions: z.array(
    z.object({
      focus: workoutFocusSchema,
      muscleGroupsHit: z.array(z.string()),
      intensity: z.enum(["light", "moderate", "high"]),
      notes: z.string(),
    }),
  ),
  olderSessionSummaries: z.array(
    z.object({
      focus: workoutFocusSchema,
      muscleGroupsHit: z.array(z.string()),
      intensity: z.enum(["light", "moderate", "high"]),
      notes: z.string(),
    }),
  ),
});

export type WorkoutRequestInput = z.infer<typeof workoutRequestSchema>;
