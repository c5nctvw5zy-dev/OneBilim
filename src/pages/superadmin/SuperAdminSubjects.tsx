import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";

const initialSubjects = [
  { id: 1, name: "Математика", nameRu: "Математика" },
  { id: 2, name: "Қазақ тілі", nameRu: "Казахский язык" },
  { id: 3, name: "Орыс тілі", nameRu: "Русский язык" },
  { id: 4, name: "Ағылшын тілі", nameRu: "Английский язык" },
  { id: 5, name: "Физика", nameRu: "Физика" },
  { id: 6, name: "Химия", nameRu: "Химия" },
  { id: 7, name: "Биология", nameRu: "Биология" },
  { id: 8, name: "Тарих", nameRu: "История" },
  { id: 9, name: "География", nameRu: "География" },
  { id: 10, name: "Информатика", nameRu: "Информатика" },
];

export default function SuperAdminSubjects() {
  const [subjects] = useState(initialSubjects);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Пәндер</h2>
        <Button><Plus className="h-4 w-4" /> Пән қосу</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
            <div>
              <p className="font-medium text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.nameRu}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
