import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal, Trash2, Edit, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialSchools = [
  { id: 1, name: "№1 Мектеп-лицей", city: "Алматы", students: 840, status: "Белсенді" },
  { id: 2, name: "№12 Жалпы білім беру мектебі", city: "Астана", students: 620, status: "Белсенді" },
  { id: 3, name: "№45 Гимназия", city: "Шымкент", students: 510, status: "Күтуде" },
  { id: 4, name: "№7 Мектеп", city: "Қарағанды", students: 390, status: "Белсенді" },
  { id: 5, name: "№23 Лицей", city: "Ақтөбе", students: 280, status: "Бұғатталған" },
];

const statusColors: Record<string, string> = {
  "Белсенді": "bg-success/10 text-success",
  "Күтуде": "bg-warning/10 text-warning",
  "Бұғатталған": "bg-destructive/10 text-destructive",
};

export default function SuperAdminSchools() {
  const [schools, setSchools] = useState(initialSchools);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const { toast } = useToast();

  const filtered = schools.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAdd = () => {
    if (!newName.trim() || !newCity.trim()) return;
    setSchools([{ id: Date.now(), name: newName, city: newCity, students: 0, status: "Күтуде" }, ...schools]);
    setNewName(""); setNewCity(""); setShowAdd(false);
    toast({ title: "Мектеп қосылды!", description: newName });
  };

  const handleDelete = (id: number) => {
    setSchools(schools.filter(s => s.id !== id));
    setMenuOpen(null);
    toast({ title: "Мектеп жойылды", variant: "destructive" });
  };

  const toggleStatus = (id: number) => {
    setSchools(schools.map(s => s.id === id ? { ...s, status: s.status === "Бұғатталған" ? "Белсенді" : "Бұғатталған" } : s));
    setMenuOpen(null);
    toast({ title: "Статус өзгертілді" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Мектептер</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Іздеу..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-40 bg-transparent text-sm outline-none" />
          </div>
          <Button onClick={() => setShowAdd(!showAdd)} className="gap-2"><Plus className="h-4 w-4" /> Мектеп қосу</Button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Жаңа мектеп</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Мектеп атауы" value={newName} onChange={e => setNewName(e.target.value)} />
            <Input placeholder="Қала" value={newCity} onChange={e => setNewCity(e.target.value)} />
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Атауы</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Қала</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Оқушылар</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.city}</td>
                <td className="px-4 py-3 tabular-nums text-foreground">{s.students}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[s.status]}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3 text-right relative">
                  <Button variant="ghost" size="icon" onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)}><MoreHorizontal className="h-4 w-4" /></Button>
                  {menuOpen === s.id && (
                    <div className="absolute right-4 top-full mt-1 w-44 rounded-xl border border-border bg-card p-1 shadow-lg z-50">
                      <button onClick={() => toggleStatus(s.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                        <Edit className="h-4 w-4" /> {s.status === "Бұғатталған" ? "Қосу" : "Бұғаттау"}
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4" /> Жою
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
