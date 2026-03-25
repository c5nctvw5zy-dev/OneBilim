import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, TrendingUp, CheckCircle, BarChart3, Bell, Eye, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const topStudents = [
  { name: "Назарбекова Айым", class: "11А", avg: 4.9 },
  { name: "Сейітов Арман", class: "10Б", avg: 4.8 },
  { name: "Қасымова Дана", class: "9А", avg: 4.8 },
  { name: "Мұхтаров Елдос", class: "11Б", avg: 4.7 },
  { name: "Байжанова Мадина", class: "10А", avg: 4.7 },
];

export default function DirectorHome() {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Оқушылар" value={840} icon={GraduationCap} color="blue" />
        <StatCard title="Мұғалімдер" value={62} icon={Users} color="green" />
        <StatCard title="Орташа балл" value="4.3" icon={TrendingUp} color="orange" />
        <StatCard title="Қатысу %" value="94.2%" icon={CheckCircle} color="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Жылдам әрекеттер</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/director/analytics")}><BarChart3 className="h-4 w-4" /> Жалпы статистика қарау</Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast({ title: "Хабарландырулар", description: "3 жаңа хабарландыру бар." })}><Bell className="h-4 w-4" /> Хабарландыруларды оқу</Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/director/students")}><Eye className="h-4 w-4" /> Оқушыларды бақылау</Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/director/documents")}><FileText className="h-4 w-4" /> Бұйрық шығару</Button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">ТОП-5 үздік оқушы</h3>
          <div className="space-y-2">
            {topStudents.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.class}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums">{s.avg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
