import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [subjects, setSubjects] = useState(initialSubjects);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNameRu, setNewNameRu] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameRu, setEditNameRu] = useState("");
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newName.trim()) return;
    setSubjects([...subjects, { id: Date.now(), name: newName, nameRu: newNameRu || newName }]);
    setNewName(""); setNewNameRu(""); setShowAdd(false);
    toast({ title: "Пән қосылды!", description: newName });
  };

  const handleDelete = (id: number) => {
    setSubjects(subjects.filter(s => s.id !== id));
    toast({ title: "Пән жойылды", variant: "destructive" });
  };

  const startEdit = (s: typeof subjects[0]) => {
    setEditId(s.id); setEditName(s.name); setEditNameRu(s.nameRu);
  };

  const saveEdit = () => {
    setSubjects(subjects.map(s => s.id === editId ? { ...s, name: editName, nameRu: editNameRu } : s));
    setEditId(null);
    toast({ title: "Пән жаңартылды!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Пәндер</h2>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2"><Plus className="h-4 w-4" /> Пән қосу</Button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Пән атауы (қаз)" value={newName} onChange={e => setNewName(e.target.value)} />
            <Input placeholder="Пән атауы (рус)" value={newNameRu} onChange={e => setNewNameRu(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd}>Қосу</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Болдырмау</Button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
            {editId === s.id ? (
              <div className="flex-1 space-y-2">
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 text-sm" />
                <Input value={editNameRu} onChange={e => setEditNameRu(e.target.value)} className="h-8 text-sm" />
                <div className="flex gap-1">
                  <Button size="sm" onClick={saveEdit} className="h-7 gap-1"><Check className="h-3 w-3" /> Сақтау</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditId(null)} className="h-7 gap-1"><X className="h-3 w-3" /></Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.nameRu}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
