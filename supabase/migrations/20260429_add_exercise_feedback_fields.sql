alter table if exists workout_exercises
  add column if not exists load_guidance text,
  add column if not exists last_performance text,
  add column if not exists intensity_target text,
  add column if not exists tempo text,
  add column if not exists advanced_technique text,
  add column if not exists fatigue_note text,
  add column if not exists completion_status text,
  add column if not exists difficulty_feedback text,
  add column if not exists logged_weight text,
  add column if not exists logged_reps int,
  add column if not exists logged_sets int,
  add column if not exists logged_rpe text,
  add column if not exists feedback_notes text;
