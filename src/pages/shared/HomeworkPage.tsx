import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialHomework = [
  { id: 1, subject: "Математика", title: "15-жаттығу, 1-10 тапсырмалар", due: "2026-03-24", status: "Берілді" },
  { id: 2, subject: "Қазақ тілі", title: "Шығарма: 'Менің елім'", due: "2026-03-25", status: "Берілді" },
  { id: 3, subject: "Физика", title: "Тест №4 дайындық", due: "2026-03-26", status: "Берілді" },
  { id: 4, subject: "Ағылшын тілі", title: "Unit 5, exercises 1-8", due: "2026-03-23", status: "Орындалды" },
  { id: 5, subject: "Биология", title: "Зертханалық жұмыс есебі", due: "2026-03-22", status: "Орындалды" },
];

const statusColors: Record<string, string> = {
  "Берілді": "bg-warning/10 text-warning",
  "Орындалды": "bg-success/10 text-success",
  "Жүктелді": "bg-primary/10 text-primary",
};

export default function HomeworkPage({ canUpload = false }: { canUpload?: boolean }) {
  const [homework, setHomework] = useState(initialHomework);
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    setHomework([{ id: Date.now(), subject: newSubject || "—", title: newTitle, due: newDue || "—", status: "Берілді" }, ...homework]);
    setNewSubject(""); setNewTitle(""); setNewDue(""); setShowAdd(false);
    toast({ title: "Тапсырма берілді!", description: newTitle });
  };

  const handleUpload = (id: number) => {
    setHomework(homework.map(h => h.id === id ? { ...h, status: "Жүктелді" } : h));
    toast({ title: "Жауап жүктелді!", description: "Мұғалімге жіберілді." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Үй тапсырмалар</h2>
        {!canUpload && (
          <Button onClick={() => setShowAdd(!showAdd)} className="gap-2"><Plus className="h-4 w-4" /> Тапсырма беру</Button>
        )}
      </div>

      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Жаңа тапсырма</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input placeholder="Пән" value={newSubject} onChange={e => setNewSubject(e.target.value)} />
            <Input placeholder="Тапсырма атауы" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <Input type="date" value={newDue} onChange={e => setNewDue(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd}>Беру</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Болдырмау</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {homework.map(h => (
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
                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => handleUpload(h.id)}>
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
