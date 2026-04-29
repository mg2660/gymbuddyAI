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
  loadGuidance: z.string().min(1).nullable().optional(),
  lastPerformance: z.string().min(1).nullable().optional(),
  intensityTarget: z.string().min(1).nullable().optional(),
  tempo: z.string().min(1).nullable().optional(),
  advancedTechnique: z.string().min(1).nullable().optional(),
  fatigueNote: z.string().min(1).nullable().optional(),
  feedback: z
    .object({
      completionStatus: z.enum(["completed", "skipped", "substituted"]).optional(),
      difficulty: z
        .enum(["too_easy", "just_right", "too_hard", "need_clarity", "need_alternative"])
        .optional(),
      loggedWeight: z.string().min(1).optional(),
      loggedReps: z.number().int().positive().optional(),
      loggedSets: z.number().int().positive().optional(),
      loggedRpe: z.string().min(1).optional(),
      notes: z.string().min(1).optional(),
    })
    .optional(),
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
      exercises: z.array(workoutExerciseSchema).optional(),
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
  recentActivityTimeline: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      status: z.enum(["completed_in_app", "completed_elsewhere", "rest_day", "missed"]),
      notes: z.string().optional(),
    }),
  ),
});

export type WorkoutRequestInput = z.infer<typeof workoutRequestSchema>;
