import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "orange" | "red";
}

const colorMap = {
  blue: { card: "stat-card-blue", icon: "text-primary", iconBg: "bg-primary/10" },
  green: { card: "stat-card-green", icon: "text-success", iconBg: "bg-success/10" },
  orange: { card: "stat-card-orange", icon: "text-warning", iconBg: "bg-warning/10" },
  red: { card: "stat-card-red", icon: "text-destructive", iconBg: "bg-destructive/10" },
};

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl p-5 ${c.card} transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.iconBg}`}>
          <Icon className={`h-6 w-6 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}
