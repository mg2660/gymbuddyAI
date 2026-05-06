export type FitnessGoal =
  | "bulking"
  | "cutting"
  | "fat_loss"
  | "recomposition"
  | "strength"
  | "general_fitness";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type ExerciseFeedbackMode = "lazy" | "quick" | "full";
export type ExerciseCompletionStatus = "completed" | "skipped" | "substituted";
export type WorkoutDayStatus = "completed_in_app" | "completed_elsewhere" | "rest_day" | "missed";
export type WorkoutProgressionAction = "increase" | "maintain" | "decrease" | "start";
export type ExerciseDifficultyFeedback =
  | "too_easy"
  | "just_right"
  | "too_hard"
  | "need_clarity"
  | "need_alternative";

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

export interface WorkoutExerciseFeedback {
  completionStatus?: ExerciseCompletionStatus;
  difficulty?: ExerciseDifficultyFeedback;
  loggedWeight?: string;
  loggedReps?: number;
  loggedSets?: number;
  loggedRpe?: string;
  notes?: string;
}

export interface WorkoutExerciseProgression {
  action: WorkoutProgressionAction;
  label: string;
  instruction: string;
  reason: string;
  targetWeight?: string;
  source: "history" | "fallback";
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
  loadGuidance?: string;
  lastPerformance?: string;
  intensityTarget?: string;
  tempo?: string;
  advancedTechnique?: string;
  fatigueNote?: string;
  progression?: WorkoutExerciseProgression;
  feedback?: WorkoutExerciseFeedback;
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

export interface WorkoutDayLog {
  date: string;
  status: WorkoutDayStatus;
  notes?: string;
}

export interface WorkoutCalendarDay {
  date: string;
  dayLabel: string;
  dayNumber: string;
  isToday: boolean;
  status: WorkoutDayStatus | "unresolved" | "idle";
  notes?: string;
}

export interface WorkoutRecommendation {
  title: string;
  focus: WorkoutFocus;
  rationale: string[];
  summaryBullets: string[];
  exercises: WorkoutExercise[];
  todaySpecialRequest?: string;
}
