export default function AppLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-5 px-6 py-10">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-clay/20 blur-2xl" />
        <div className="relative grid h-20 w-20 place-items-center rounded-full border border-black/10 bg-white/80 shadow-card">
          <div className="h-10 w-10 rounded-full border-4 border-moss/20 border-t-moss animate-spin" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-moss">Gym Buddy AI</p>
        <h1 className="text-2xl font-semibold text-ink">Loading your session</h1>
        <p className="text-sm leading-6 text-ink/68">
          Bringing in your profile, recovery context, and latest workout data.
        </p>
      </div>
    </main>
  );
}
