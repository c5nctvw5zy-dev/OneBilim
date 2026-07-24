import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, BookOpen, ArrowLeft, ClipboardList } from "lucide-react";
import BilimLoader from "@/components/BilimLoader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Row = {
  id?: string;
  plan_id?: string;
  row_no: number;
  lesson_date: string | null;
  teacher_names: string | null;
  group_name: string | null;
  lesson_type: string | null;
  topic: string | null;
  topic_count: number | null;
  homework_type: string | null;
  homework: string | null;
};

const emptyRow = (n: number): Row => ({
  row_no: n,
  lesson_date: "",
  teacher_names: "",
  group_name: "",
  lesson_type: "Қарапайым сабақ",
  topic: "",
  topic_count: 1,
  homework_type: "Қарапайым",
  homework: "",
});

export default function KtpEditorPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [newPlan, setNewPlan] = useState({ subject_name: "", class_name: "", academic_year: "2025-2026" });

  const selectedPlan = useMemo(() => plans.find(p => p.id === selectedPlanId), [plans, selectedPlanId]);

  useEffect(() => { if (user) loadPlans(); }, [user]);
  useEffect(() => { if (selectedPlanId) loadRows(selectedPlanId); }, [selectedPlanId]);

  const loadPlans = async () => {
    if (!profile?.school_id) { setLoading(false); return; }
    const { data } = await (supabase as any)
      .from("curriculum_plans")
      .select("*")
      .eq("school_id", profile.school_id)
      .eq("plan_type", "calendar")
      .order("created_at", { ascending: false });
    setPlans(data || []);
    setLoading(false);
  };

  const loadRows = async (planId: string) => {
    const { data } = await (supabase as any)
      .from("curriculum_rows")
      .select("*")
      .eq("plan_id", planId)
      .order("row_no");
    if (data && data.length > 0) setRows(data);
    else setRows([emptyRow(1)]);
  };

  const createPlan = async () => {
    if (!newPlan.subject_name || !newPlan.class_name || !profile?.school_id || !user) {
      toast({ title: "Пән мен сыныпты толтырыңыз", variant: "destructive" });
      return;
    }
    const { data, error } = await (supabase as any).from("curriculum_plans").insert({
      school_id: profile.school_id,
      created_by: user.id,
      plan_type: "calendar",
      subject_name: newPlan.subject_name,
      class_name: newPlan.class_name,
      academic_year: newPlan.academic_year,
      teacher_name: profile.full_name || "",
      status: "draft",
    }).select().single();
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    setPlans([data, ...plans]);
    setSelectedPlanId(data.id);
    setNewPlan({ subject_name: "", class_name: "", academic_year: "2025-2026" });
    toast({ title: "КТЖ жасалды" });
  };

  const addRow = () => setRows(r => [...r, emptyRow(r.length + 1)]);
  const removeRow = (idx: number) => setRows(r => r.filter((_, i) => i !== idx).map((row, i) => ({ ...row, row_no: i + 1 })));
  const updateRow = (idx: number, patch: Partial<Row>) =>
    setRows(r => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  // Save rows + mirror homework into homework table (best-effort, matched by class name)
  const saveAll = async () => {
    if (!selectedPlan) return;
    setSaving(true);
    // Delete existing rows and re-insert (simple upsert)
    await (supabase as any).from("curriculum_rows").delete().eq("plan_id", selectedPlan.id);
    const payload = rows.map(r => ({
      plan_id: selectedPlan.id,
      row_no: r.row_no,
      lesson_date: r.lesson_date || null,
      teacher_names: r.teacher_names || null,
      group_name: r.group_name || null,
      lesson_type: r.lesson_type || null,
      topic: r.topic || null,
      topic_count: r.topic_count || null,
      homework_type: r.homework_type || null,
      homework: r.homework || null,
    }));
    const { error } = await (supabase as any).from("curriculum_rows").insert(payload);
    if (error) {
      setSaving(false);
      toast({ title: "Қате", description: error.message, variant: "destructive" });
      return;
    }

    // Mirror homework -> public.homework so students see it in their Homework tab
    try {
      const { data: cls } = await (supabase as any)
        .from("classes")
        .select("id, name")
        .eq("school_id", profile.school_id);
      const cid = cls?.find((c: any) => c.name === selectedPlan.class_name)?.id;
      const { data: subs } = await (supabase as any).from("subjects").select("id, name").eq("school_id", profile.school_id);
      const sid = subs?.find((s: any) => s.name === selectedPlan.subject_name)?.id;

      if (cid && sid && user && profile?.id) {
        // Clear old auto-generated homework for this plan (matched heuristically by title prefix)
        await (supabase as any)
          .from("homework")
          .delete()
          .eq("class_id", cid)
          .eq("subject_id", sid)
          .like("title", "[КТЖ]%");

        const hwPayload = rows
          .filter(r => r.homework && r.homework.trim())
          .map(r => ({
            class_id: cid,
            subject_id: sid,
            teacher_id: profile.id,
            title: `[КТЖ] ${r.topic || "Тақырып"}`,
            description: r.homework,
            due_date: r.lesson_date || new Date().toISOString().slice(0, 10),
          }));
        if (hwPayload.length) await (supabase as any).from("homework").insert(hwPayload);
      }
    } catch (e) {
      // non-fatal
      console.warn("Homework mirroring failed", e);
    }

    setSaving(false);
    toast({ title: "Сақталды", description: "КТЖ және үй тапсырмасы жаңартылды" });
    loadRows(selectedPlan.id);
  };

  if (loading) return <div className="flex justify-center py-20"><BilimLoader /></div>;

  if (!selectedPlanId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ClipboardList className="h-5 w-5" /> КТЖ басқару</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input placeholder="Пән (Қазақ тілі)" value={newPlan.subject_name} onChange={e => setNewPlan({ ...newPlan, subject_name: e.target.value })} />
              <Input placeholder="Сынып (7Г)" value={newPlan.class_name} onChange={e => setNewPlan({ ...newPlan, class_name: e.target.value })} />
              <Input placeholder="Оқу жылы" value={newPlan.academic_year} onChange={e => setNewPlan({ ...newPlan, academic_year: e.target.value })} />
            </div>
            <Button onClick={createPlan} className="gap-2"><Plus className="h-4 w-4" /> Жаңа КТЖ құру</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Менің КТЖ жоспарларым</CardTitle></CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Әлі КТЖ жоқ. Жоғарыда жаңасын құрыңыз.</p>
            ) : (
              <div className="space-y-2">
                {plans.map(p => (
                  <button key={p.id} onClick={() => setSelectedPlanId(p.id)}
                    className="w-full text-left rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors">
                    <p className="font-medium text-foreground">{p.subject_name} — {p.class_name}</p>
                    <p className="text-xs text-muted-foreground">{p.academic_year} · {p.status || "draft"}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPlanId("")}><ArrowLeft className="h-4 w-4 mr-1" /> Артқа</Button>
          <div>
            <h2 className="text-xl font-bold">{selectedPlan?.subject_name} — {selectedPlan?.class_name}</h2>
            <p className="text-xs text-muted-foreground">{selectedPlan?.academic_year}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addRow} className="gap-2"><Plus className="h-4 w-4" /> Жол қосу</Button>
          <Button onClick={saveAll} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> {saving ? "Сақталуда..." : "Сақтау"}</Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[1100px]">
          <thead className="bg-muted/50">
            <tr className="border-b border-border text-left">
              <th className="px-2 py-2 font-semibold">№</th>
              <th className="px-2 py-2 font-semibold">Сабақ күні</th>
              <th className="px-2 py-2 font-semibold">Мұғалім</th>
              <th className="px-2 py-2 font-semibold">Топ</th>
              <th className="px-2 py-2 font-semibold">Сабақ типі</th>
              <th className="px-2 py-2 font-semibold">Тақырып</th>
              <th className="px-2 py-2 font-semibold">Сағат</th>
              <th className="px-2 py-2 font-semibold">Үй тапс. типі</th>
              <th className="px-2 py-2 font-semibold min-w-[200px]">Үй тапсырмасы</th>
              <th className="px-1 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-2 py-1 font-medium">{r.row_no}</td>
                <td className="px-1 py-1"><Input type="date" value={r.lesson_date || ""} onChange={e => updateRow(i, { lesson_date: e.target.value })} className="h-8 text-xs" /></td>
                <td className="px-1 py-1"><Input placeholder="Куанышбаева А." value={r.teacher_names || ""} onChange={e => updateRow(i, { teacher_names: e.target.value })} className="h-8 text-xs" /></td>
                <td className="px-1 py-1"><Input placeholder="1-топ" value={r.group_name || ""} onChange={e => updateRow(i, { group_name: e.target.value })} className="h-8 text-xs" /></td>
                <td className="px-1 py-1">
                  <Select value={r.lesson_type || ""} onValueChange={v => updateRow(i, { lesson_type: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Қарапайым сабақ">Қарапайым сабақ</SelectItem>
                      <SelectItem value="БЖБ">БЖБ</SelectItem>
                      <SelectItem value="ТЖБ">ТЖБ</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-1 py-1"><Input placeholder="Сөз таптары" value={r.topic || ""} onChange={e => updateRow(i, { topic: e.target.value })} className="h-8 text-xs" /></td>
                <td className="px-1 py-1 w-16"><Input type="number" min={1} value={r.topic_count || 1} onChange={e => updateRow(i, { topic_count: parseInt(e.target.value) || 1 })} className="h-8 text-xs" /></td>
                <td className="px-1 py-1">
                  <Select value={r.homework_type || ""} onValueChange={v => updateRow(i, { homework_type: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Қарапайым">Қарапайым</SelectItem>
                      <SelectItem value="Зерттеу жұмысы">Зерттеу жұмысы</SelectItem>
                      <SelectItem value="Шығармашылық">Шығармашылық</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-1 py-1"><Input placeholder="Зат есімнің ережелерін жаттау" value={r.homework || ""} onChange={e => updateRow(i, { homework: e.target.value })} className="h-8 text-xs" /></td>
                <td className="px-1 py-1"><Button size="icon" variant="ghost" onClick={() => removeRow(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-2">
        <BookOpen className="h-3.5 w-3.5" /> Үй тапсырмасы бағанына жазылған мәтін «Сақтау» батырмасынан кейін оқушылардың «Үй тапсырмасы» бөліміне автоматты түсіп жазылады.
      </p>
    </div>
  );
}
