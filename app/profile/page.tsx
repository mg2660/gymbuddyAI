import Link from "next/link";
import { redirect } from "next/navigation";
import { MobileNav } from "@/components/mobile-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { getCurrentUserProfile } from "@/lib/data/profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function prettyLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <main className="screen-fade mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
      <header className="flex items-center justify-between gap-2">
        <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.34em] text-moss sm:text-xs">
          Gym Buddy AI
        </p>
        <MobileNav active="profile" compact />
        <SignOutButton compact />
      </header>

      <section className="ink-surface float-in overflow-hidden rounded-[36px] px-5 py-6 text-cream sm:px-7 sm:py-7">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cream/65">Profile</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-[2.7rem]">{profile.fullName}</h1>
            <p className="max-w-md text-sm leading-7 text-cream/80">
              Long-term goals, limitations, and preferences live here so the workout screen can stay calm and
              focused.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-cream transition hover:bg-white/15"
          >
            Edit
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-cream/85">
            Goal: {prettyLabel(profile.goal)}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-cream/85">
            {profile.experienceLevel}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-cream/85">
            {profile.trainingDaysPerWeek} days / week
          </span>
          <span className="rounded-full bg-clay px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white">
            {profile.sessionLengthMinutes} min sessions
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card-surface rounded-[32px] border border-black/5 p-5 shadow-card sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Core Setup</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[24px] bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-moss">Long-Term Goal</p>
              <p className="mt-2 text-lg font-semibold text-ink">{prettyLabel(profile.goal)}</p>
            </div>
            <div className="rounded-[24px] bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-moss">Experience</p>
              <p className="mt-2 text-lg font-semibold text-ink">{profile.experienceLevel}</p>
            </div>
            <div className="rounded-[24px] bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-moss">Training Setup</p>
              <p className="mt-2 text-sm leading-6 text-ink/80">
                {profile.trainingDaysPerWeek} training days per week, {profile.sessionLengthMinutes} minutes per
                session, mainly {profile.preferredLocation}.
              </p>
            </div>
            <div className="rounded-[24px] bg-white/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-moss">Age</p>
              <p className="mt-2 text-lg font-semibold text-ink">{profile.age ?? "Not added"}</p>
            </div>
          </div>
        </article>

        <article className="card-surface rounded-[32px] border border-black/5 p-5 shadow-card sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Equipment Access</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.availableEquipment.map((item) => (
              <span
                key={item}
                className="rounded-full bg-sand px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink"
              >
                {prettyLabel(item)}
              </span>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] bg-white/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-moss">Location</p>
            <p className="mt-2 text-sm leading-6 text-ink/80">{prettyLabel(profile.preferredLocation)}</p>
          </div>
        </article>
      </section>

      <article className="card-surface rounded-[32px] border border-black/5 p-5 shadow-card sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Limitations</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">What the planner should avoid</h2>
        </div>

        <div className="mt-5 grid gap-3">
          {profile.limitations.length > 0 ? (
            profile.limitations.map((item) => (
              <div key={`${item.kind}-${item.label}`} className="rounded-[24px] bg-white/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sand px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-ink">
                    {prettyLabel(item.kind)}
                  </span>
                </div>
                <p className="mt-3 text-base font-semibold text-ink">{item.label}</p>
                {item.notes ? <p className="mt-2 text-sm leading-6 text-ink/75">{item.notes}</p> : null}
              </div>
            ))
          ) : (
            <div className="rounded-[24px] bg-white/60 p-4 text-sm text-ink/75">No limitations saved yet.</div>
          )}
        </div>
      </article>

      <article className="card-surface rounded-[32px] border border-black/5 p-5 shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-moss">Persistent Requests</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Long-term workout preferences</h2>

        <div className="mt-5 grid gap-3">
          {profile.specialRequests.length > 0 ? (
            profile.specialRequests.map((item) => (
              <div key={item.title} className="rounded-[24px] bg-white/60 p-4">
                <p className="text-base font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-ink/75">{item.details}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] bg-white/60 p-4 text-sm text-ink/75">
              No persistent requests saved yet.
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
