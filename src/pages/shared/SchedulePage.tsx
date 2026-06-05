import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2, Trash2, Copy, ClipboardPaste, RefreshCw } from "lucide-react";

interface ScheduleItem {
  id: string;
  day_of_week: number;
  lesson_order: number;
  start_time: string | null;
  end_time: string | null;
  classes: { id: string; name: string } | null;
  subjects: { id: string; name: string } | null;
  teacher: { id: string; full_name: string } | null;
}

const dayLabels: Record<number, string> = { 1: "Дүйсенбі", 2: "Сейсенбі", 3: "Сәрсенбі", 4: "Бейсенбі", 5: "Жұма", 6: "Сенбі" };
const defaultTimes = [
  { start: "08:30", end: "09:15" },
  { start: "09:25", end: "10:10" },
  { start: "10:20", end: "11:05" },
  { start: "11:15", end: "12:00" },
  { start: "12:20", end: "13:05" },
  { start: "13:15", end: "14:00" },
  { start: "14:10", end: "14:55" },
];

export default function SchedulePage() {
  const { user, role, profile } = useAuth();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [form, setForm] = useState({ day: "1", class_name: "", subject_name: "", teacher_name: "", lesson_order: "1", start_time: "08:30", end_time: "09:15" });
  const [buffer, setBuffer] = useState<ScheduleItem | null>(null);
  const [classFilter, setClassFilter] = useState<string>("all");

  const canManage = role === "director" || role === "zavuch";

  useEffect(() => { if (user) loadData(); }, [user]);

  // Auto refresh when tab gains focus
  useEffect(() => {
    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    if (!user) return;
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    setSchoolId(prof.school_id);

    const [{ data: sched }, { data: cls }, { data: subs }] = await Promise.all([
      supabase.from("schedules").select("id, day_of_week, lesson_order, start_time, end_time, classes:class_id(id, name), subjects:subject_id(id, name), teacher:teacher_id(id, full_name)").eq("school_id", prof.school_id).order("day_of_week").order("lesson_order"),
      supabase.from("classes").select("id, name").eq("school_id", prof.school_id),
      supabase.from("subjects").select("id, name"),
    ]);

    setSchedule((sched as any[]) || []);
    setClasses(cls || []);
    setSubjects(subs || []);

    const { data: teacherRoles } = await supabase.from("user_roles").select("user_id").eq("role", "teacher");
    const teacherUserIds = (teacherRoles || []).map(r => r.user_id);
    const { data: allProfs } = await supabase.from("profiles").select("id, full_name, user_id").eq("school_id", prof.school_id);
    setTeachers((allProfs || []).filter(p => teacherUserIds.includes(p.user_id)));
    setLoading(false);
  };

  const findOrCreate = async (table: "classes" | "subjects", name: string) => {
    if (table === "classes") {
      const existing = classes.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
      const m = name.match(/^(\d+)(.*)$/);
      const { data } = await supabase.from("classes").insert({ name, school_id: schoolId!, grade_level: m ? parseInt(m[1]) : 1, section: m?.[2] || null }).select("id").single();
      return data?.id || null;
    } else {
      const existing = subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
      const { data } = await supabase.from("subjects").insert({ name }).select("id").single();
      return data?.id || null;
    }
  };

  const handleCreate = async () => {
    if (!form.class_name || !form.subject_name || !schoolId) {
      toast({ title: "Сынып пен пәнді жазыңыз", variant: "destructive" });
      return;
    }
    const classId = await findOrCreate("classes", form.class_name);
    const subjectId = await findOrCreate("subjects", form.subject_name);
    if (!classId || !subjectId) { toast({ title: "Қате", variant: "destructive" }); return; }

    let teacherId: string | null = null;
    if (form.teacher_name) {
      const t = teachers.find(t => t.full_name.toLowerCase() === form.teacher_name.toLowerCase());
      teacherId = t?.id || null;
    }

    const { error } = await supabase.from("schedules").insert({
      school_id: schoolId, class_id: classId, subject_id: subjectId, teacher_id: teacherId,
      day_of_week: parseInt(form.day), lesson_order: parseInt(form.lesson_order),
      start_time: form.start_time, end_time: form.end_time,
    });
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Кесте қосылды!" });
    setShowCreate(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("schedules").delete().eq("id", id);
    setSchedule(prev => prev.filter(s => s.id !== id));
    toast({ title: "Жойылды" });
  };

  const handleCopy = (item: ScheduleItem) => {
    setBuffer(item);
    toast({ title: "Көшірілді", description: "Бос ұяшыққа басып қойыңыз" });
  };

  const handlePaste = async (day: number, order: number) => {
    if (!buffer || !schoolId) return;
    const time = defaultTimes[order - 1];
    const { data, error } = await supabase.from("schedules").insert({
      school_id: schoolId,
      class_id: (buffer.classes as any)?.id,
      subject_id: (buffer.subjects as any)?.id,
      teacher_id: (buffer as any).teacher?.id ?? null,
      day_of_week: day, lesson_order: order,
      start_time: time?.start ?? null, end_time: time?.end ?? null,
    }).select("id, day_of_week, lesson_order, start_time, end_time, classes:class_id(id, name), subjects:subject_id(id, name), teacher:teacher_id(id, full_name)").single();
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    setSchedule(prev => [...prev, data as any]);
    toast({ title: "Қойылды" });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  // Apply class filter (for teachers, hide unrelated; for admins, allow filter)
  let visible = schedule;
  if (role === "teacher" && profile?.id) {
    visible = visible.filter(s => (s as any).teacher?.id === profile.id);
  }
  if (classFilter !== "all") {
    visible = visible.filter(s => (s.classes as any)?.id === classFilter);
  }

  // Always show all weekdays Mon-Fri
  const days = [1, 2, 3, 4, 5];
  const maxLesson = Math.max(7, ...visible.map(s => s.lesson_order));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">Сабақ кестесі</h2>
        <div className="flex gap-2 items-center flex-wrap">
          {role !== "teacher" && classes.length > 0 && (
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Сынып" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Барлық сыныптар</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1"><RefreshCw className="h-4 w-4" /> Жаңарту</Button>
          {canManage && (
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Кесте жасау</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Кестеге сабақ қосу</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Апта күні</Label>
                    <Select value={form.day} onValueChange={v => setForm(p => ({ ...p, day: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[1,2,3,4,5,6].map(d => <SelectItem key={d} value={String(d)}>{dayLabels[d]}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Сынып</Label><Input placeholder="9А" value={form.class_name} onChange={e => setForm(p => ({ ...p, class_name: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Пән</Label><Input placeholder="Математика" value={form.subject_name} onChange={e => setForm(p => ({ ...p, subject_name: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Мұғалім</Label><Input placeholder="Ахметов А." value={form.teacher_name} onChange={e => setForm(p => ({ ...p, teacher_name: e.target.value }))} /></div>
                  <div className="space-y-1">
                    <Label>Сабақ реті</Label>
                    <Select value={form.lesson_order} onValueChange={v => {
                      const idx = parseInt(v) - 1;
                      const t = defaultTimes[idx] || defaultTimes[0];
                      setForm(p => ({ ...p, lesson_order: v, start_time: t.start, end_time: t.end }));
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[1,2,3,4,5,6,7].map(n => <SelectItem key={n} value={String(n)}>{n}-сабақ</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleCreate}>Кесте жасау</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-24">Сабақ</th>
              {days.map(d => <th key={d} className="px-4 py-3 text-left font-medium text-muted-foreground">{dayLabels[d]}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxLesson }, (_, i) => i + 1).map(order => (
              <tr key={order} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium text-primary tabular-nums">
                  {order}-сабақ<br/><span className="text-[10px] text-muted-foreground">{defaultTimes[order - 1]?.start}-{defaultTimes[order - 1]?.end}</span>
                </td>
                {days.map(d => {
                  const item = visible.find(s => s.day_of_week === d && s.lesson_order === order);
                  return (
                    <td key={d} className="px-4 py-3 text-foreground text-xs">
                      {item ? (
                        <div className="flex items-center justify-between gap-1 group">
                          <div className="min-w-0">
                            <span className="font-medium">{(item.subjects as any)?.name}</span>
                            <span className="text-muted-foreground ml-1">({(item.classes as any)?.name})</span>
                            {(item as any).teacher && <div className="text-[10px] text-muted-foreground truncate">{(item as any).teacher.full_name}</div>}
                          </div>
                          {canManage && (
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleCopy(item)} title="Көшіру" className="text-muted-foreground hover:text-primary"><Copy className="h-3 w-3" /></button>
                              <button onClick={() => handleDelete(item.id)} title="Жою" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                            </div>
                          )}
                        </div>
                      ) : canManage && buffer ? (
                        <button onClick={() => handlePaste(d, order)} title="Қою" className="text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                          <ClipboardPaste className="h-3 w-3" /> қою
                        </button>
                      ) : <span className="text-muted-foreground/50">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {role === "teacher" ? "Сізге сабақ тағайындалмаған." : "Кесте әлі толтырылмаған. «ЖИ көмекші» → «Авто кесте» арқылы автоматты жасауға немесе «Кесте жасау» батырмасын басуға болады."}
        </p>
      )}
    </div>
  );
}
