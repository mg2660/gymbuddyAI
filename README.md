# Gym Buddy AI

Gym Buddy AI is a mobile-first workout planner and tracker that uses recent training history, long-term goals, equipment limitations, and special requests to recommend the next best session.

## Product pillars

- Remember exact sessions from the last 7-10 days
- Summarize older history to keep AI context lightweight
- Respect persistent limitation factors such as missing equipment or movement constraints
- Save special workout requests as long-lived preferences
- Present workouts in a card-based mobile flow with a final `Mark as Done` action

## Recommended stack

- Next.js + TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- OpenAI API for structured workout generation

## Core domain model

- `profiles`: primary goal, training setup, and session preferences
- `profile_limitations`: equipment gaps, injuries, disliked movements, scheduling constraints
- `profile_special_requests`: user-specific preferences the planner should always remember
- `workout_sessions`: exact training history
- `workout_exercises`: exercise-level detail for recent sessions
- `ai_workout_recommendations`: cached daily generated workouts

## First working flow

1. Create `.env.local` from `.env.example`
2. Add your Supabase URL and publishable key
3. Run the SQL in `supabase/schema.sql`
4. Start the app and create an account at `/auth`
5. Complete onboarding at `/onboarding`
6. Confirm the saved profile loads on `/dashboard`

## Database update after initial setup

If you already created the database before the `today_special_request` feature, run this once:

```sql
alter table ai_workout_recommendations
add column if not exists today_special_request text;
```
