import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialTeachers = [
  { id: 1, name: "Сейітов Қанат", subject: "Математика", phone: "+7 777 123 4567", rating: 4.8, status: "Белсенді" },
  { id: 2, name: "Мұхтарова Дина", subject: "Қазақ тілі", phone: "+7 777 234 5678", rating: 4.6, status: "Белсенді" },
  { id: 3, name: "Қасымов Бауыржан", subject: "Физика", phone: "+7 777 345 6789", rating: 4.9, status: "Белсенді" },
  { id: 4, name: "Ахметова Гүлнар", subject: "Биология", phone: "+7 777 456 7890", rating: 4.4, status: "Демалыста" },
  { id: 5, name: "Жұмабаев Ерлан", subject: "Тарих", phone: "+7 777 567 8901", rating: 4.7, status: "Белсенді" },
];

const statusColors: Record<string, string> = {
  "Белсенді": "bg-success/10 text-success",
  "Демалыста": "bg-warning/10 text-warning",
};

export default function DirectorTeachers() {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const { toast } = useToast();

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAdd = () => {
    if (!newName.trim()) return;
    setTeachers([...teachers, { id: Date.now(), name: newName, subject: newSubject || "—", phone: newPhone || "—", rating: 0, status: "Белсенді" }]);
    setNewName(""); setNewSubject(""); setNewPhone(""); setShowAdd(false);
    toast({ title: "Мұғалім қосылды!", description: newName });
  };

  const handleDelete = (id: number) => {
    setTeachers(teachers.filter(t => t.id !== id));
    toast({ title: "Мұғалім жойылды", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Мұғалімдер</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Іздеу..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-40 bg-transparent text-sm outline-none" />
          </div>
          <Button className="gap-2" onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Мұғалім қосу</Button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Жаңа мұғалім</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input placeholder="Аты-жөні" value={newName} onChange={e => setNewName(e.target.value)} />
            <Input placeholder="Пәні" value={newSubject} onChange={e => setNewSubject(e.target.value)} />
            <Input placeholder="Телефон" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd}>Қосу</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Болдырмау</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Аты-жөні</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Пән</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Телефон</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Рейтинг</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.subject}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                    <span className="text-sm font-medium">{t.rating}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[t.status]}`}>{t.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toast({ title: "Өңдеу", description: `${t.name} өңделуде...` })}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
