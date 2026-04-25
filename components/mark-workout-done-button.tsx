import { markTodaysWorkoutDone } from "@/lib/actions/workouts";

export function MarkWorkoutDoneButton() {
  return (
    <form action={markTodaysWorkoutDone}>
      <button
        type="submit"
        className="w-full rounded-full bg-clay px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Mark as Done
      </button>
    </form>
  );
}
