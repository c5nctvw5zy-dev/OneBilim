import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const weekData = [
  { day: 1, label: "Дүйсенбі", lessons: [
    { subject: "Математика", grade: 5 }, { subject: "Қазақ тілі", grade: 4 },
    { subject: "Физика", grade: 5 }, { subject: "Дене шынықтыру", grade: 5 },
  ]},
  { day: 2, label: "Сейсенбі", lessons: [
    { subject: "Биология", grade: 4 }, { subject: "Ағылшын тілі", grade: 4 },
    { subject: "Тарих", grade: 5 },
  ]},
  { day: 3, label: "Сәрсенбі", lessons: [
    { subject: "Математика", grade: 5 }, { subject: "Химия", grade: 4 },
    { subject: "Информатика", grade: 5 },
  ]},
  { day: 4, label: "Бейсенбі", lessons: [
    { subject: "Қазақ тілі", grade: 4 }, { subject: "Физика", grade: 5 },
    { subject: "Ағылшын тілі", grade: 3 },
  ]},
  { day: 5, label: "Жұма", lessons: [
    { subject: "Математика", grade: 5 }, { subject: "Тарих", grade: 5 },
    { subject: "Биология", grade: 4 },
  ]},
];

const colorFor = (g: number) =>
  g === 5 ? "bg-success/10 text-success border-success/30"
  : g === 4 ? "bg-primary/10 text-primary border-primary/30"
  : g === 3 ? "bg-warning/10 text-warning border-warning/30"
  : "bg-destructive/10 text-destructive border-destructive/30";

export default function GradesPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekAvg = useMemo(() => {
    const all = weekData.flatMap(d => d.lessons.map(l => l.grade));
    return all.length ? (all.reduce((a, b) => a + b, 0) / all.length).toFixed(2) : "—";
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Бағалар</h2>
          <p className="text-sm text-muted-foreground">Апта бойынша күн-күнімен бағалар</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium px-3">{weekOffset === 0 ? "Осы апта" : weekOffset < 0 ? `${Math.abs(weekOffset)} апта бұрын` : `${weekOffset} апта кейін`}</span>
          <Button size="icon" variant="outline" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Апта орташасы</span>
        <span className="text-2xl font-bold text-primary tabular-nums">{weekAvg}</span>
      </div>

      <div className="space-y-3">
        {weekData.map(d => (
          <div key={d.day} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="bg-primary/5 px-4 py-2 font-semibold text-primary flex items-center justify-between">
              <span>{d.label}</span>
              <span className="text-xs font-normal text-muted-foreground">{d.lessons.length} сабақ</span>
            </div>
            {d.lessons.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">Сабақ жоқ</p>
            ) : (
              <div className="divide-y divide-border">
                {d.lessons.map((l, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm font-medium">{l.subject}</span>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold border ${colorFor(l.grade)}`}>{l.grade}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
