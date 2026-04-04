import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, TrendingUp, CheckCircle, BarChart3, Bell, Eye, FileText, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const topStudents = [
  { name: "Назарбекова Айым", class: "11А", avg: 4.9 },
  { name: "Сейітов Арман", class: "10Б", avg: 4.8 },
  { name: "Қасымова Дана", class: "9А", avg: 4.8 },
  { name: "Мұхтаров Елдос", class: "11Б", avg: 4.7 },
  { name: "Байжанова Мадина", class: "10А", avg: 4.7 },
  { name: "Тұрсынов Асқар", class: "9Б", avg: 4.6 },
  { name: "Ахметова Сара", class: "11А", avg: 4.6 },
  { name: "Жұмабеков Ерлан", class: "10А", avg: 4.5 },
  { name: "Ерланова Камила", class: "9А", avg: 4.5 },
  { name: "Қайратов Нұрсұлтан", class: "10Б", avg: 4.4 },
];

const problemClasses = [
  { name: "8Б", avg: 3.2, attendance: 82, issue: "Төмен үлгерім" },
  { name: "7А", avg: 3.5, attendance: 78, issue: "Қатысу төмен" },
  { name: "9В", avg: 3.4, attendance: 85, issue: "Орташа балл төмен" },
];

export default function DirectorHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString("kk-KZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <Clock className="h-5 w-5 text-primary" />
        <span className="text-lg font-mono font-semibold text-foreground tabular-nums">{timeStr}</span>
        <span className="text-sm text-muted-foreground">· {dateStr}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Оқушылар" value={840} icon={GraduationCap} color="blue" />
        <StatCard title="Мұғалімдер" value={62} icon={Users} color="green" />
        <StatCard title="Орташа балл" value="4.3" icon={TrendingUp} color="orange" />
        <StatCard title="Қатысу %" value="94.2%" icon={CheckCircle} color="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">⚡ Жылдам әрекеттер</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/director/analytics")}><BarChart3 className="h-4 w-4" /> Жалпы статистиканы көру</Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/director/chat")}><Bell className="h-4 w-4" /> Хабарландыру жазу</Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/director/students")}><Eye className="h-4 w-4" /> Оқушыларды бақылау</Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/director/documents")}><FileText className="h-4 w-4" /> Бұйрық шығару</Button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">🏆 ТОП-10 үздік оқушы</h3>
          <div className="space-y-2 max-h-[340px] overflow-auto">
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

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" /> Проблемалы сыныптар</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {problemClasses.map((c) => (
            <div key={c.name} className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-base font-semibold text-foreground">{c.name} сынып</p>
              <p className="text-xs text-muted-foreground mt-1">Орташа: {c.avg} · Қатысу: {c.attendance}%</p>
              <p className="text-xs text-destructive mt-1">{c.issue}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
