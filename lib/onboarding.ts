import type { ExerciseFeedbackMode, ExperienceLevel, FitnessGoal } from "@/lib/types";

export const fitnessGoals: FitnessGoal[] = [
  "bulking",
  "cutting",
  "fat_loss",
  "recomposition",
  "strength",
  "general_fitness",
];

export const experienceLevels: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];

export const experienceLevelDetails: Record<
  ExperienceLevel,
  {
    label: string;
    focus: string;
    description: string;
    cardStyle: string;
    feedbackMode: ExerciseFeedbackMode;
  }
> = {
  beginner: {
    label: "Beginner",
    focus: "Confidence + clarity",
    description:
      "Best for people learning movement basics, building consistency, or returning after a long break.",
    cardStyle: "Guided cards with simple cues, easier alternatives, and low-pressure weight guidance.",
    feedbackMode: "lazy",
  },
  intermediate: {
    label: "Intermediate",
    focus: "Progression + efficiency",
    description:
      "Best for people who know the main lifts, want faster progress, and prefer quick decisions over full logging.",
    cardStyle: "Assisted cards with last performance, smart weight suggestions, and 1-tap feedback.",
    feedbackMode: "quick",
  },
  advanced: {
    label: "Advanced",
    focus: "Optimization + performance",
    description:
      "Best for experienced lifters who care about precise targets, training quality, and managing fatigue over time.",
    cardStyle: "Performance cards with intensity targets, tempo, technique notes, and full logging controls.",
    feedbackMode: "full",
  },
};

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
    id: "experience_level",
    prompt: "What coaching style fits your current training experience?",
    reason: "This changes how much guidance, structure, and control each workout card should show.",
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
