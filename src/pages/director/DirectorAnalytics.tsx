import StatCard from "@/components/StatCard";
import { GraduationCap, Users, TrendingUp, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const subjectData = [
  { name: "Мат", avg: 4.5 },
  { name: "Қаз", avg: 4.1 },
  { name: "Физ", avg: 4.3 },
  { name: "Хим", avg: 4.0 },
  { name: "Био", avg: 4.2 },
  { name: "Тар", avg: 4.4 },
  { name: "Аңг", avg: 3.8 },
  { name: "Инф", avg: 4.6 },
];

const attendancePie = [
  { name: "Қатысты", value: 94.2, color: "hsl(var(--success))" },
  { name: "Себепті", value: 3.8, color: "hsl(var(--warning))" },
  { name: "Себепсіз", value: 2.0, color: "hsl(var(--destructive))" },
];

const quarterData = [
  { quarter: "1-тоқсан", avg: 4.1 },
  { quarter: "2-тоқсан", avg: 4.2 },
  { quarter: "3-тоқсан", avg: 4.3 },
  { quarter: "4-тоқсан", avg: 4.4 },
];

export default function DirectorAnalytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Аналитика</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Оқушылар" value={840} icon={GraduationCap} color="blue" />
        <StatCard title="Мұғалімдер" value={62} icon={Users} color="green" />
        <StatCard title="Орташа балл" value="4.3" icon={TrendingUp} color="orange" />
        <StatCard title="Қатысу %" value="94.2%" icon={CheckCircle} color="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Пәндер бойынша орташа балл</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Қатысу көрсеткіші</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={attendancePie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                {attendancePie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Тоқсан бойынша үлгерім</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={quarterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="quarter" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[3.5, 5]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="avg" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
