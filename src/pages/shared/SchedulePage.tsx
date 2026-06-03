import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2, Trash2, Copy, ClipboardPaste } from "lucide-react";

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
  const { user, role } = useAuth();
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

  const canManage = role === "director" || role === "zavuch";

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user!.id).single();
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

    if (canManage) {
      const { data: teacherRoles } = await supabase.from("user_roles").select("user_id").eq("role", "teacher");
      const teacherUserIds = (teacherRoles || []).map(r => r.user_id);
      const { data: allProfs } = await supabase.from("profiles").select("id, full_name, user_id").eq("school_id", prof.school_id);
      setTeachers((allProfs || []).filter(p => teacherUserIds.includes(p.user_id)));
    }
    setLoading(false);
  };

  const findOrCreate = async (table: "classes" | "subjects", name: string) => {
    if (table === "classes") {
      const existing = classes.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
      const { data, error } = await supabase.from("classes").insert({ name, school_id: schoolId!, grade_level: parseInt(name) || 1 }).select("id").single();
      if (error || !data) return null;
      return data.id;
    } else {
      const existing = subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
      const { data, error } = await supabase.from("subjects").insert({ name }).select("id").single();
      if (error || !data) return null;
      return data.id;
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
      school_id: schoolId,
      class_id: classId,
      subject_id: subjectId,
      teacher_id: teacherId,
      day_of_week: parseInt(form.day),
      lesson_order: parseInt(form.lesson_order),
      start_time: form.start_time,
      end_time: form.end_time,
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
    toast({ title: "Көшірілді", description: `${(item.subjects as any)?.name} көшірілді — енді бос ұяшыққа қойыңыз` });
  };

  const handlePaste = async (day: number, order: number) => {
    if (!buffer || !schoolId) return;
    const time = defaultTimes[order - 1];
    const { data, error } = await supabase.from("schedules").insert({
      school_id: schoolId,
      class_id: (buffer.classes as any)?.id,
      subject_id: (buffer.subjects as any)?.id,
      teacher_id: (buffer as any).teacher?.id ?? null,
      day_of_week: day,
      lesson_order: order,
      start_time: time?.start ?? null,
      end_time: time?.end ?? null,
    }).select("id, day_of_week, lesson_order, start_time, end_time, classes:class_id(id, name), subjects:subject_id(id, name), teacher:teacher_id(id, full_name)").single();
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    setSchedule(prev => [...prev, data as any]);
    toast({ title: "Қойылды" });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const days = [...new Set(schedule.map(s => s.day_of_week))].sort();
  const maxLesson = Math.max(...schedule.map(s => s.lesson_order), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">Сабақ кестесі</h2>
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
                <div className="space-y-1">
                  <Label>Сынып</Label>
                  <Input placeholder="Мысалы: 9А" value={form.class_name} onChange={e => setForm(p => ({ ...p, class_name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Пән</Label>
                  <Input placeholder="Мысалы: Математика" value={form.subject_name} onChange={e => setForm(p => ({ ...p, subject_name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Мұғалім</Label>
                  <Input placeholder="Мысалы: Ахметов А." value={form.teacher_name} onChange={e => setForm(p => ({ ...p, teacher_name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Сабақ реті</Label>
                  <Select value={form.lesson_order} onValueChange={v => {
                    const idx = parseInt(v) - 1;
                    const t = defaultTimes[idx] || defaultTimes[0];
                    setForm(p => ({ ...p, lesson_order: v, start_time: t.start, end_time: t.end }));
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[1,2,3,4,5,6,7].map(n => <SelectItem key={n} value={String(n)}>{n}-сабақ ({defaultTimes[n-1]?.start}-{defaultTimes[n-1]?.end})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreate}>Кесте жасау</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {schedule.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">Кесте жасалмаған</div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-24">Сабақ</th>
                {(days.length > 0 ? days : [1,2,3,4,5]).map(d => (
                  <th key={d} className="px-4 py-3 text-left font-medium text-muted-foreground">{dayLabels[d]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxLesson }, (_, i) => i + 1).map(order => (
                <tr key={order} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-primary tabular-nums">
                    {order}-сабақ<br/><span className="text-[10px] text-muted-foreground">{defaultTimes[order - 1]?.start}-{defaultTimes[order - 1]?.end}</span>
                  </td>
                  {(days.length > 0 ? days : [1,2,3,4,5]).map(d => {
                    const item = schedule.find(s => s.day_of_week === d && s.lesson_order === order);
                    return (
                      <td key={d} className="px-4 py-3 text-foreground text-xs">
                        {item ? (
                          <div className="flex items-center justify-between gap-1">
                            <div>
                              <span className="font-medium">{(item.subjects as any)?.name}</span>
                              <span className="text-muted-foreground ml-1">({(item.classes as any)?.name})</span>
                              {(item as any).teacher && <div className="text-[10px] text-muted-foreground">{(item as any).teacher.full_name}</div>}
                            </div>
                            {canManage && (
                              <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
