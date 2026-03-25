import StatCard from "@/components/StatCard";
import { Users, TrendingUp, BookOpen, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const classData = [
  { class: "9А", avg: 4.3 },
  { class: "9Б", avg: 3.8 },
  { class: "10А", avg: 4.5 },
  { class: "10Б", avg: 4.1 },
  { class: "11А", avg: 4.6 },
  { class: "11Б", avg: 4.0 },
];

const gradeDistribution = [
  { grade: "5 (Үздік)", count: 45 },
  { grade: "4 (Жақсы)", count: 62 },
  { grade: "3 (Қанағат)", count: 28 },
  { grade: "2 (Жетімсіз)", count: 5 },
];

export default function TeacherStats() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Статистика</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Жалпы оқушылар" value={140} icon={Users} color="blue" />
        <StatCard title="Орташа балл" value="4.2" icon={TrendingUp} color="green" />
        <StatCard title="Пәндер" value={3} icon={BookOpen} color="orange" />
        <StatCard title="Қатысу %" value="93%" icon={CheckCircle} color="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Сыныптар бойынша орташа балл</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="class" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Баға бөлінісі</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gradeDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="grade" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-card-foreground">Соңғы белсенділік</h3>
        <div className="space-y-2">
          {[
            { text: "9А сыныбында 5 баға қойылды", time: "1 сағат бұрын" },
            { text: "10Б сыныбына үй тапсырмасы берілді", time: "3 сағат бұрын" },
            { text: "11А сыныбының бақылау жұмысы тексерілді", time: "Кеше" },
            { text: "Жаңа материал жүктелді: Алгебра формулалары", time: "2 күн бұрын" },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-foreground">{a.text}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
