import { fitnessGoals, experienceLevels } from "@/lib/onboarding";
import { saveOnboardingProfile } from "@/lib/actions/profile";
import type { UserProfile } from "@/lib/types";

interface OnboardingFormProps {
  initialProfile?: UserProfile | null;
}

function defaultLimitations(profile?: UserProfile | null) {
  if (!profile || profile.limitations.length === 0) {
    return "";
  }

  return profile.limitations
    .map((item) => [item.kind, item.label, item.notes].filter(Boolean).join(" | "))
    .join("\n");
}

function defaultSpecialRequests(profile?: UserProfile | null) {
  if (!profile || profile.specialRequests.length === 0) {
    return "";
  }

  return profile.specialRequests.map((item) => `${item.title} | ${item.details}`).join("\n");
}

function defaultEquipment(profile?: UserProfile | null) {
  return profile?.availableEquipment.join(", ") ?? "";
}

export function OnboardingForm({ initialProfile }: OnboardingFormProps) {
  return (
    <form action={saveOnboardingProfile} className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="fullName" className="text-sm font-medium text-ink">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            defaultValue={initialProfile?.fullName ?? ""}
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="age" className="text-sm font-medium text-ink">
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min={13}
            max={100}
            defaultValue={initialProfile?.age ?? ""}
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="goal" className="text-sm font-medium text-ink">
            Main goal
          </label>
          <select
            id="goal"
            name="goal"
            defaultValue={initialProfile?.goal ?? "recomposition"}
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
          >
            {fitnessGoals.map((goal) => (
              <option key={goal} value={goal}>
                {goal.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="experienceLevel" className="text-sm font-medium text-ink">
            Experience level
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            defaultValue={initialProfile?.experienceLevel ?? "intermediate"}
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
          >
            {experienceLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="trainingDaysPerWeek" className="text-sm font-medium text-ink">
            Training days per week
          </label>
          <input
            id="trainingDaysPerWeek"
            name="trainingDaysPerWeek"
            type="number"
            min={1}
            max={7}
            defaultValue={initialProfile?.trainingDaysPerWeek ?? 4}
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sessionLengthMinutes" className="text-sm font-medium text-ink">
            Session length in minutes
          </label>
          <input
            id="sessionLengthMinutes"
            name="sessionLengthMinutes"
            type="number"
            min={20}
            max={180}
            defaultValue={initialProfile?.sessionLengthMinutes ?? 60}
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="preferredLocation" className="text-sm font-medium text-ink">
            Training location
          </label>
          <select
            id="preferredLocation"
            name="preferredLocation"
            defaultValue={initialProfile?.preferredLocation ?? "gym"}
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
          >
            <option value="gym">Gym</option>
            <option value="home">Home</option>
            <option value="hybrid">Both</option>
          </select>
        </div>
      </section>

      <section className="space-y-2">
        <label htmlFor="availableEquipment" className="text-sm font-medium text-ink">
          Available equipment
        </label>
        <textarea
          id="availableEquipment"
          name="availableEquipment"
          defaultValue={defaultEquipment(initialProfile)}
          rows={3}
          className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
          placeholder="Example: full_gym, dumbbells, bench, cables"
          required
        />
        <p className="text-xs uppercase tracking-[0.16em] text-moss">
          Use comma-separated values like `dumbbells, bench, bands`.
        </p>
      </section>

      <section className="space-y-2">
        <label htmlFor="limitations" className="text-sm font-medium text-ink">
          Limitations database
        </label>
        <textarea
          id="limitations"
          name="limitations"
          defaultValue={defaultLimitations(initialProfile)}
          rows={5}
          className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
          placeholder={"One per line: kind | label | notes\nExample: injury | Avoid heavy overhead press | Right shoulder irritation"}
        />
        <p className="text-xs uppercase tracking-[0.16em] text-moss">
          One per line using `kind | label | notes`. Kinds: `equipment_missing`, `injury`, `movement_dislike`, `schedule`, `custom`.
        </p>
      </section>

      <section className="space-y-2">
        <label htmlFor="specialRequests" className="text-sm font-medium text-ink">
          Special workout requests
        </label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          defaultValue={defaultSpecialRequests(initialProfile)}
          rows={4}
          className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-moss"
          placeholder={"One per line: title | details\nExample: Upper chest priority | Include one incline movement on push days"}
        />
        <p className="text-xs uppercase tracking-[0.16em] text-moss">One per line using `title | details`.</p>
      </section>

      <button
        type="submit"
        className="w-full rounded-full bg-ink px-5 py-4 text-sm font-semibold text-cream transition hover:opacity-90"
      >
        Save profile and continue
      </button>
    </form>
  );
}
