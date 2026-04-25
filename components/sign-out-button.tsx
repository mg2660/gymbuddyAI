import { signOut } from "@/lib/actions/auth";

interface SignOutButtonProps {
  compact?: boolean;
}

export function SignOutButton({ compact = false }: SignOutButtonProps) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        aria-label="Sign out"
        className={[
          "rounded-full border border-black/10 bg-white/80 text-ink transition hover:border-moss",
          compact ? "grid h-9 w-9 place-items-center" : "px-4 py-2 text-sm font-medium",
        ].join(" ")}
      >
        {compact ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        ) : (
          "Sign out"
        )}
      </button>
    </form>
  );
}
