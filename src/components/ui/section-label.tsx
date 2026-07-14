import { cn } from "@/lib/utils";

interface SectionLabelProps {
  index: number;
  label: string;
  className?: string;
}

/**
 * A numbered "eyebrow" bar, e.g. "N.001   WHY   N.001", styled after
 * techy editorial grid labels. Renders a hairline top/bottom border with
 * the section number mirrored on both sides of the label.
 */
export function SectionLabel({ index, label, className }: SectionLabelProps) {
  const n = `N.${String(index).padStart(3, "0")}`;
  return (
    <div
      className={cn(
        "eyebrow flex items-center justify-between gap-3 border-y border-border/60 py-2",
        className
      )}
    >
      <span>{n}</span>
      <span className="text-foreground/70">{label}</span>
      <span>{n}</span>
    </div>
  );
}
