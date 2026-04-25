"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { regenerateTodaysWorkout, resetTodaysWorkout } from "@/lib/actions/workouts";

interface WorkoutRoutineActionsProps {
  todaySpecialRequest?: string;
}

function WorkoutOptionsModal({
  todaySpecialRequest,
  onClose,
}: {
  todaySpecialRequest?: string;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-md">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="card-surface relative z-[101] w-full max-w-sm rounded-[30px] border border-black/5 p-4 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Workout Options</p>
            <h3 className="mt-2 text-2xl font-semibold text-ink">Change today&apos;s routine</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              If this workout does not feel right, you can generate another one or go back and update today&apos;s
              request.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white/70 text-ink transition hover:border-moss"
          >
            ×
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <form action={regenerateTodaysWorkout}>
            <input type="hidden" name="todaySpecialRequest" value={todaySpecialRequest ?? ""} />
            <button
              type="submit"
              className="w-full rounded-full border border-black/10 bg-white/85 px-5 py-4 text-sm font-semibold text-ink transition hover:border-moss"
            >
              Generate another
            </button>
          </form>

          <form action={resetTodaysWorkout}>
            <button
              type="submit"
              className="w-full rounded-full border border-black/10 bg-white/85 px-5 py-4 text-sm font-semibold text-ink transition hover:border-moss"
            >
              Back to request
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function WorkoutRoutineActions({ todaySpecialRequest }: WorkoutRoutineActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Workout options"
        onClick={() => setIsOpen(true)}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-white/80 text-ink shadow-card transition hover:border-moss"
      >
        ?
      </button>

      {mounted && isOpen ? (
        <WorkoutOptionsModal
          todaySpecialRequest={todaySpecialRequest}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
}
