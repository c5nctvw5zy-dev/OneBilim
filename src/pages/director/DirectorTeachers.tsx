import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, UserCheck, Loader2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type TeacherRow = {
  id: string; full_name: string; subject?: string | null; position?: string | null;
  nationality?: string | null; address?: string | null; gender?: string | null;
  phone?: string | null; class_name?: string | null; order_no?: string | null;
  status: string; iin?: string | null;
};

const empty: Partial<TeacherRow> = { full_name: "", subject: "", nationality: "", address: "", gender: "male", phone: "", class_name: "", order_no: "", status: "active" };

export default function DirectorTeachers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherRow | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [assignTo, setAssignTo] = useState<TeacherRow | null>(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    setLoading(true);
    const { data: prof } = await supabase.from("profiles").select("school_id").eq("user_id", user!.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    setSchoolId(prof.school_id);
    const [{ data: staff }, { data: cls }] = await Promise.all([
      (supabase as any).from("staff").select("*").eq("school_id", prof.school_id).eq("is_teacher", true).order("full_name"),
      supabase.from("classes").select("id, name, homeroom_teacher_id").eq("school_id", prof.school_id),
    ]);
    setRows((staff as TeacherRow[]) || []);
    setClasses(cls || []);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (r: TeacherRow) => { setEditing(r); setForm({ ...r }); setOpen(true); };

  const save = async () => {
    if (!form.full_name?.trim()) { toast({ title: "Аты-жөні міндетті", variant: "destructive" }); return; }
    setSaving(true);
    if (editing) {
      const { id, ...rest } = form;
      const { error } = await (supabase as any).from("staff").update(rest).eq("id", editing.id);
      setSaving(false);
      if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Жаңартылды" });
    } else {
      const { error } = await (supabase as any).from("staff").insert({
        ...form, school_id: schoolId, is_teacher: true,
        position: form.subject ? `${form.subject} пәні мұғалімі` : "Мұғалім",
      });
      setSaving(false);
      if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Мұғалім тіркелді" });
    }
    setOpen(false); setEditing(null); setForm(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Мұғалімді жоюды растайсыз ба?")) return;
    await (supabase as any).from("staff").delete().eq("id", id);
    toast({ title: "Жойылды" }); load();
  };

  const assignHomeroom = async () => {
    if (!assignTo || !selectedClassId) return;
    // Try linking staff to a teacher profile by name
    const { data: prof } = await supabase.from("profiles").select("id").ilike("full_name", assignTo.full_name).maybeSingle();
    if (!prof?.id) {
      toast({ title: "Профиль табылмады", description: "Алдымен мұғалімнің аккаунты тіркелуі керек", variant: "destructive" });
      setAssignTo(null); return;
    }
    const { error } = await supabase.from("classes").update({ homeroom_teacher_id: prof.id }).eq("id", selectedClassId);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Жетекшілікке тағайындалды" });
    setAssignTo(null); setSelectedClassId(""); load();
  };

  const filtered = rows.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Мұғалімдер</h2>
          <p className="text-sm text-muted-foreground mt-1">Мектептегі мұғалімдер тізімі. Деректер базасына сақталады.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Іздеу..." value={search} onChange={e => setSearch(e.target.value)} className="w-40 bg-transparent text-sm outline-none" />
          </div>
          <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Мұғалім қосу</Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            Мұғалім жоқ. «Мұғалім қосу» батырмасын басып, анкетаны толтырыңыз.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Аты-жөні</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Пәні</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сыныбы</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Телефон</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Бұйрық №</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-border last:border-0 group hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{t.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.subject || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.class_name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.phone || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.order_no || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {t.status === "active" ? "Белсенді" : t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" title="Жетекшілікке тағайындау" onClick={() => { setAssignTo(t); setSelectedClassId(""); }}>
                        <UserCheck className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Өзгерту" onClick={() => openEdit(t)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Өшіру" onClick={() => remove(t.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Анкета модалы */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(empty); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {editing ? "Мұғалім профилі" : "Жаңа мұғалім — анкета"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Толық аты-жөні *</Label>
              <Input value={form.full_name || ""} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Мысалы: Әлмұратова Дана Серікқызы" />
            </div>
            <div>
              <Label>Негізгі пәні</Label>
              <Input value={form.subject || ""} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Мысалы: Математика / Бастауыш сынып" />
            </div>
            <div>
              <Label>Сыныбы</Label>
              <Input value={form.class_name || ""} onChange={e => setForm({ ...form, class_name: e.target.value })} placeholder="Мысалы: 7Г" />
            </div>
            <div>
              <Label>Ұлты</Label>
              <Input value={form.nationality || ""} onChange={e => setForm({ ...form, nationality: e.target.value })} />
            </div>
            <div>
              <Label>Жынысы</Label>
              <Select value={form.gender || "male"} onValueChange={v => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Ер</SelectItem>
                  <SelectItem value="female">Әйел</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Телефоны</Label>
              <Input value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+7 ___ ___ __ __" />
            </div>
            <div>
              <Label>Бұйрық нөмірі</Label>
              <Input value={form.order_no || ""} onChange={e => setForm({ ...form, order_no: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Мекенжайы</Label>
              <Input value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label>ЖСН</Label>
              <Input value={form.iin || ""} onChange={e => setForm({ ...form, iin: e.target.value })} maxLength={12} />
            </div>
            <div>
              <Label>Статусы</Label>
              <Select value={form.status || "active"} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Белсенді</SelectItem>
                  <SelectItem value="vacation">Демалыста</SelectItem>
                  <SelectItem value="dismissed">Босатылған</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Болдырмау</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Сақтау
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Жетекшілікке тағайындау */}
      <Dialog open={!!assignTo} onOpenChange={v => { if (!v) setAssignTo(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Жетекшілікке тағайындау — {assignTo?.full_name}</DialogTitle>
          </DialogHeader>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger><SelectValue placeholder="Сыныпты таңдаңыз" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTo(null)}>Болдырмау</Button>
            <Button onClick={assignHomeroom} disabled={!selectedClassId}>Тағайындау</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
