import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BookOpen, Plus, Loader2, Trash2, Accessibility } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const PROGRAM_LABEL: Record<string, string> = {
  general: "Жалпы", home: "Үйден", gifted: "Дарынды", inclusive: "Инклюзивті", remote: "Қашықтан",
};

export default function CurriculumPage() {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", subject_name: "", plan_type: "annual", academic_year: "2025-2026" });
  const [filterInclusive, setFilterInclusive] = useState(false);
  const [filterGrade, setFilterGrade] = useState<string>("all");

  const canEdit = role === "director" || role === "zavuch" || role === "teacher";

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    if (!profile?.school_id) { setLoading(false); return; }
    const [{ data: pl }, { data: st }] = await Promise.all([
      (supabase as any).from("curriculum_plans").select("*").eq("school_id", profile.school_id).order("created_at", { ascending: false }),
      (supabase as any).from("alphabet_book").select("id, first_name, last_name, grade_level, section, education_program").eq("school_id", profile.school_id).eq("status", "active"),
    ]);
    setPlans(pl || []);
    setStudents(st || []);
    setLoading(false);
  };

  const save = async () => {
    if (!form.student_id || !form.subject_name || !profile?.school_id || !user) {
      toast({ title: "Оқушы мен пәнді таңдаңыз", variant: "destructive" }); return;
    }
    const s = students.find(x => x.id === form.student_id);
    const className = s ? `${s.grade_level}${s.section || ""}` : "";
    const studentName = s ? `${s.last_name} ${s.first_name}` : "";
    const { error } = await (supabase as any).from("curriculum_plans").insert({
      school_id: profile.school_id, created_by: user.id,
      subject_name: form.subject_name, plan_type: form.plan_type,
      academic_year: form.academic_year, class_name: className,
      group_name: studentName,
    });
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Оқу бағдарламасы жасалды" });
    setOpen(false);
    setForm({ student_id: "", subject_name: "", plan_type: "annual", academic_year: "2025-2026" });
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Жоюды растайсыз ба?")) return;
    await (supabase as any).from("curriculum_plans").delete().eq("id", id);
    load();
  };

  const filteredStudents = students.filter(s => {
    if (filterInclusive && s.education_program !== "inclusive") return false;
    if (filterGrade !== "all" && String(s.grade_level) !== filterGrade) return false;
    return true;
  });

  const grades = Array.from(new Set(students.map(s => s.grade_level).filter(Boolean))).sort((a: any, b: any) => a - b);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5" /> Оқу бағдарламасы — оқушыларға арналған
          </CardTitle>
          {canEdit && <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Оқу бағдарламасын жасау</Button>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Әр оқушыға жеке оқу бағдарламасын тіркеу. Инклюзивті оқушыларды бөлек көрсетуге болады.
          </p>

          <div className="flex gap-2 flex-wrap mb-4">
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Сынып" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Барлық сыныптар</SelectItem>
                {grades.map((g: any) => <SelectItem key={g} value={String(g)}>{g}-сынып</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant={filterInclusive ? "default" : "outline"} size="sm" onClick={() => setFilterInclusive(!filterInclusive)} className="gap-2">
              <Accessibility className="h-4 w-4" /> Тек инклюзивті
            </Button>
          </div>

          {plans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Әлі бағдарлама жасалмаған. «Оқу бағдарламасын жасау» батырмасын басыңыз.
            </div>
          ) : (
            <div className="space-y-2">
              {plans.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{p.subject_name} — {p.group_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.class_name} · {p.plan_type === "annual" ? "Жылдық" : "Күнтізбелік"} · {p.academic_year}
                    </p>
                  </div>
                  {canEdit && (
                    <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Оқушыға оқу бағдарламасын жасау</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant={filterInclusive ? "default" : "outline"} onClick={() => setFilterInclusive(!filterInclusive)} className="gap-2">
                <Accessibility className="h-3.5 w-3.5" /> Тек инклюзивті оқушылар
              </Button>
            </div>
            <div>
              <Label>Оқушы</Label>
              <Select value={form.student_id} onValueChange={v => setForm({ ...form, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Оқушыны таңдаңыз" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {filteredStudents.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.last_name} {s.first_name} — {s.grade_level}{s.section || ""} {s.education_program === "inclusive" && "♿"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Пән</Label><Input value={form.subject_name} onChange={e => setForm({ ...form, subject_name: e.target.value })} placeholder="Математика" /></div>
            <div>
              <Label>Жоспар түрі</Label>
              <Select value={form.plan_type} onValueChange={v => setForm({ ...form, plan_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Жылдық</SelectItem>
                  <SelectItem value="calendar">Күнтізбелік-тақырыптық</SelectItem>
                  <SelectItem value="lesson">Сабақ жоспары</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Оқу жылы</Label><Input value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Болдырмау</Button>
            <Button onClick={save}>Жасау</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
