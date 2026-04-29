import { ActionSubmitButton } from "@/components/action-submit-button";
import { markTodaysWorkoutDone } from "@/lib/actions/workouts";

export function MarkWorkoutDoneButton() {
  return (
    <form action={markTodaysWorkoutDone}>
      <ActionSubmitButton label="Mark as Done" loadingLabel="Saving workout..." />
    </form>
  );
}
