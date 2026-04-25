import { TodaySpecialRequestInput } from "@/components/today-special-request-input";
import { generateTodaysWorkout } from "@/lib/actions/workouts";

interface GenerateWorkoutButtonProps {
  defaultSpecialRequest?: string;
}

export function GenerateWorkoutButton({ defaultSpecialRequest }: GenerateWorkoutButtonProps) {
  return (
    <form action={generateTodaysWorkout} className="space-y-5">
      <TodaySpecialRequestInput defaultValue={defaultSpecialRequest} />
      <button
        type="submit"
        className="w-full rounded-full bg-clay px-5 py-4 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Generate Today&apos;s Workout
      </button>
    </form>
  );
}
