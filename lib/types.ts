export type FitnessGoal =
  | "bulking"
  | "cutting"
  | "fat_loss"
  | "recomposition"
  | "strength"
  | "general_fitness";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type WorkoutFocus =
  | "push"
  | "pull"
  | "legs"
  | "upper_body"
  | "lower_body"
  | "full_body"
  | "single_muscle"
  | "recovery";

export type EquipmentAccess =
  | "full_gym"
  | "dumbbells"
  | "barbell"
  | "bench"
  | "cables"
  | "bands"
  | "pullup_bar"
  | "bodyweight_only";

export interface UserLimitation {
  label: string;
  kind: "equipment_missing" | "injury" | "movement_dislike" | "schedule" | "custom";
  notes?: string;
}

export interface UserSpecialRequest {
  title: string;
  details: string;
}

export interface UserProfile {
  fullName: string;
  age?: number;
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  trainingDaysPerWeek: number;
  sessionLengthMinutes: number;
  preferredLocation: "gym" | "home" | "hybrid";
  availableEquipment: EquipmentAccess[];
  limitations: UserLimitation[];
  specialRequests: UserSpecialRequest[];
}

export interface WorkoutExercise {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
  warmup?: string[];
  tips: string[];
  substitute?: string;
}

export interface WorkoutSessionSummary {
  focus: WorkoutFocus;
  muscleGroupsHit: string[];
  intensity: "light" | "moderate" | "high";
  notes: string;
}

export interface WorkoutSession extends WorkoutSessionSummary {
  performedAt: string;
  durationMinutes: number;
  exercises: WorkoutExercise[];
}

export interface WorkoutRecommendation {
  title: string;
  focus: WorkoutFocus;
  rationale: string[];
  summaryBullets: string[];
  exercises: WorkoutExercise[];
  todaySpecialRequest?: string;
}
