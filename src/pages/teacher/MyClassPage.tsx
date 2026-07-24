import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Phone, CheckCircle, FileText, Save, Shuffle } from "lucide-react";
import BilimLoader from "@/components/BilimLoader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Student = { id: string; full_name: string; gender: string | null; iin: string | null; phone: string | null };
type SplitMode = "alphabet" | "gender" | "manual";
type GroupConfig = {
  mode: SplitMode;
  groups: { name: string; teacher: string; student_ids: string[] }[];
};

const defaultConfig = (): GroupConfig => ({
  mode: "alphabet",
  groups: [
    { name: "1-топ", teacher: "", student_ids: [] },
    { name: "2-топ", teacher: "", student_ids: [] },
    { name: "Бөлінбегендер", teacher: "", student_ids: [] },
  ],
});

export default function MyClassPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [config, setConfig] = useState<GroupConfig>(defaultConfig());
  const [dragging, setDragging] = useState<{ studentId: string; fromGroup: number } | null>(null);

  useEffect(() => { if (user) init(); }, [user]);
  useEffect(() => { if (selectedClassId) loadClass(selectedClassId); }, [selectedClassId]);

  const init = async () => {
    if (!profile?.school_id) { setLoading(false); return; }
    // Prefer classes where this user is homeroom teacher; fallback to all
    let { data: cls } = await (supabase as any)
      .from("classes").select("id, name, grade_level, group_config")
      .eq("school_id", profile.school_id)
      .eq("homeroom_teacher_id", profile.id);
    if (!cls || cls.length === 0) {
      const res = await (supabase as any).from("classes").select("id, name, grade_level, group_config").eq("school_id", profile.school_id).order("grade_level");
      cls = res.data || [];
    }
    setClasses(cls || []);
    if (cls && cls.length > 0) setSelectedClassId(cls[0].id);
    else setLoading(false);
  };

  const loadClass = async (classId: string) => {
    setLoading(true);
    const cls = classes.find(c => c.id === classId);
    const { data: sc } = await (supabase as any)
      .from("student_classes")
      .select("student_id, profiles:student_id(id, full_name, gender, iin, phone)")
      .eq("class_id", classId);
    const list: Student[] = (sc || []).map((r: any) => r.profiles).filter(Boolean);
    setStudents(list);

    const saved = cls?.group_config as GroupConfig | null;
    if (saved && saved.groups) {
      // Ensure 3 groups exist
      const gs = [...saved.groups];
      while (gs.length < 3) gs.push({ name: `${gs.length + 1}-топ`, teacher: "", student_ids: [] });
      setConfig({ mode: saved.mode || "alphabet", groups: gs });
    } else {
      const c = defaultConfig();
      c.groups[2].student_ids = list.map(s => s.id);
      setConfig(c);
    }
    setLoading(false);
  };

  const applyMode = (mode: SplitMode) => {
    setConfig(prev => {
      const next = { ...prev, mode, groups: prev.groups.map(g => ({ ...g, student_ids: [] as string[] })) };
      if (mode === "alphabet") {
        const sorted = [...students].sort((a, b) => (a.full_name || "").localeCompare(b.full_name || "", "kk"));
        const half = Math.ceil(sorted.length / 2);
        next.groups[0] = { ...next.groups[0], name: next.groups[0].name || "1-топ", student_ids: sorted.slice(0, half).map(s => s.id) };
        next.groups[1] = { ...next.groups[1], name: next.groups[1].name || "2-топ", student_ids: sorted.slice(half).map(s => s.id) };
        next.groups[2] = { ...next.groups[2], name: "Бөлінбегендер", student_ids: [] };
      } else if (mode === "gender") {
        next.groups[0] = { ...next.groups[0], name: "Қыздар", student_ids: students.filter(s => (s.gender || "").toLowerCase().startsWith("қ") || s.gender === "female" || s.gender === "f").map(s => s.id) };
        next.groups[1] = { ...next.groups[1], name: "Ұлдар", student_ids: students.filter(s => (s.gender || "").toLowerCase().startsWith("ұ") || s.gender === "male" || s.gender === "m").map(s => s.id) };
        const placed = new Set([...next.groups[0].student_ids, ...next.groups[1].student_ids]);
        next.groups[2] = { ...next.groups[2], name: "Белгісіз", student_ids: students.filter(s => !placed.has(s.id)).map(s => s.id) };
      } else {
        // manual: put everyone into third bucket for hand-picking
        next.groups[0] = { ...next.groups[0], name: next.groups[0].name || "1-топ", student_ids: [] };
        next.groups[1] = { ...next.groups[1], name: next.groups[1].name || "2-топ", student_ids: [] };
        next.groups[2] = { ...next.groups[2], name: "Бөлінбегендер", student_ids: students.map(s => s.id) };
      }
      return next;
    });
  };

  const moveStudent = (studentId: string, toGroup: number) => {
    setConfig(prev => {
      const groups = prev.groups.map(g => ({ ...g, student_ids: g.student_ids.filter(id => id !== studentId) }));
      groups[toGroup].student_ids.push(studentId);
      return { ...prev, groups };
    });
  };

  const saveGroups = async () => {
    if (!selectedClassId) return;
    setSaving(true);
    const { error } = await (supabase as any)
      .from("classes")
      .update({ group_config: config })
      .eq("id", selectedClassId);
    // Also mirror to student_classes.group_name
    for (let gi = 0; gi < config.groups.length; gi++) {
      const g = config.groups[gi];
      if (g.student_ids.length === 0) continue;
      await (supabase as any)
        .from("student_classes")
        .update({ group_name: g.name })
        .in("student_id", g.student_ids)
        .eq("class_id", selectedClassId);
    }
    setSaving(false);
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    else toast({ title: "Сақталды!", description: "Топтар мен ұстаздар сақталды" });
  };

  const studentById = useMemo(() => Object.fromEntries(students.map(s => [s.id, s])), [students]);

  if (loading) return <div className="flex justify-center py-20"><BilimLoader /></div>;

  if (classes.length === 0) return <p className="text-center text-muted-foreground py-10">Сынып табылмады</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">Менің сыныбым</h2>
        {classes.length > 1 && (
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students"><Users className="h-4 w-4 mr-1" /> Оқушылар</TabsTrigger>
          <TabsTrigger value="parents"><Phone className="h-4 w-4 mr-1" /> Ата-аналар</TabsTrigger>
          <TabsTrigger value="attendance"><CheckCircle className="h-4 w-4 mr-1" /> Сабаққа қатысу</TabsTrigger>
          <TabsTrigger value="files"><FileText className="h-4 w-4 mr-1" /> Жеке іс-қағаздар</TabsTrigger>
        </TabsList>

        {/* ===== Students / groups ===== */}
        <TabsContent value="students" className="mt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Label className="text-sm">Топқа бөлу типі:</Label>
              {(["alphabet", "gender", "manual"] as SplitMode[]).map(m => (
                <Button key={m} size="sm" variant={config.mode === m ? "default" : "outline"} onClick={() => applyMode(m)} className="gap-1">
                  <Shuffle className="h-3.5 w-3.5" />
                  {m === "alphabet" ? "Алфавит" : m === "gender" ? "Ұл / Қыз" : "Ерікті"}
                </Button>
              ))}
            </div>
            <Button onClick={saveGroups} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? "Сақталуда..." : "Топқа бөлу және сақтау"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">Барлық оқушылар: {students.length}. Ерікті режимде оқушыларды 3-ші тармақтан тінтуірмен сүйреп 1-ші немесе 2-ші топқа тастаңыз.</p>

          <div className="grid gap-3 lg:grid-cols-3">
            {config.groups.map((g, gi) => (
              <Card key={gi}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={() => { if (dragging) { moveStudent(dragging.studentId, gi); setDragging(null); } }}
              >
                <CardHeader className="pb-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={g.name} onChange={e => setConfig(p => ({ ...p, groups: p.groups.map((x, i) => i === gi ? { ...x, name: e.target.value } : x) }))}
                      className="h-8 font-semibold" />
                    <Badge variant="secondary">{g.student_ids.length}</Badge>
                  </div>
                  {gi < 2 && (
                    <Input placeholder="Сабақ беретін ұстаз" value={g.teacher}
                      onChange={e => setConfig(p => ({ ...p, groups: p.groups.map((x, i) => i === gi ? { ...x, teacher: e.target.value } : x) }))}
                      className="h-8 text-xs" />
                  )}
                </CardHeader>
                <CardContent className="space-y-1 min-h-[120px]">
                  {g.student_ids.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Бос</p>}
                  {g.student_ids.map((sid, idx) => {
                    const s = studentById[sid];
                    if (!s) return null;
                    return (
                      <div key={sid}
                        draggable
                        onDragStart={() => setDragging({ studentId: sid, fromGroup: gi })}
                        className="flex items-center justify-between rounded-md border border-border px-2 py-1.5 bg-card cursor-move hover:bg-muted/40 transition-colors">
                        <span className="text-xs"><span className="text-muted-foreground mr-1">{idx + 1}.</span>{s.full_name}</span>
                        {config.mode === "manual" && (
                          <div className="flex gap-1">
                            {[0, 1, 2].filter(i => i !== gi).map(i => (
                              <button key={i} onClick={() => moveStudent(sid, i)}
                                className="text-[10px] rounded bg-muted px-1.5 py-0.5 hover:bg-primary/10">→{i + 1}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== Parents ===== */}
        <TabsContent value="parents" className="mt-4">
          <Card><CardContent className="pt-6 space-y-2">
            {students.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{s.full_name}</p>
                  <p className="text-xs text-muted-foreground">ЖСН: {s.iin || "—"}</p>
                </div>
                <span className="text-sm text-muted-foreground">{s.phone || "Телефон көрсетілмеген"}</span>
              </div>
            ))}
            {students.length === 0 && <p className="text-center text-muted-foreground py-6">Оқушы жоқ</p>}
          </CardContent></Card>
        </TabsContent>

        {/* ===== Attendance ===== */}
        <TabsContent value="attendance" className="mt-4">
          <Card><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-3">Қатысу деректері электронды журнал арқылы толтырылады.</p>
            <div className="space-y-2">
              {students.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm">{s.full_name}</span>
                  <Badge variant="secondary">Журналға өту</Badge>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        {/* ===== Personal files ===== */}
        <TabsContent value="files" className="mt-4">
          <Card><CardContent className="pt-6 space-y-2">
            {students.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{s.full_name}</p>
                  <p className="text-xs text-muted-foreground">Жеке іс-қағазы: ЖСН {s.iin || "—"}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1"><FileText className="h-3.5 w-3.5" /> Ашу</Button>
              </div>
            ))}
            {students.length === 0 && <p className="text-center text-muted-foreground py-6">Оқушы жоқ</p>}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
