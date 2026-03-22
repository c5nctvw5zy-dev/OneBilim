import StatCard from "@/components/StatCard";
import { School, Users, GraduationCap, TrendingUp } from "lucide-react";

export default function SuperAdminAnalytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Аналитика</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Жалпы мектептер" value={127} icon={School} color="blue" />
        <StatCard title="Мұғалімдер" value="3,482" icon={Users} color="green" />
        <StatCard title="Оқушылар" value="45,210" icon={GraduationCap} color="orange" />
        <StatCard title="Орташа балл" value="4.2" icon={TrendingUp} color="blue" />
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-card-foreground">Мектептер бойынша статистика</h3>
        <p className="text-sm text-muted-foreground">Графиктер мен диаграммалар backend қосылғаннан кейін қолжетімді болады.</p>
      </div>
    </div>
  );
}
