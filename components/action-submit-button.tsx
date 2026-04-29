"use client";

import { useFormStatus } from "react-dom";

interface ActionSubmitButtonProps {
  label: string;
  loadingLabel: string;
  variant?: "primary" | "secondary";
}

function WorkoutPulseGlyph() {
  return (
    <span className="relative inline-flex h-5 w-5 items-center justify-center">
      <span className="absolute h-5 w-5 rounded-full border border-current/30 animate-[pulse_1.2s_ease-out_infinite]" />
      <span className="absolute h-3.5 w-3.5 rounded-full border border-current/45 animate-[pulse_1.2s_ease-out_0.2s_infinite]" />
      <span className="relative block h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}

export function ActionSubmitButton({
  label,
  loadingLabel,
  variant = "primary",
}: ActionSubmitButtonProps) {
  const { pending } = useFormStatus();

  const className = [
    "w-full rounded-full px-5 py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-80",
    variant === "primary"
      ? "bg-clay text-white hover:opacity-90"
      : "border border-black/10 bg-white/85 text-ink hover:border-moss",
  ].join(" ");

  return (
    <button type="submit" disabled={pending} className={className}>
      <span className="flex items-center justify-center gap-2">
        {pending ? <WorkoutPulseGlyph /> : null}
        <span>{pending ? loadingLabel : label}</span>
      </span>
    </button>
  );
}
