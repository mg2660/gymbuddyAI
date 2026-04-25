import type { UserProfile, WorkoutRecommendation, WorkoutSession } from "@/lib/types";

export const sampleProfile: UserProfile = {
  fullName: "Aarav",
  goal: "recomposition",
  experienceLevel: "intermediate",
  trainingDaysPerWeek: 5,
  sessionLengthMinutes: 70,
  preferredLocation: "hybrid",
  availableEquipment: ["full_gym", "dumbbells", "bench", "cables"],
  limitations: [
    {
      label: "No hack squat machine",
      kind: "equipment_missing",
      notes: "Use barbell or dumbbell alternatives.",
    },
    {
      label: "Avoid heavy overhead pressing",
      kind: "injury",
      notes: "Right shoulder gets irritated at high load.",
    },
  ],
  specialRequests: [
    {
      title: "Extra upper chest focus",
      details: "Prioritize at least one incline movement each push-oriented week.",
    },
    {
      title: "Visible abs goal",
      details: "Include short core finishers 2-3 times per week.",
    },
  ],
};

export const recentSessions: WorkoutSession[] = [
  {
    focus: "push",
    muscleGroupsHit: ["chest", "front_delts", "triceps"],
    intensity: "high",
    notes: "Strong pressing session with incline emphasis.",
    performedAt: "2026-04-19T07:00:00.000Z",
    durationMinutes: 74,
    exercises: [
      {
        name: "Incline Dumbbell Press",
        muscleGroup: "chest",
        sets: 4,
        reps: "8-10",
        restSeconds: 90,
        tips: ["Control the lowering phase.", "Keep shoulder blades pinned."],
      },
    ],
  },
  {
    focus: "legs",
    muscleGroupsHit: ["quads", "glutes", "hamstrings"],
    intensity: "moderate",
    notes: "More volume than load because of recovery needs.",
    performedAt: "2026-04-20T07:00:00.000Z",
    durationMinutes: 66,
    exercises: [
      {
        name: "Romanian Deadlift",
        muscleGroup: "hamstrings",
        sets: 4,
        reps: "6-8",
        restSeconds: 120,
        tips: ["Keep the bar close.", "Move through the hips."],
      },
    ],
  },
];

export const sampleRecommendation: WorkoutRecommendation = {
  title: "Pull Day With Core Finish",
  focus: "pull",
  rationale: [
    "Your last 2 sessions hit push muscles and legs, so back and biceps are freshest today.",
    "This keeps weekly volume balanced while respecting shoulder limitations.",
    "A short core finisher supports your recomposition goal without extending the session too much.",
  ],
  summaryBullets: [
    "Primary focus: back width, upper back, biceps",
    "Keep effort around RPE 8 on the final working set",
    "Finish with 6 minutes of core work",
  ],
  exercises: [
    {
      name: "Neutral-Grip Lat Pulldown",
      muscleGroup: "lats",
      sets: 4,
      reps: "8-12",
      restSeconds: 75,
      warmup: ["2 light ramp-up sets"],
      tips: ["Drive elbows down.", "Do not lean back excessively."],
      substitute: "Band-assisted pull-up",
    },
    {
      name: "Chest-Supported Row",
      muscleGroup: "upper_back",
      sets: 4,
      reps: "10-12",
      restSeconds: 75,
      tips: ["Pause at peak contraction.", "Keep the chest anchored."],
      substitute: "Single-arm dumbbell row",
    },
    {
      name: "Incline Dumbbell Curl",
      muscleGroup: "biceps",
      sets: 3,
      reps: "10-12",
      restSeconds: 60,
      tips: ["Let the arm fully lengthen.", "Avoid swinging."],
    },
  ],
};
