import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  label?: string;
  className?: string;
  fullscreen?: boolean;
}

const SIZES: Record<string, { box: string; icon: string; ring: string; text: string }> = {
  xs: { box: "h-5 w-5", icon: "h-3 w-3", ring: "border", text: "text-xs" },
  sm: { box: "h-7 w-7", icon: "h-4 w-4", ring: "border-2", text: "text-xs" },
  md: { box: "h-12 w-12", icon: "h-6 w-6", ring: "border-2", text: "text-sm" },
  lg: { box: "h-16 w-16", icon: "h-8 w-8", ring: "border-[3px]", text: "text-base" },
  xl: { box: "h-24 w-24", icon: "h-12 w-12", ring: "border-4", text: "text-lg" },
};

export default function BilimLoader({ size = "md", label, className, fullscreen }: Props) {
  const s = SIZES[size];
  const node = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn("relative inline-flex items-center justify-center", s.box)}>
        <span
          className={cn(
            "absolute inset-0 rounded-full animate-spin border-primary/20 border-t-primary",
            s.ring
          )}
          style={{ animationDuration: "1.1s" }}
        />
        <GraduationCap
          className={cn(s.icon, "text-primary animate-pulse")}
          strokeWidth={2.2}
        />
      </div>
      {label && <p className={cn("text-muted-foreground font-medium", s.text)}>{label}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
        {node}
      </div>
    );
  }
  return node;
}

/** Compact inline spinner (logo only, no label) — for buttons */
export function BilimSpinner({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-4 w-4 items-center justify-center", className)}>
      <span
        className="absolute inset-0 rounded-full border border-current/30 border-t-current animate-spin"
        style={{ animationDuration: "1s" }}
      />
      <GraduationCap className="h-2.5 w-2.5" strokeWidth={2.5} />
    </span>
  );
}
