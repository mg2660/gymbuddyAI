import Link from "next/link";

interface MobileNavProps {
  active: "dashboard" | "profile";
  compact?: boolean;
}

function linkClass(isActive: boolean, compact: boolean) {
  return [
    "flex-1 rounded-full text-center font-semibold transition",
    compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm",
    isActive ? "bg-ink text-cream shadow-card" : "text-ink/70",
  ].join(" ");
}

export function MobileNav({ active, compact = false }: MobileNavProps) {
  return (
    <div className="z-20">
      <div
        className={[
          "card-surface mx-auto flex items-center gap-2 border border-black/5 shadow-card",
          compact ? "w-[180px] rounded-[22px] p-1.5" : "max-w-md rounded-[28px] p-2",
        ].join(" ")}
      >
        <Link href="/dashboard" className={linkClass(active === "dashboard", compact)}>
          Workout
        </Link>
        <Link href="/profile" className={linkClass(active === "profile", compact)}>
          Profile
        </Link>
      </div>
    </div>
  );
}
