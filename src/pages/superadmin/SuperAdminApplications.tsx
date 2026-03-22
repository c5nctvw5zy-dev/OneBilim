import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const applications = [
  { id: 1, school: "№45 Гимназия", city: "Шымкент", director: "Сейтова Г.М.", date: "2025-03-20", status: "Жаңа" },
  { id: 2, school: "№78 Мектеп", city: "Тараз", director: "Мұхамедов К.А.", date: "2025-03-19", status: "Жаңа" },
  { id: 3, school: "№3 Лицей", city: "Көкшетау", director: "Байжанова А.Б.", date: "2025-03-18", status: "Қаралуда" },
];

export default function SuperAdminApplications() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Өтінімдер</h2>
      <div className="space-y-4">
        {applications.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">{a.school}</h3>
                <p className="text-sm text-muted-foreground">{a.city} · Директор: {a.director}</p>
                <p className="mt-1 text-xs text-muted-foreground">Жіберілген: {a.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">{a.status}</span>
                <Button size="sm" variant="success" className="gap-1"><Check className="h-3.5 w-3.5" /> Мақұлдау</Button>
                <Button size="sm" variant="destructive" className="gap-1"><X className="h-3.5 w-3.5" /> Қабылдамау</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
