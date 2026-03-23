import { Button } from "@/components/ui/button";
import { ClipboardList, Upload, CheckCircle } from "lucide-react";

const demoHomework = [
  { id: 1, subject: "Математика", title: "15-жаттығу, 1-10 тапсырмалар", due: "2026-03-24", status: "Берілді" },
  { id: 2, subject: "Қазақ тілі", title: "Шығарма: 'Менің елім'", due: "2026-03-25", status: "Берілді" },
  { id: 3, subject: "Физика", title: "Тест №4 дайындық", due: "2026-03-26", status: "Берілді" },
  { id: 4, subject: "Ағылшын тілі", title: "Unit 5, exercises 1-8", due: "2026-03-23", status: "Орындалды" },
  { id: 5, subject: "Биология", title: "Зертханалық жұмыс есебі", due: "2026-03-22", status: "Орындалды" },
];

const statusColors: Record<string, string> = {
  "Берілді": "bg-warning/10 text-warning",
  "Орындалды": "bg-success/10 text-success",
};

export default function HomeworkPage({ canUpload = false }: { canUpload?: boolean }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Үй тапсырмалар</h2>
      <div className="space-y-3">
        {demoHomework.map(h => (
          <div key={h.id} className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{h.subject}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[h.status]}`}>{h.status}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{h.title}</p>
                <p className="text-xs text-muted-foreground mt-1">Мерзімі: {h.due}</p>
              </div>
              {canUpload && h.status === "Берілді" && (
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <Upload className="h-3.5 w-3.5" />
                  Жауап жүктеу
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
