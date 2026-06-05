import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const baseHomework = [
  { id: 1, day: 1, subject: "Математика", title: "15-жаттығу, 1-10 тапсырмалар", due: "Сейсенбі", status: "Берілді" },
  { id: 2, day: 1, subject: "Қазақ тілі", title: "Шығарма: 'Менің елім'", due: "Сейсенбі", status: "Берілді" },
  { id: 3, day: 2, subject: "Физика", title: "Тест №4 дайындық", due: "Сәрсенбі", status: "Берілді" },
  { id: 4, day: 3, subject: "Ағылшын тілі", title: "Unit 5, exercises 1-8", due: "Бейсенбі", status: "Орындалды" },
  { id: 5, day: 4, subject: "Биология", title: "Зертханалық жұмыс есебі", due: "Жұма", status: "Орындалды" },
  { id: 6, day: 5, subject: "Тарих", title: "§24 параграф мазмұндама", due: "Дүйсенбі", status: "Берілді" },
];

const dayLabels = ["Дүйсенбі", "Сейсенбі", "Сәрсенбі", "Бейсенбі", "Жұма", "Сенбі"];

const statusColors: Record<string, string> = {
  "Берілді": "bg-warning/10 text-warning",
  "Орындалды": "bg-success/10 text-success",
  "Жүктелді": "bg-primary/10 text-primary",
};

export default function HomeworkPage({ canUpload = false }: { canUpload?: boolean }) {
  const [homework, setHomework] = useState(baseHomework);
  const [weekOffset, setWeekOffset] = useState(0);
  const { toast } = useToast();

  const grouped = useMemo(() => {
    const map: Record<number, typeof baseHomework> = {};
    homework.forEach(h => { (map[h.day] = map[h.day] || []).push(h); });
    return map;
  }, [homework]);

  const handleUpload = (id: number) => {
    setHomework(homework.map(h => h.id === id ? { ...h, status: "Жүктелді" } : h));
    toast({ title: "Жауап жүктелді!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Үй тапсырмалар</h2>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium px-3">{weekOffset === 0 ? "Осы апта" : weekOffset < 0 ? `${Math.abs(weekOffset)} апта бұрын` : `${weekOffset} апта кейін`}</span>
          <Button size="icon" variant="outline" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="space-y-3">
        {dayLabels.slice(0, 6).map((label, idx) => {
          const day = idx + 1;
          const items = grouped[day] || [];
          return (
            <div key={day} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-primary/5 px-4 py-2 font-semibold text-primary flex items-center justify-between">
                <span>{label}</span>
                <span className="text-xs font-normal text-muted-foreground">{items.length} тапсырма</span>
              </div>
              {items.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Тапсырма жоқ</div>
              ) : (
                <div className="divide-y divide-border">
                  {items.map(h => (
                    <div key={h.id} className="p-3 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{h.subject}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[h.status]}`}>{h.status}</span>
                        </div>
                        <p className="text-sm font-medium">{h.title}</p>
                      </div>
                      {canUpload && h.status === "Берілді" && (
                        <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => handleUpload(h.id)}>
                          <Upload className="h-3.5 w-3.5" /> Жауап
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
