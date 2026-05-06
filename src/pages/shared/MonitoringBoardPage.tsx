import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, AlertTriangle, Plus, Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function MonitoringBoardPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ subject_name: "", teacher_id: "", total_hours: 0, conducted_hours: 0, quarter: 1, academic_year: "2025-2026" });

  const isAdmin = role === "director" || role === "zavuch";

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    setLoading(true);
    const { data: prof } = await supabase.from("profiles").select("school_id").eq("user_id", user!.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    setSchoolId(prof.school_id);
    const [{ data: hours }, { data: teacherRoles }, { data: profs }] = await Promise.all([
      (supabase as any).from("lesson_hours").select("*").eq("school_id", prof.school_id).order("subject_name"),
      supabase.from("user_roles").select("user_id").eq("role", "teacher"),
      supabase.from("profiles").select("id, full_name, user_id").eq("school_id", prof.school_id),
    ]);
    const tids = new Set((teacherRoles || []).map(r => r.user_id));
    setTeachers((profs || []).filter(p => tids.has(p.user_id)));
    setRows(hours || []);
    setLoading(false);
  };

  const totalAll = rows.reduce((s, h) => s + (h.total_hours || 0), 0);
  const doneAll = rows.reduce((s, h) => s + (h.conducted_hours || 0), 0);
  const remainAll = totalAll - doneAll;
  const pct = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;

  const openCreate = () => { setEditing(null); setForm({ subject_name: "", teacher_id: "", total_hours: 0, conducted_hours: 0, quarter: 1, academic_year: "2025-2026" }); setOpen(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ ...r }); setOpen(true); };

  const save = async () => {
    if (!form.subject_name || !form.total_hours) { toast({ title: "Пән мен жалпы сағат міндетті", variant: "destructive" }); return; }
    if (editing) {
      const { error } = await (supabase as any).from("lesson_hours").update({
        subject_name: form.subject_name, teacher_id: form.teacher_id || null,
        total_hours: form.total_hours, conducted_hours: form.conducted_hours,
        quarter: form.quarter, academic_year: form.academic_year,
      }).eq("id", editing.id);
      if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Жаңартылды" });
    } else {
      const { error } = await (supabase as any).from("lesson_hours").insert({
        school_id: schoolId, subject_name: form.subject_name,
        teacher_id: form.teacher_id || null,
        total_hours: form.total_hours, conducted_hours: form.conducted_hours || 0,
        quarter: form.quarter, academic_year: form.academic_year,
      });
      if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Сағаттар бекітілді" });
    }
    setOpen(false); load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">📊 Бақылау тақтасы</h2>
        {isAdmin && (
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Сағаттар бекіту</Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">📘 Жалпы сағаттар</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{totalAll}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">📗 Өткен сағаттар</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-success">{doneAll}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">📕 Қалған сағаттар</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-destructive">{remainAll}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Жалпы прогресс</CardTitle></CardHeader>
        <CardContent>
          <Progress value={pct} className="h-3" />
          <p className="mt-2 text-sm text-muted-foreground">{pct}% аяқталды</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-5 w-5" /> Пән бойынша сағаттар</CardTitle></CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Сағаттар әлі бекітілмеген. {isAdmin && "«Сағаттар бекіту» батырмасын басыңыз."}
            </p>
          ) : (
            <div className="space-y-3">
              {rows.map(r => {
                const sp = r.total_hours > 0 ? Math.round((r.conducted_hours / r.total_hours) * 100) : 0;
                const remaining = (r.total_hours || 0) - (r.conducted_hours || 0);
                const warning = remaining > 0 && remaining < 20;
                const teacher = teachers.find(t => t.id === r.teacher_id);
                return (
                  <div key={r.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{r.subject_name}</span>
                        {teacher && <Badge variant="outline" className="text-xs">{teacher.full_name}</Badge>}
                        {warning && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{r.conducted_hours}/{r.total_hours}</Badge>
                        <span className="text-xs text-muted-foreground">қалды: {remaining}</span>
                        {isAdmin && (
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(r)}>
                            <Pencil className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <Progress value={sp} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Сағаттарды өзгерту" : "Мұғалімге сағаттар бекіту"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Пән *</label>
              <Input value={form.subject_name} onChange={e => setForm({ ...form, subject_name: e.target.value })} placeholder="Математика" />
            </div>
            <div>
              <label className="text-sm font-medium">Мұғалім</label>
              <Select value={form.teacher_id || ""} onValueChange={v => setForm({ ...form, teacher_id: v })}>
                <SelectTrigger><SelectValue placeholder="Таңдаңыз" /></SelectTrigger>
                <SelectContent>
                  {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Жалпы сағат *</label>
                <Input type="number" value={form.total_hours} onChange={e => setForm({ ...form, total_hours: Number(e.target.value) })} /></div>
              <div><label className="text-sm font-medium">Өткен сағат</label>
                <Input type="number" value={form.conducted_hours} onChange={e => setForm({ ...form, conducted_hours: Number(e.target.value) })} /></div>
              <div><label className="text-sm font-medium">Тоқсан</label>
                <Input type="number" min={1} max={4} value={form.quarter} onChange={e => setForm({ ...form, quarter: Number(e.target.value) })} /></div>
              <div><label className="text-sm font-medium">Оқу жылы</label>
                <Input value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Болдырмау</Button>
            <Button onClick={save}>Сақтау</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
