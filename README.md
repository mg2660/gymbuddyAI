# Gym Buddy AI

Gym Buddy AI is a mobile-first AI workout planner and tracker built to remove decision fatigue from training.

The product goal is simple:

`From "I don't know what to do today" -> to "I just open the app and follow the plan."`

It is designed for:

- beginners who need confidence and clarity
- intermediate users who want progression without too much logging friction
- advanced users who want structured control and performance-focused recommendations

## Table of Contents

- [Project Summary](#project-summary)
- [Problem the App Solves](#problem-the-app-solves)
- [Core Features](#core-features)
- [User Flow](#user-flow)
- [Technology Used](#technology-used)
- [Technical Working](#technical-working)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [Installation and Local Setup](#installation-and-local-setup)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Testing Guidance](#testing-guidance)
- [Project Scope](#project-scope)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Maintainer Notes](#maintainer-notes)

## Project Summary

Gym Buddy AI combines:

- authentication and persistent user accounts
- onboarding with long-term training preferences
- AI-generated daily workouts
- workout history tracking
- day-by-day continuity tracking for missed days, off-app workouts, and rest days
- deterministic progression logic for repeated exercises
- feedback-based load guidance
- mobile-first workout cards and calendar views

The app is currently a web application optimized for mobile browsers, while still working well on desktop and iOS browsers. The codebase is also structured so it can later be packaged as an Android application without replacing the current website.

## Problem the App Solves

Most workout apps fail in one of two ways:

- they are too generic and do not adapt meaningfully
- they expect users to behave like disciplined spreadsheet loggers

Gym Buddy AI takes a different approach:

- it remembers the user's profile and context
- it asks about missed days before generating the next plan
- it supports both lightweight and detailed workout logging
- it makes progression visible instead of hiding it in vague coaching language

The idea is not just to generate workouts, but to reduce overthinking and make the app feel like a practical coach.

## Core Features

### 1. Auth-first entry flow

- the first page is sign up / sign in
- unauthenticated users are redirected to `/auth`
- authenticated users are routed to onboarding or dashboard based on profile state
- route-level loading states help the app feel responsive on mobile

### 2. Persistent onboarding profile

Each user has one main training profile containing:

- full name
- age
- fitness goal
- experience level
- training days per week
- session length
- preferred training location
- available equipment
- limitations
- long-term special requests

This profile becomes the foundation for workout generation.

### 3. Experience-aware workout cards

Workout cards change based on the user's experience level:

- beginner: simple cues, lower information density, easier alternatives
- intermediate: progression support, previous performance, direct next-step guidance
- advanced: tighter performance control, tempo, intensity targets, and structured logging

The app intentionally scales information complexity, not just workout difficulty.

### 4. AI workout generation

The app generates daily workout recommendations using:

- the saved profile
- recent workout history
- older session summaries
- day-level activity logs
- today's optional special request

Recommendations are stored so the user can return to them later the same day.

### 5. Deterministic progression engine

Progression decisions are not left entirely to the language model.

For repeated exercises, the backend applies consistent rules so the user gets a clear next-step action such as:

- increase load
- reduce load
- maintain load
- start at a baseline range

This keeps progression consistent across exercises and across sessions.

### 6. Workout feedback and logging

Each exercise card supports lightweight or detailed feedback:

- done only
- difficulty feedback
- logged weight
- logged reps
- logged sets
- logged RPE
- notes

This stored feedback is later used to inform future workout suggestions.

### 7. Calendar and missed-day tracking

The app tracks continuity in two ways:

- completed in-app sessions
- day-level logs for off-app workouts, planned rest days, and missed days

If the recent timeline has gaps, the app asks the user to classify those dates before generating the next workout. This helps the system avoid assuming perfect training consistency.

### 8. Mobile-first calendar views

Instead of one cluttered monthly grid, the calendar page is split into:

- `Overview`
- `Weeks`
- `Log`

This keeps it more usable on smaller screens.

## User Flow

The current user journey works like this:

1. User opens the app.
2. If not authenticated, the user lands on `/auth`.
3. After sign in, the app checks whether a profile exists.
4. If no profile exists, the user completes onboarding on `/onboarding`.
5. The user lands on `/dashboard`.
6. The dashboard loads recent history, calendar continuity data, and today's recommendation if one exists.
7. If recent dates are unresolved, the app prompts the user to classify them.
8. The user generates a workout or opens the saved one.
9. The user performs the workout and submits exercise-level feedback.
10. The completed workout is stored in Supabase and later used for progression and planning.

## Technology Used

### Frontend

- `Next.js 15`
- `React 19`
- `TypeScript`
- `Tailwind CSS`

### Backend and Database

- `Supabase Auth`
- `Supabase Postgres`
- `Supabase Row Level Security (RLS)`

### AI and Validation

- `OpenAI Responses API`
- `Zod`

### Tooling

- `ESLint`
- `PostCSS`
- `Autoprefixer`
- `TypeScript compiler`

## Technical Working

This section explains how the system works internally.

### 1. Authentication

Authentication is handled through Supabase Auth.

The app checks the current session server-side and routes users based on profile state:

- no session -> `/auth`
- session without profile -> `/onboarding`
- session with profile -> `/dashboard`

### 2. Profile persistence

The onboarding flow stores a single profile per user.

That profile includes the user's:

- training goals
- experience level
- routine preferences
- equipment context
- limitations
- special requests

The app uses an upsert-style workflow, so the same account edits its existing profile instead of creating duplicates.

### 3. Workout generation pipeline

When the user asks for a workout, the backend gathers:

- the current user profile
- recent detailed workout sessions
- older summarized sessions
- recent day-level activity logs
- today's special request, if any

That context is passed to the OpenAI Responses API using a structured output schema.

After the AI response returns:

- the response is validated
- the structure is normalized
- progression logic is applied
- the final recommendation is stored in the database

### 4. Deterministic progression logic

One of the most important design choices in this project is that repeated exercise progression is enforced in backend logic instead of being left entirely to the model.

Examples of the current rule style:

- `too_easy` -> increase load one clear step
- `too_hard` -> reduce load one clear step
- `just_right` and top rep target achieved -> increase load
- missing load data -> use fallback behavior
- no history -> show a baseline starting instruction

This gives the user direct actions instead of vague suggestions like "consider increasing."

### 5. Exercise feedback loop

Exercise cards collect post-set or post-session information such as:

- completion status
- difficulty feedback
- weight used
- reps completed
- sets completed
- RPE
- notes

Those values are saved with completed exercises and later used to personalize future recommendations.

### 6. Calendar continuity logic

The app does not only look at completed GymBuddy sessions. It also stores day-level records for:

- outside workouts
- planned rest days
- missed days

This allows the AI to reason about gaps in training rhythm and adjust future sessions accordingly.

### 7. Recommendation storage

Generated workouts are stored per date so the app does not have to regenerate the same day's session every time the dashboard loads.

This improves user experience and keeps the app more stable during a given day.

### 8. Mobile-first design decisions

The UI is optimized around smaller screens by using:

- card-based layouts
- compact hero sections
- touch-friendly controls
- route loading states
- smaller information chunks
- calendar views divided into manageable windows

## Database Design

The main schema lives in [supabase/schema.sql](</D:/work/GymBuddy/supabase/schema.sql>).

### Main tables

#### `profiles`

Stores the main training identity for each authenticated user.

#### `profile_limitations`

Stores limitations, injuries, dislikes, or constraints linked to a profile.

#### `profile_special_requests`

Stores long-term planning preferences that should stay in memory.

#### `workout_sessions`

Stores completed workout sessions.

#### `workout_exercises`

Stores each exercise inside a completed workout, along with feedback and load-related data.

#### `workout_day_logs`

Stores day-level continuity records such as:

- worked out outside the app
- planned rest day
- missed day

#### `ai_workout_recommendations`

Stores the AI-generated recommendation for a specific user and date.

### Security model

The project uses Supabase Row Level Security across user-owned tables.

RLS policies ensure a user can only read and write their own:

- profile
- limitations
- special requests
- workout sessions
- workout exercises
- workout day logs
- AI workout recommendations

## Project Structure

Key areas of the codebase:

- [app/auth/page.tsx](</D:/work/GymBuddy/app/auth/page.tsx>)
  Authentication screen.

- [app/onboarding/page.tsx](</D:/work/GymBuddy/app/onboarding/page.tsx>)
  Onboarding route.

- [app/dashboard/page.tsx](</D:/work/GymBuddy/app/dashboard/page.tsx>)
  Main home screen and workout entry point.

- [app/calendar/page.tsx](</D:/work/GymBuddy/app/calendar/page.tsx>)
  Dedicated calendar and activity history screen.

- [components/workout-card.tsx](</D:/work/GymBuddy/components/workout-card.tsx>)
  Exercise card UI, progression display, and feedback controls.

- [components/generate-workout-button.tsx](</D:/work/GymBuddy/components/generate-workout-button.tsx>)
  Workout generation UI and unresolved-day prompt flow.

- [lib/actions/workouts.ts](</D:/work/GymBuddy/lib/actions/workouts.ts>)
  Server actions for generating workouts, saving logs, and finishing sessions.

- [lib/data/workouts.ts](</D:/work/GymBuddy/lib/data/workouts.ts>)
  Reads workout and calendar data from Supabase.

- [lib/ai/generate-workout.ts](</D:/work/GymBuddy/lib/ai/generate-workout.ts>)
  Calls OpenAI and applies post-processing.

- [lib/ai/workout-prompt.ts](</D:/work/GymBuddy/lib/ai/workout-prompt.ts>)
  Prompt structure and response schema.

- [lib/workout-personalization.ts](</D:/work/GymBuddy/lib/workout-personalization.ts>)
  Deterministic progression and personalization logic.

- [supabase/schema.sql](</D:/work/GymBuddy/supabase/schema.sql>)
  Full database schema.

- [supabase/migrations/20260429_add_exercise_feedback_fields.sql](</D:/work/GymBuddy/supabase/migrations/20260429_add_exercise_feedback_fields.sql>)
  Adds exercise feedback and logging fields.

- [supabase/migrations/20260429_add_workout_day_logs.sql](</D:/work/GymBuddy/supabase/migrations/20260429_add_workout_day_logs.sql>)
  Adds day-level workout continuity tracking.

## Installation and Local Setup

### Prerequisites

You need:

- `Node.js`
- `npm`
- a Supabase project
- an OpenAI API key

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd GymBuddy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Copy `.env.example` into `.env.local` and fill in the values.

### 4. Apply the database schema

Run the SQL in [supabase/schema.sql](</D:/work/GymBuddy/supabase/schema.sql>) in your Supabase SQL Editor.

If your project already had an older schema, also apply:

- [supabase/migrations/20260429_add_exercise_feedback_fields.sql](</D:/work/GymBuddy/supabase/migrations/20260429_add_exercise_feedback_fields.sql>)
- [supabase/migrations/20260429_add_workout_day_logs.sql](</D:/work/GymBuddy/supabase/migrations/20260429_add_workout_day_logs.sql>)

### 5. Start the development server

```bash
npm run dev
```

Then open:

- [http://localhost:3000](http://localhost:3000)

## Supabase Setup

### Required setup steps

1. Create a Supabase project.
2. Enable email authentication or your preferred auth provider.
3. Run the SQL schema in Supabase SQL Editor.
4. Confirm RLS is enabled for the user-owned tables.
5. Copy the project keys into `.env.local`.

### Important note about RLS prompts in Supabase

When Supabase warns that a new table will not have RLS, that warning can still be expected if the same SQL script also enables RLS later in the file.

For this project, the schema explicitly enables RLS and creates policies for the main user-owned tables. If Supabase shows a choice while executing the SQL, use the option that keeps RLS enabled.

## Environment Variables

The project currently expects the following values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

### Variable purpose

- `NEXT_PUBLIC_SUPABASE_URL`
  Supabase project URL used by the client.

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  Public key used for client-side Supabase access.

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  Anonymous client key used by the app.

- `SUPABASE_SERVICE_ROLE_KEY`
  Server-side privileged key for backend operations that require elevated access.

- `OPENAI_API_KEY`
  API key used for AI workout generation.

## Available Scripts

From [package.json](</D:/work/GymBuddy/package.json>):

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

### Script purpose

- `npm run dev`
  Starts the local development server.

- `npm run build`
  Builds the app for production.

- `npm run start`
  Starts the production build.

- `npm run lint`
  Runs linting checks.

- `npm run typecheck`
  Runs TypeScript type checking without emitting files.

## Deployment

The simplest low-cost deployment setup is:

- frontend and Next.js hosting: `Vercel`
- backend, auth, and database: `Supabase`

### Typical deployment flow

1. Push the code to GitHub.
2. Import the repository into Vercel.
3. Add all environment variables in Vercel.
4. Point the app to your production Supabase project.
5. Run the schema and migrations in that Supabase project.
6. Deploy.

This is currently the easiest path for sharing the app with test users.

## Testing Guidance

### Manual testing flow

For a realistic test pass:

1. Open `/auth` and create an account.
2. Complete onboarding.
3. Generate today's workout.
4. Use the quick-request controls if needed.
5. Submit exercise feedback on a few cards.
6. Mark the workout complete.
7. Leave some dates unresolved and return later.
8. Verify the app asks whether those dates were off-app workouts, rest days, or missed days.
9. Generate the next workout and verify progression decisions are explicit.
10. Open `/calendar` and review continuity across views.

### Testing multiple profiles

Because the profile is tied to the authenticated `user_id`, one account updates its own profile instead of creating duplicates.

To test multiple user scenarios:

- use multiple sign-in accounts
- use email aliases
- reset profile rows in Supabase for a clean onboarding run

## Project Scope

### Current scope

The project currently covers:

- authentication
- onboarding and long-term profile memory
- AI-generated daily workouts
- workout session persistence
- per-exercise feedback and logging
- progression logic for repeated exercises
- missed-day and outside-workout tracking
- dedicated calendar page
- mobile-first web experience

### Intended product direction

The app is moving toward:

- adaptive coaching rather than static workouts
- lower-friction logging for casual users
- stronger progression support for serious users
- a web-first product that can later be packaged for Android

## Known Limitations

- workout generation currently depends on an external OpenAI API call
- recommendation quality improves when workout feedback is actually logged
- the system is focused on recent-history adaptation, not full long-term periodization
- Android packaging is a future step and is not part of the current repository
- monetization is not implemented yet
- progression logic is stronger now, but it still needs dedicated automated tests

## Future Improvements

Likely future work includes:

- automated tests for progression rules and workout flows
- stronger caching for faster dashboard loads
- richer progress analytics and charts
- Android packaging using a native shell strategy
- notification and reminder support
- offline-friendly workout execution
- subscription or revenue model
- trainer or coach sharing workflows

## Maintainer Notes

Update this README whenever any of the following changes:

- environment variables
- Supabase schema or migrations
- workout generation flow
- progression rules
- route structure
- deployment setup
- authentication flow
- mobile strategy

If the app behavior changes materially and the README does not, new collaborators will get the wrong mental model of the product.
