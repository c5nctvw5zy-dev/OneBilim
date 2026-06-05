import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, Pencil, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const PROGRAMS = [
  { value: "general", label: "Жалпы оқу білімі" },
  { value: "home", label: "Үйден оқыту" },
  { value: "gifted", label: "Дарынды бала" },
  { value: "inclusive", label: "Жеке/инклюзивті оқыту" },
  { value: "remote", label: "Қашықтан оқу" },
];

const PROGRAM_LABEL: Record<string, string> = Object.fromEntries(PROGRAMS.map(p => [p.value, p.label]));

const empty = {
  alphabet_number: "" as any,
  last_name: "", first_name: "", birth_date: "", gender: "",
  nationality: "", address: "", phone: "", iin: "",
  parent_name: "", parent_phone: "",
  grade_level: "" as any, section: "",
  enroll_date: new Date().toISOString().slice(0, 10),
  status: "active",
  education_program: "general",
};

export default function AlphabetBookWizard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({ ...empty });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [classQuery, setClassQuery] = useState("");

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    if (!profile?.school_id) return;
    const [{ data: ab }, { data: cls }] = await Promise.all([
      (supabase as any).from("alphabet_book").select("*").eq("school_id", profile.school_id).order("alphabet_number"),
      supabase.from("classes").select("id, name, grade_level, section").eq("school_id", profile.school_id),
    ]);
    setRows(ab || []);
    setClasses(cls || []);
  };

  const openNew = () => {
    setEditingId(null);
    const nextNo = Math.max(0, ...rows.map(r => Number(r.alphabet_number) || 0)) + 1;
    setForm({ ...empty, alphabet_number: nextNo });
    setStep(1);
    setOpen(true);
  };

  const openEdit = (r: any) => {
    setEditingId(r.id);
    setForm({ ...empty, ...r });
    setStep(1);
    setOpen(true);
  };

  const save = async () => {
    if (!profile?.school_id) return;
    setBusy(true);
    const payload: any = { ...form, school_id: profile.school_id };
    if (payload.grade_level) payload.grade_level = Number(payload.grade_level);
    if (payload.alphabet_number) payload.alphabet_number = Number(payload.alphabet_number);
    Object.keys(payload).forEach(k => { if (payload[k] === "") payload[k] = null; });
    delete payload.created_at; delete payload.updated_at;

    const op = editingId
      ? (supabase as any).from("alphabet_book").update(payload).eq("id", editingId)
      : (supabase as any).from("alphabet_book").insert(payload);
    const { error } = await op;
    setBusy(false);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: editingId ? "Жаңартылды" : "Оқушы тіркелді" });
    setOpen(false);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Жоюды растайсыз ба?")) return;
    await (supabase as any).from("alphabet_book").delete().eq("id", id);
    toast({ title: "Жойылды" });
    load();
  };

  const filtered = rows.filter(r =>
    !search ||
    `${r.last_name} ${r.first_name} ${r.grade_level}${r.section || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const classMatches = classQuery
    ? classes.filter(c => c.name.toLowerCase().includes(classQuery.toLowerCase()))
    : classes;

  const canNext1 = form.last_name && form.first_name;
  const canNext2 = true; // optional
  const canSave = form.grade_level;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">📖 Алфавиттік кітап</h2>
          <p className="text-sm text-muted-foreground">Анкета арқылы оқушыларды тіркеу. Тіркелген оқушылар автоматты «Оқушылар мен сыныптар» бөліміне түседі.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input className="w-44 bg-transparent text-sm outline-none" placeholder="Іздеу..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Анкета толтыру</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-12">№</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Аты-жөні</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Сынып</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Бағдарлама</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Күйі</th>
                <th className="px-3 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30 group">
                  <td className="px-3 py-2 text-muted-foreground">{r.alphabet_number || "—"}</td>
                  <td className="px-3 py-2 font-medium">{r.last_name} {r.first_name}</td>
                  <td className="px-3 py-2">{r.grade_level}{r.section || ""}</td>
                  <td className="px-3 py-2 text-xs">{PROGRAM_LABEL[r.education_program] || "—"}</td>
                  <td className="px-3 py-2">
                    <Badge variant={r.status === "active" ? "default" : "secondary"}>
                      {r.status === "active" ? "Оқып жүр" : "Шығарылған"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5 text-primary" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Оқушылар жоқ</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Анкетаны өзгерту" : "Жаңа оқушы — Анкета"}</DialogTitle>
            <div className="flex items-center gap-2 pt-2">
              {[1, 2, 3].map(n => (
                <div key={n} className={`flex items-center gap-2 ${n === step ? "text-primary font-semibold" : n < step ? "text-success" : "text-muted-foreground"}`}>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${n === step ? "bg-primary text-primary-foreground" : n < step ? "bg-success text-success-foreground" : "bg-muted"}`}>
                    {n < step ? <Check className="h-3 w-3" /> : n}
                  </div>
                  <span className="text-xs">{n === 1 ? "Жеке ақпарат" : n === 2 ? "Қосымша" : "Сынып/бағдарлама"}</span>
                  {n < 3 && <span className="text-muted-foreground">›</span>}
                </div>
              ))}
            </div>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Реттік нөмір</Label><Input type="number" value={form.alphabet_number ?? ""} onChange={e => setForm({ ...form, alphabet_number: e.target.value })} /></div>
                <div></div>
                <div><Label>Тегі *</Label><Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
                <div><Label>Аты *</Label><Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
                <div><Label>Туған күні</Label><Input type="date" value={form.birth_date || ""} onChange={e => setForm({ ...form, birth_date: e.target.value })} /></div>
                <div>
                  <Label>Жынысы</Label>
                  <Select value={form.gender || ""} onValueChange={v => setForm({ ...form, gender: v })}>
                    <SelectTrigger><SelectValue placeholder="Таңдау" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Ұл</SelectItem>
                      <SelectItem value="female">Қыз</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Ұлты</Label><Input value={form.nationality || ""} onChange={e => setForm({ ...form, nationality: e.target.value })} /></div>
                <div><Label>ЖСН</Label><Input value={form.iin || ""} onChange={e => setForm({ ...form, iin: e.target.value })} /></div>
                <div className="col-span-2"><Label>Мекенжайы</Label><Input value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                <div><Label>Телефон</Label><Input value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div></div>
                <div><Label>Ата-анасы</Label><Input value={form.parent_name || ""} onChange={e => setForm({ ...form, parent_name: e.target.value })} /></div>
                <div><Label>Ата-ана телефоны</Label><Input value={form.parent_phone || ""} onChange={e => setForm({ ...form, parent_phone: e.target.value })} /></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div>
                <Label>Сыныбын іздеу</Label>
                <Input placeholder="Мысалы: 7Г" value={classQuery} onChange={e => setClassQuery(e.target.value)} />
                {classQuery && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {classMatches.slice(0, 12).map(c => (
                      <button key={c.id} type="button" onClick={() => { setForm({ ...form, grade_level: c.grade_level, section: c.section || "" }); setClassQuery(c.name); }}
                        className="rounded-md border border-border px-2 py-0.5 text-xs hover:bg-accent">
                        {c.name}
                      </button>
                    ))}
                    {classMatches.length === 0 && <span className="text-xs text-muted-foreground">Сынып табылмады. Төменге қолмен енгізіңіз.</span>}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Сынып *</Label><Input type="number" value={form.grade_level || ""} onChange={e => setForm({ ...form, grade_level: e.target.value })} /></div>
                <div><Label>Параллель</Label><Input value={form.section || ""} onChange={e => setForm({ ...form, section: e.target.value })} placeholder="А/Ә/Б/Г..." /></div>
                <div><Label>Қабылданған күні</Label><Input type="date" value={form.enroll_date || ""} onChange={e => setForm({ ...form, enroll_date: e.target.value })} /></div>
                <div>
                  <Label>Мектептегі күйі</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Оқып жүр</SelectItem>
                      <SelectItem value="exited">Шығарылған</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Оқу бағдарламасы</Label>
                  <Select value={form.education_program} onValueChange={v => setForm({ ...form, education_program: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROGRAMS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex !justify-between">
            <div>
              {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-1"><ArrowLeft className="h-4 w-4" /> Артқа</Button>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Болдырмау</Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} disabled={step === 1 ? !canNext1 : !canNext2} className="gap-1">
                  Келесі <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={save} disabled={!canSave || busy} className="gap-1">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Сақтау
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
