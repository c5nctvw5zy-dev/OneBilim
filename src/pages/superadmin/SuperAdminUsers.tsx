import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal } from "lucide-react";

const users = [
  { id: 1, name: "Ахметова Айгүл", email: "aigul@school1.kz", role: "Директор", school: "№1 Мектеп", status: "Белсенді" },
  { id: 2, name: "Сейітов Қанат", email: "kanat@school12.kz", role: "Мұғалім", school: "№12 Мектеп", status: "Белсенді" },
  { id: 3, name: "Мұхтарова Дина", email: "dina@school7.kz", role: "Завуч", school: "№7 Мектеп", status: "Бұғатталған" },
  { id: 4, name: "Жұмабаев Ерлан", email: "erlan@school45.kz", role: "Директор", school: "№45 Гимназия", status: "Белсенді" },
];

const statusColors: Record<string, string> = {
  "Белсенді": "bg-success/10 text-success",
  "Бұғатталған": "bg-destructive/10 text-destructive",
};

const roleColors: Record<string, string> = {
  "Директор": "bg-primary/10 text-primary",
  "Мұғалім": "bg-success/10 text-success",
  "Завуч": "bg-warning/10 text-warning",
};

export default function SuperAdminUsers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Пайдаланушылар</h2>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Іздеу..." className="w-40 bg-transparent text-sm outline-none" />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Аты-жөні</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Рөл</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Мектеп</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[u.role] || ""}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{u.school}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[u.status]}`}>{u.status}</span></td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
