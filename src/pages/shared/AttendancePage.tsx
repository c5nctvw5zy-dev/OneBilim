import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const students = [
  { name: "Назарбекова Айым", total: 120, present: 118, absent: 2, percent: "98%" },
  { name: "Сейітов Арман", total: 120, present: 114, absent: 6, percent: "95%" },
  { name: "Қасымова Дана", total: 120, present: 116, absent: 4, percent: "97%" },
  { name: "Мұхтаров Елдос", total: 120, present: 110, absent: 10, percent: "92%" },
  { name: "Жұмабаев Бексұлтан", total: 120, present: 94, absent: 26, percent: "78%" },
];

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Қатысулар</h2>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Оқушы</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Жалпы</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Қатысты</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Келмеді</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">%</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.total}</td>
                <td className="px-4 py-3 text-success tabular-nums">{s.present}</td>
                <td className="px-4 py-3 text-destructive tabular-nums">{s.absent}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    parseInt(s.percent) >= 90 ? "bg-success/10 text-success" : parseInt(s.percent) >= 80 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                  }`}>{s.percent}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
