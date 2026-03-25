import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialApplications = [
  { id: 1, school: "№45 Гимназия", city: "Шымкент", director: "Сейтова Г.М.", date: "2026-03-20", status: "Жаңа" },
  { id: 2, school: "№78 Мектеп", city: "Тараз", director: "Мұхамедов К.А.", date: "2026-03-19", status: "Жаңа" },
  { id: 3, school: "№3 Лицей", city: "Көкшетау", director: "Байжанова А.Б.", date: "2026-03-18", status: "Қаралуда" },
];

export default function SuperAdminApplications() {
  const [applications, setApplications] = useState(initialApplications);
  const { toast } = useToast();

  const handleApprove = (id: number) => {
    setApplications(applications.map(a => a.id === id ? { ...a, status: "Мақұлданды" } : a));
    toast({ title: "Өтінім мақұлданды!", description: "Мектеп жүйеге қосылды." });
  };

  const handleReject = (id: number) => {
    setApplications(applications.map(a => a.id === id ? { ...a, status: "Қабылданбады" } : a));
    toast({ title: "Өтінім қабылданбады", variant: "destructive" });
  };

  const statusColors: Record<string, string> = {
    "Жаңа": "bg-warning/10 text-warning",
    "Қаралуда": "bg-primary/10 text-primary",
    "Мақұлданды": "bg-success/10 text-success",
    "Қабылданбады": "bg-destructive/10 text-destructive",
  };

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
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[a.status] || "bg-muted text-muted-foreground"}`}>{a.status}</span>
                {(a.status === "Жаңа" || a.status === "Қаралуда") && (
                  <>
                    <Button size="sm" variant="success" className="gap-1" onClick={() => handleApprove(a.id)}><Check className="h-3.5 w-3.5" /> Мақұлдау</Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleReject(a.id)}><X className="h-3.5 w-3.5" /> Қабылдамау</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
