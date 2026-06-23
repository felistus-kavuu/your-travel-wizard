import { INTERESTS, type Interest } from "@/lib/trip-types";
import { cn } from "@/lib/utils";

type Props = {
  value: Interest[];
  onChange: (next: Interest[]) => void;
};

export function InterestPills({ value, onChange }: Props) {
  const toggle = (i: Interest) => {
    onChange(value.includes(i) ? value.filter((v) => v !== i) : [...value, i]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {INTERESTS.map((i) => {
        const active = value.includes(i);
        return (
          <button
            type="button"
            key={i}
            onClick={() => toggle(i)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all",
              active
                ? "border-accent bg-accent text-accent-foreground shadow-[var(--shadow-gold)]"
                : "border-border bg-card text-foreground hover:border-accent/60 hover:bg-accent/10",
            )}
          >
            {i}
          </button>
        );
      })}
    </div>
  );
}
