import type { ExperienceLevel, FitnessGoal } from "@/lib/types";

export const fitnessGoals: FitnessGoal[] = [
  "bulking",
  "cutting",
  "fat_loss",
  "recomposition",
  "strength",
  "general_fitness",
];

export const experienceLevels: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];

export const onboardingQuestions = [
  {
    id: "goal",
    prompt: "What is your primary goal right now?",
    reason: "This changes workout volume, intensity, exercise selection, and weekly balance.",
  },
  {
    id: "training_days_per_week",
    prompt: "How many days per week can you realistically train?",
    reason: "This determines split selection and recovery spacing.",
  },
  {
    id: "session_length_minutes",
    prompt: "How long can each workout session be?",
    reason: "This controls exercise count, warmup volume, and accessory work.",
  },
  {
    id: "preferred_location",
    prompt: "Do you train at a gym, at home, or both?",
    reason: "This defines the default environment for exercise selection.",
  },
  {
    id: "available_equipment",
    prompt: "Which equipment do you actually have access to?",
    reason: "The AI should only recommend movements the user can perform.",
  },
  {
    id: "limitations",
    prompt: "Which machines, movements, injuries, or constraints should always be avoided?",
    reason: "This is the persistent limitations database for safer and more realistic plans.",
  },
  {
    id: "priority_muscles",
    prompt: "Which muscle groups do you want to prioritize more?",
    reason: "This allows the planner to bias volume toward specific physique goals.",
  },
  {
    id: "special_requests",
    prompt: "Any special requests you want every future workout to remember?",
    reason: "This stores durable preferences outside normal limitation factors.",
  },
];
