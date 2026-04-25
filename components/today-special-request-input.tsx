interface TodaySpecialRequestInputProps {
  defaultValue?: string;
}

const quickIdeas = [
  "Low energy today",
  "More cardio today",
  "Keep it short today",
  "Recovery-focused session",
  "Arms focus today",
];

export function TodaySpecialRequestInput({ defaultValue }: TodaySpecialRequestInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="todaySpecialRequest" className="text-sm font-medium text-ink">
          Today&apos;s special request
        </label>
        <textarea
          id="todaySpecialRequest"
          name="todaySpecialRequest"
          rows={3}
          defaultValue={defaultValue ?? ""}
          className="w-full rounded-[24px] border border-black/10 bg-white/70 px-4 py-4 text-sm leading-6 outline-none transition focus:border-moss"
          placeholder="Example: I feel low energy today, so keep it lighter and shorter."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {quickIdeas.map((idea) => (
          <span
            key={idea}
            className="rounded-full bg-sand px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink"
          >
            {idea}
          </span>
        ))}
      </div>
    </div>
  );
}
