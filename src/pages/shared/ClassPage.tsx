import { useState } from "react";
import { Users, BookOpen, TrendingUp, CheckCircle } from "lucide-react";
import StatCard from "@/components/StatCard";

const students = [
  { name: "Назарбекова Айым", avg: 4.9, attendance: "98%", status: "Үздік" },
  { name: "Сейітов Арман", avg: 4.8, attendance: "95%", status: "Үздік" },
  { name: "Қасымова Дана", avg: 4.5, attendance: "97%", status: "Жақсы" },
  { name: "Мұхтаров Елдос", avg: 4.2, attendance: "92%", status: "Жақсы" },
  { name: "Байжанова Мадина", avg: 3.8, attendance: "96%", status: "Қанағат" },
  { name: "Жұмабаев Бексұлтан", avg: 3.2, attendance: "78%", status: "Бақылауда" },
];

const statusColors: Record<string, string> = {
  "Үздік": "bg-success/10 text-success",
  "Жақсы": "bg-primary/10 text-primary",
  "Қанағат": "bg-warning/10 text-warning",
  "Бақылауда": "bg-destructive/10 text-destructive",
};

const tabs = ["Оқушылар", "Пәндер", "Қатысу"];

export default function ClassPage() {
  const [activeTab, setActiveTab] = useState("Оқушылар");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Сынып</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Оқушылар" value={students.length} icon={Users} color="blue" />
        <StatCard title="Орташа балл" value="4.2" icon={TrendingUp} color="green" />
        <StatCard title="Пәндер" value={8} icon={BookOpen} color="orange" />
        <StatCard title="Қатысу %" value="93%" icon={CheckCircle} color="blue" />
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Оқушылар" && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Аты-жөні</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Орташа балл</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Қатысу</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{s.avg}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.attendance}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[s.status]}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Пәндер" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {["Математика", "Қазақ тілі", "Физика", "Химия", "Биология", "Тарих", "Ағылшын тілі", "Информатика"].map(subject => (
            <div key={subject} className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{subject}</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">{(3.5 + Math.random() * 1.5).toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Қатысу" && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Оқушы</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Қатысу %</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Визуал</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const pct = parseInt(s.attendance);
                return (
                  <tr key={s.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-4 py-3 tabular-nums font-semibold">{s.attendance}</td>
                    <td className="px-4 py-3">
                      <div className="h-2 w-full max-w-32 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 90 ? "bg-success" : pct >= 80 ? "bg-warning" : "bg-destructive"}`} style={{ width: s.attendance }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
