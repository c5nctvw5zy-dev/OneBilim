import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Eye } from "lucide-react";

const demoStudents = [
  { id: 1, name: "Назарбекова Айым", class: "11А", avg: 4.9, attendance: "98%", status: "Белсенді" },
  { id: 2, name: "Сейітов Арман", class: "10Б", avg: 4.8, attendance: "95%", status: "Белсенді" },
  { id: 3, name: "Қасымова Дана", class: "9А", avg: 4.8, attendance: "97%", status: "Белсенді" },
  { id: 4, name: "Мұхтаров Елдос", class: "11Б", avg: 4.7, attendance: "92%", status: "Белсенді" },
  { id: 5, name: "Байжанова Мадина", class: "10А", avg: 4.7, attendance: "96%", status: "Белсенді" },
  { id: 6, name: "Жұмабаев Бексұлтан", class: "9Б", avg: 3.2, attendance: "78%", status: "Бақылауда" },
];

const statusColors: Record<string, string> = {
  "Белсенді": "bg-success/10 text-success",
  "Бақылауда": "bg-warning/10 text-warning",
};

export default function DirectorStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = demoStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.class.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Оқушылар</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Іздеу..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-40 bg-transparent text-sm outline-none" />
          </div>
          <Button className="gap-2"><Plus className="h-4 w-4" /> Оқушы қосу</Button>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Аты-жөні</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сынып</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Орташа балл</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Қатысу</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s.class}</span></td>
                <td className="px-4 py-3 font-semibold tabular-nums">{s.avg}</td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.attendance}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[s.status]}`}>{s.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
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
