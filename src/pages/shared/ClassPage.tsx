import { useState, useEffect } from "react";
import { Users, BookOpen, TrendingUp, CheckCircle, Loader2, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const tabs = ["Оқушылар", "Пәндер", "Қатысу", "Топқа бөлу"];

export default function ClassPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("Оқушылар");
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [splitMode, setSplitMode] = useState<"alphabet" | "gender">("alphabet");

  useEffect(() => { if (user) loadClasses(); }, [user]);

  const loadClasses = async () => {
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user!.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    const { data: cls } = await supabase.from("classes").select("id, name, grade_level").eq("school_id", prof.school_id).order("grade_level");
    setClasses(cls || []);
    if (cls && cls.length > 0) {
      setSelectedClassId(cls[0].id);
      loadClassData(cls[0].id);
    } else {
      setLoading(false);
    }
  };

  const loadClassData = async (classId: string) => {
    setLoading(true);
    const [{ data: sc }, { data: subs }] = await Promise.all([
      supabase.from("student_classes").select("student_id, group_name, profiles:student_id(id, full_name)").eq("class_id", classId),
      supabase.from("subjects").select("id, name"),
    ]);
    setStudents((sc as any[]) || []);
    setSubjects(subs || []);
    setLoading(false);
  };

  const handleClassChange = (id: string) => {
    setSelectedClassId(id);
    loadClassData(id);
  };

  const handleSplitGroups = async () => {
    if (!students.length) return;
    const sorted = [...students].sort((a, b) => (a.profiles?.full_name || "").localeCompare(b.profiles?.full_name || "", "kk"));
    const half = Math.ceil(sorted.length / 2);
    
    for (let i = 0; i < sorted.length; i++) {
      const groupName = i < half ? "1-топ" : "2-топ";
      await supabase.from("student_classes").update({ group_name: groupName }).eq("student_id", sorted[i].student_id).eq("class_id", selectedClassId);
    }
    toast({ title: "Топтарға бөлінді!" });
    loadClassData(selectedClassId);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const group1 = students.filter(s => s.group_name === "1-топ");
  const group2 = students.filter(s => s.group_name === "2-топ");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">Сынып</h2>
        {classes.length > 0 && (
          <Select value={selectedClassId} onValueChange={handleClassChange}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Оқушылар" value={students.length} icon={Users} color="blue" />
        <StatCard title="1-топ" value={group1.length} icon={Users} color="green" />
        <StatCard title="2-топ" value={group2.length} icon={Users} color="orange" />
        <StatCard title="Пәндер" value={subjects.length} icon={BookOpen} color="blue" />
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Топ</th>
              </tr>
            </thead>
            <tbody>
              {students.sort((a, b) => (a.profiles?.full_name || "").localeCompare(b.profiles?.full_name || "", "kk")).map((s, i) => (
                <tr key={s.student_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{s.profiles?.full_name || "—"}</td>
                  <td className="px-4 py-3">
                    {s.group_name ? <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s.group_name}</span> : "—"}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Оқушылар тіркелмеген</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Пәндер" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {subjects.map(s => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{s.name}</span>
            </div>
          ))}
          {subjects.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">Пәндер жоқ</p>}
        </div>
      )}

      {activeTab === "Қатысу" && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Қатысу деректері журнал арқылы толтырылады
        </div>
      )}

      {activeTab === "Топқа бөлу" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={splitMode} onValueChange={v => setSplitMode(v as any)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabet">Алфавит бойынша</SelectItem>
                <SelectItem value="gender">Қыз / Ұл</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSplitGroups} className="gap-2" disabled={!students.length}>
              <Shuffle className="h-4 w-4" /> Топтарға бөлу
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h4 className="font-semibold text-foreground mb-3">1-топ ({group1.length})</h4>
              {group1.length === 0 ? <p className="text-sm text-muted-foreground">Бос</p> : group1.map((s, i) => (
                <p key={s.student_id} className="text-sm py-1 border-b border-border last:border-0">{i + 1}. {s.profiles?.full_name}</p>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h4 className="font-semibold text-foreground mb-3">2-топ ({group2.length})</h4>
              {group2.length === 0 ? <p className="text-sm text-muted-foreground">Бос</p> : group2.map((s, i) => (
                <p key={s.student_id} className="text-sm py-1 border-b border-border last:border-0">{i + 1}. {s.profiles?.full_name}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
