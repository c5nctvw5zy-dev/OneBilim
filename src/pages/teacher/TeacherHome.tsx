import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { BookOpen, ClipboardList, Calendar, Upload, FileCheck } from "lucide-react";

export default function TeacherHome() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Бүгінгі сабақтар" value={6} icon={Calendar} color="blue" />
        <StatCard title="Тапсырмалар" value={12} icon={ClipboardList} color="green" />
        <StatCard title="Тексерілмеген" value={8} icon={BookOpen} color="orange" />
        <StatCard title="Материалдар" value={34} icon={Upload} color="blue" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Жылдам әрекеттер</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2"><BookOpen className="h-4 w-4" /> Баға қою</Button>
            <Button variant="outline" className="w-full justify-start gap-2"><ClipboardList className="h-4 w-4" /> Үй тапсырмасын беру</Button>
            <Button variant="outline" className="w-full justify-start gap-2"><FileCheck className="h-4 w-4" /> Құжат жүктеу</Button>
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Бүгінгі сабақ кестесі</h3>
          <div className="space-y-2">
            {[
              { time: "08:30", subject: "Математика", class: "9А" },
              { time: "09:20", subject: "Математика", class: "10Б" },
              { time: "10:20", subject: "Алгебра", class: "11А" },
              { time: "11:10", subject: "Геометрия", class: "9Б" },
              { time: "12:10", subject: "Математика", class: "8А" },
              { time: "13:00", subject: "Алгебра", class: "10А" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-3">
                <span className="text-sm font-mono font-medium text-primary tabular-nums w-12">{s.time}</span>
                <span className="text-sm text-foreground flex-1">{s.subject}</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s.class}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
