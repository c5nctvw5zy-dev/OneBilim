import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, CheckCircle, Clock, Trash2, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

export default function TestsPage({ isTeacher = false }: { isTeacher?: boolean }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSend, setShowSend] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [duration, setDuration] = useState("30");
  const [questions, setQuestions] = useState<Question[]>([{ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "A" }]);
  const [sendClassId, setSendClassId] = useState("");

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user!.id).single();
    if (!prof) { setLoading(false); return; }
    setProfileId(prof.id);

    const [{ data: t }, { data: subs }, { data: cls }] = await Promise.all([
      isTeacher
        ? supabase.from("tests").select("*, subjects:subject_id(name), classes:class_id(name)").eq("teacher_id", prof.id).order("created_at", { ascending: false })
        : supabase.from("tests").select("*, subjects:subject_id(name), classes:class_id(name)").eq("status", "sent").order("created_at", { ascending: false }),
      supabase.from("subjects").select("id, name"),
      supabase.from("classes").select("id, name").eq("school_id", prof.school_id!),
    ]);
    setTests(t || []);
    setSubjects(subs || []);
    setClasses(cls || []);
    setLoading(false);
  };

  const addQuestion = () => setQuestions(p => [...p, { question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "A" }]);
  const updateQ = (i: number, field: string, val: string) => setQuestions(p => p.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  const removeQ = (i: number) => setQuestions(p => p.filter((_, idx) => idx !== i));

  const handleCreate = async () => {
    if (!title || !subjectId || !profileId) { toast({ title: "Толтырыңыз", variant: "destructive" }); return; }
    const { data: test, error } = await supabase.from("tests").insert({
      title, subject_id: subjectId, teacher_id: profileId, duration_minutes: parseInt(duration), status: "draft",
    }).select().single();
    if (error || !test) { toast({ title: "Қате", description: error?.message, variant: "destructive" }); return; }

    const validQs = questions.filter(q => q.question_text.trim());
    if (validQs.length > 0) {
      await supabase.from("test_questions").insert(validQs.map((q, i) => ({ ...q, test_id: test.id, question_order: i + 1 })));
    }
    toast({ title: "Тест жасалды!" });
    setShowCreate(false);
    setTitle(""); setSubjectId(""); setQuestions([{ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "A" }]);
    loadData();
  };

  const handleSend = async (testId: string) => {
    if (!sendClassId) return;
    const { error } = await supabase.from("tests").update({ class_id: sendClassId, status: "sent" }).eq("id", testId);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Тест жіберілді!" });
    setShowSend(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("tests").delete().eq("id", id);
    setTests(p => p.filter(t => t.id !== id));
    toast({ title: "Тест жойылды" });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const statusCfg: Record<string, { label: string; cls: string }> = {
    draft: { label: "Жоба", cls: "bg-muted text-muted-foreground" },
    sent: { label: "Жіберілді", cls: "bg-success/10 text-success" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Тесттер</h2>
        {isTeacher && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Тест жасау</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Жаңа тест</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Тест атауы" value={title} onChange={e => setTitle(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger><SelectValue placeholder="Пән" /></SelectTrigger>
                    <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="Ұзақтығы (мин)" value={duration} onChange={e => setDuration(e.target.value)} />
                </div>
                <h4 className="font-semibold text-sm">Сұрақтар</h4>
                {questions.map((q, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{i + 1}-сұрақ</Label>
                      {questions.length > 1 && <button onClick={() => removeQ(i)} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>}
                    </div>
                    <Textarea placeholder="Сұрақ мәтіні" value={q.question_text} onChange={e => updateQ(i, "question_text", e.target.value)} rows={2} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="A нұсқасы" value={q.option_a} onChange={e => updateQ(i, "option_a", e.target.value)} />
                      <Input placeholder="B нұсқасы" value={q.option_b} onChange={e => updateQ(i, "option_b", e.target.value)} />
                      <Input placeholder="C нұсқасы" value={q.option_c} onChange={e => updateQ(i, "option_c", e.target.value)} />
                      <Input placeholder="D нұсқасы" value={q.option_d} onChange={e => updateQ(i, "option_d", e.target.value)} />
                    </div>
                    <Select value={q.correct_answer} onValueChange={v => updateQ(i, "correct_answer", v)}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["A","B","C","D"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <Button variant="outline" onClick={addQuestion} className="w-full gap-2"><Plus className="h-4 w-4" /> Сұрақ қосу</Button>
                <Button className="w-full" onClick={handleCreate}>Тест жасау</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {tests.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">Тесттер жоқ</div>
      ) : (
        <div className="space-y-3">
          {tests.map(t => {
            const cfg = statusCfg[t.status] || statusCfg.draft;
            return (
              <div key={t.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{t.subjects?.name}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
                      {t.classes?.name && <span className="text-xs text-muted-foreground">→ {t.classes.name}</span>}
                    </div>
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.duration_minutes} минут</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isTeacher && t.status === "draft" && (
                      <Dialog open={showSend === t.id} onOpenChange={v => setShowSend(v ? t.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-1"><Send className="h-3.5 w-3.5" /> Жіберу</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Сыныпқа жіберу</DialogTitle></DialogHeader>
                          <Select value={sendClassId} onValueChange={setSendClassId}>
                            <SelectTrigger><SelectValue placeholder="Сынып таңдаңыз" /></SelectTrigger>
                            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <Button onClick={() => handleSend(t.id)}>Жіберу</Button>
                        </DialogContent>
                      </Dialog>
                    )}
                    {isTeacher && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
