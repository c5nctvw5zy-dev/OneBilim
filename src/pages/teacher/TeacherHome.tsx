import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { BookOpen, ClipboardList, Calendar, FileCheck, Clock, AlertTriangle, Users } from "lucide-react";

const todaySchedule = [
  { time: "08:30", subject: "Математика", class: "9А" },
  { time: "09:20", subject: "Математика", class: "10Б" },
  { time: "10:20", subject: "Алгебра", class: "11А" },
  { time: "11:10", subject: "Геометрия", class: "9Б" },
  { time: "12:10", subject: "Математика", class: "8А" },
  { time: "13:00", subject: "Алгебра", class: "10А" },
];

const lowGradeStudents = [
  { name: "Қайратов Нұрлан", class: "9А", avg: 2.8, subject: "Математика" },
  { name: "Ерболов Асқар", class: "10Б", avg: 2.5, subject: "Алгебра" },
  { name: "Сұлтанова Айгерім", class: "8А", avg: 3.0, subject: "Геометрия" },
];

const noGradeStudents = [
  { name: "Тұрсынов Дәулет", class: "9Б", subject: "Математика" },
  { name: "Байғанова Назым", class: "11А", subject: "Алгебра" },
];

const notifications = [
  { text: "9А сынып журналы тексерілді", time: "1 сағат бұрын" },
  { text: "Жаңа үй тапсырмасы жүктелді", time: "3 сағат бұрын" },
  { text: "Ата-аналар жиналысы: 10.04", time: "Кеше" },
];

export default function TeacherHome() {
  const navigate = useNavigate();
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
        <StatCard title="Бүгінгі сабақтар" value={6} icon={Calendar} color="blue" />
        <StatCard title="Бағасы аз оқушылар" value={lowGradeStudents.length} icon={AlertTriangle} color="red" />
        <StatCard title="Бағасы жоқ оқушылар" value={noGradeStudents.length} icon={Users} color="orange" />
        <StatCard title="Тапсырмалар" value={12} icon={ClipboardList} color="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">⚡ Жылдам әрекеттер</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/teacher/journal")}><BookOpen className="h-4 w-4" /> Баға қою</Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/teacher/homework")}><ClipboardList className="h-4 w-4" /> Үй тапсырмасын беру</Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/teacher/documents")}><FileCheck className="h-4 w-4" /> Құжат жүктеу</Button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">📅 Бүгінгі сабақ кестесі</h3>
          <div className="space-y-2">
            {todaySchedule.map((s, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-3">
                <span className="text-sm font-mono font-medium text-primary tabular-nums w-12">{s.time}</span>
                <span className="text-sm text-foreground flex-1">{s.subject}</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s.class}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-destructive/30 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Бағасы аз оқушылар</h3>
          <div className="space-y-2">
            {lowGradeStudents.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.class} · {s.subject}</p>
                </div>
                <span className="text-sm font-semibold text-destructive">{s.avg}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">📢 Хабарламалар</h3>
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-foreground">{n.text}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
