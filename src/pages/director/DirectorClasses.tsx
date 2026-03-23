import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";

const demoClasses = [
  { id: 1, name: "1А", grade: 1, section: "А", teacher: "Сейітова Г.", students: 28 },
  { id: 2, name: "1Б", grade: 1, section: "Б", teacher: "Мұхтарова Д.", students: 30 },
  { id: 3, name: "5А", grade: 5, section: "А", teacher: "Қасымов Б.", students: 32 },
  { id: 4, name: "9А", grade: 9, section: "А", teacher: "Ахметова А.", students: 26 },
  { id: 5, name: "10Б", grade: 10, section: "Б", teacher: "Жұмабаев Е.", students: 24 },
  { id: 6, name: "11А", grade: 11, section: "А", teacher: "Назарбекова К.", students: 22 },
];

export default function DirectorClasses() {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = demoClasses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.teacher.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Сыныптар</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Іздеу..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-40 bg-transparent text-sm outline-none" />
          </div>
          <Button className="gap-2"><Plus className="h-4 w-4" /> Сынып қосу</Button>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сынып</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сынып жетекшісі</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Оқушылар</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{c.name}</span>
                </td>
                <td className="px-4 py-3 text-foreground">{c.teacher}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.students} оқушы</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
