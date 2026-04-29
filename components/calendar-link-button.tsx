import Link from "next/link";

interface CalendarLinkButtonProps {
  compact?: boolean;
}

export function CalendarLinkButton({ compact = false }: CalendarLinkButtonProps) {
  return (
    <Link
      href="/calendar"
      aria-label="Open calendar"
      className={[
        "rounded-full border border-black/10 bg-white/80 text-ink transition hover:border-moss",
        compact ? "grid h-9 w-9 place-items-center" : "px-4 py-2 text-sm font-medium",
      ].join(" ")}
    >
      {compact ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
        </svg>
      ) : (
        "Calendar"
      )}
    </Link>
  );
}
