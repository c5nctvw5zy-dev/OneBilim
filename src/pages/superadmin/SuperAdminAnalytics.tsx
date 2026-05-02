import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/StatCard";
import { School, Users, GraduationCap, TrendingUp, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Супер Админ",
  director: "Директор",
  zavuch: "Завуч",
  teacher: "Мұғалім",
  student: "Оқушы",
  parent: "Ата-ана",
  librarian: "Кітапханашы",
};

export default function SuperAdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ schools: 0, teachers: 0, students: 0, avg: 0 });
  const [roleData, setRoleData] = useState<{ name: string; value: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [growthData, setGrowthData] = useState<{ month: string; users: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ count: sc }, { data: roles }, { data: schools }, { data: profs }, { data: grades }] = await Promise.all([
        supabase.from("schools").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("schools").select("status"),
        supabase.from("profiles").select("created_at"),
        supabase.from("grades").select("grade"),
      ]);

      const roleCounts: Record<string, number> = {};
      (roles || []).forEach((r: any) => { roleCounts[r.role] = (roleCounts[r.role] || 0) + 1; });
      const teachers = roleCounts["teacher"] || 0;
      const students = roleCounts["student"] || 0;

      const sumGrade = (grades || []).reduce((acc: number, g: any) => acc + (g.grade || 0), 0);
      const avg = grades && grades.length > 0 ? +(sumGrade / grades.length).toFixed(2) : 0;

      setStats({ schools: sc || 0, teachers, students, avg });

      setRoleData(Object.entries(roleCounts).map(([k, v]) => ({ name: ROLE_LABELS[k] || k, value: v as number })));

      const statusCounts: Record<string, number> = {};
      (schools || []).forEach((s: any) => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
      const sLabels: Record<string, string> = { approved: "Белсенді", pending: "Күтуде", blocked: "Бұғатталған", rejected: "Қабылданбады" };
      setStatusData(Object.entries(statusCounts).map(([k, v]) => ({ name: sLabels[k] || k, value: v as number })));

      const months: Record<string, number> = {};
      (profs || []).forEach((p: any) => {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months[key] = (months[key] || 0) + 1;
      });
      const growth = Object.entries(months).sort().slice(-6).map(([k, v]) => ({ month: k, users: v as number }));
      setGrowthData(growth);

      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Аналитика</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Жалпы мектептер" value={stats.schools} icon={School} color="blue" />
        <StatCard title="Мұғалімдер" value={stats.teachers} icon={Users} color="green" />
        <StatCard title="Оқушылар" value={stats.students} icon={GraduationCap} color="orange" />
        <StatCard title="Орташа балл" value={stats.avg || "—"} icon={TrendingUp} color="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Пайдаланушылар рөлі бойынша</h3>
          {roleData.length === 0 ? <p className="text-sm text-muted-foreground">Деректер жоқ</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Мектептер статусы</h3>
          {statusData.length === 0 ? <p className="text-sm text-muted-foreground">Деректер жоқ</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Соңғы 6 ай: жаңа пайдаланушылар</h3>
          {growthData.length === 0 ? <p className="text-sm text-muted-foreground">Деректер жоқ</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} name="Пайдаланушылар" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
