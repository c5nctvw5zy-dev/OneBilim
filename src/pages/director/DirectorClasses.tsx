import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, Loader2, UserCheck, Pencil, LogOut, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const PROGRAM_LABEL: Record<string, string> = {
  general: "Жалпы",
  home: "Үйден",
  gifted: "Дарынды",
  inclusive: "Инклюзивті",
  remote: "Қашықтан",
};

export default function DirectorClasses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newGrade, setNewGrade] = useState("");
  const [newSection, setNewSection] = useState("");
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [assignTeacher, setAssignTeacher] = useState<any>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [editStudent, setEditStudent] = useState<any | null>(null);
  const [exitStudent, setExitStudent] = useState<any | null>(null);
  const [exitReason, setExitReason] = useState("");
  const [exitOrderNo, setExitOrderNo] = useState("");

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user!.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    setSchoolId(prof.school_id);

    const [{ data: cls }, { data: ab }, { data: teacherRoles }, { data: teacherProfiles }] = await Promise.all([
      supabase.from("classes").select("id, name, grade_level, section, homeroom_teacher_id").eq("school_id", prof.school_id).order("grade_level"),
      (supabase as any).from("alphabet_book").select("*").eq("school_id", prof.school_id).order("last_name"),
      supabase.from("user_roles").select("user_id").eq("role", "teacher"),
      supabase.from("profiles").select("id, full_name, user_id").eq("school_id", prof.school_id),
    ]);

    const teacherUserIds = (teacherRoles || []).map(r => r.user_id);
    const filteredTeachers = (teacherProfiles || []).filter(p => teacherUserIds.includes(p.user_id));
    setTeachers(filteredTeachers);

    const teacherMap: Record<string, string> = {};
    (teacherProfiles || []).forEach(t => { teacherMap[t.id] = t.full_name; });

    setClasses((cls || []).map(c => ({ ...c, teacher_name: c.homeroom_teacher_id ? teacherMap[c.homeroom_teacher_id] : null })));
    setStudents(ab || []);
    setLoading(false);
  };

  // Group students by class label "{grade}{section}"
  const studentsByClass = useMemo(() => {
    const map: Record<string, any[]> = {};
    students.filter(s => s.status !== "exited").forEach(s => {
      const key = `${s.grade_level || ""}${s.section || ""}`.trim();
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [students]);

  // Build display list: union of classes + alphabet sections
  const displayBlocks = useMemo(() => {
    const keys = new Set<string>();
    classes.forEach(c => keys.add(`${c.grade_level || ""}${c.section || ""}`.trim()));
    Object.keys(studentsByClass).forEach(k => k && keys.add(k));
    return Array.from(keys).filter(k => k && (!searchQuery || k.toLowerCase().includes(searchQuery.toLowerCase())))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [classes, studentsByClass, searchQuery]);

  const handleAddClass = async () => {
    if (!newGrade || !schoolId) return;
    const name = `${newGrade}${newSection}`;
    const { error } = await supabase.from("classes").insert({
      name, grade_level: parseInt(newGrade), section: newSection, school_id: schoolId,
    });
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Сынып қосылды!", description: name });
    setNewGrade(""); setNewSection(""); setShowAdd(false); loadData();
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Сыныпты жоюды растайсыз ба?")) return;
    await supabase.from("classes").delete().eq("id", id);
    toast({ title: "Сынып жойылды" }); loadData();
  };

  const handleAssignTeacher = async () => {
    if (!assignTeacher || !selectedTeacherId) return;
    const { error } = await supabase.from("classes").update({ homeroom_teacher_id: selectedTeacherId }).eq("id", assignTeacher.id);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Жетекші тағайындалды!" });
    setAssignTeacher(null); setSelectedTeacherId(""); loadData();
  };

  const saveStudent = async () => {
    if (!editStudent) return;
    const { id, created_at, updated_at, school_id, ...rest } = editStudent;
    const { error } = await (supabase as any).from("alphabet_book").update(rest).eq("id", id);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Оқушы жаңартылды" }); setEditStudent(null); loadData();
  };

  const exitStudentAction = async () => {
    if (!exitStudent) return;
    const { error } = await (supabase as any).from("alphabet_book").update({
      status: "exited",
      exit_date: new Date().toISOString().slice(0, 10),
      exit_reason: exitReason || null,
      exit_order_no: exitOrderNo || null,
    }).eq("id", exitStudent.id);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Оқушы шығарылды", description: exitStudent.last_name + " " + exitStudent.first_name });
    setExitStudent(null); setExitReason(""); setExitOrderNo(""); loadData();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Оқушылар мен сыныптар</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Әр сынып жеке блокта. Оқушылар «Алфавиттік кітаптан» автоматты түрде осында түседі.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Сынып іздеу..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-40 bg-transparent text-sm outline-none" />
          </div>
          <Button className="gap-2" onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Сынып қосу</Button>
        </div>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold">Жаңа сынып</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Сынып (мыс: 5)" value={newGrade} onChange={e => setNewGrade(e.target.value)} />
              <Input placeholder="Параллель (мыс: А)" value={newSection} onChange={e => setNewSection(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddClass}>Қосу</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Болдырмау</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {displayBlocks.length === 0 && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          Сыныптар жоқ. Алфавиттік кітапқа оқушы қосыңыз немесе «Сынып қосу» батырмасын басыңыз.
        </CardContent></Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {displayBlocks.map(key => {
          const cls = classes.find(c => `${c.grade_level || ""}${c.section || ""}`.trim() === key);
          const list = studentsByClass[key] || [];
          return (
            <Card key={key} className="overflow-hidden">
              <CardHeader className="pb-3 bg-primary/5">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span className="font-bold text-lg">{key}</span>
                    <Badge variant="secondary">{list.length} оқушы</Badge>
                    {cls?.teacher_name && <Badge variant="outline">👤 {cls.teacher_name}</Badge>}
                  </div>
                  <div className="flex gap-1">
                    {cls && (
                      <>
                        <Button size="icon" variant="ghost" title="Жетекші тағайындау" onClick={() => { setAssignTeacher(cls); setSelectedTeacherId(cls.homeroom_teacher_id || ""); }}>
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Сыныппен жұмыс / өзгерту" onClick={() => { setAssignTeacher(cls); setSelectedTeacherId(cls.homeroom_teacher_id || ""); }}>
                          <Pencil className="h-4 w-4 text-primary" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Сыныпты жою" onClick={() => handleDeleteClass(cls.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {list.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">Бұл сыныпта оқушы жоқ</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground w-8">#</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Аты-жөні</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Бағдарлама</th>
                        <th className="px-3 py-2 w-24"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((s, i) => (
                        <tr key={s.id} className="border-t border-border group hover:bg-muted/30">
                          <td className="px-3 py-2 text-muted-foreground">{s.alphabet_number || i + 1}</td>
                          <td className="px-3 py-2 font-medium">{s.last_name} {s.first_name}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {PROGRAM_LABEL[s.education_program] || "Жалпы"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-7 w-7" title="Өзгерту" onClick={() => setEditStudent({ ...s })}>
                                <Pencil className="h-3.5 w-3.5 text-primary" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" title="Шығару" onClick={() => setExitStudent(s)}>
                                <LogOut className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Жетекші тағайындау */}
      <Dialog open={!!assignTeacher} onOpenChange={v => { if (!v) setAssignTeacher(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Сынып жетекшісі — {assignTeacher?.name}</DialogTitle></DialogHeader>
          <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
            <SelectTrigger><SelectValue placeholder="Мұғалімді таңдаңыз" /></SelectTrigger>
            <SelectContent>
              {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTeacher(null)}>Болдырмау</Button>
            <Button onClick={handleAssignTeacher} disabled={!selectedTeacherId}>Сақтау</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Оқушыны өзгерту */}
      <Dialog open={!!editStudent} onOpenChange={v => { if (!v) setEditStudent(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Оқушы профилі</DialogTitle></DialogHeader>
          {editStudent && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Тегі</label>
                  <Input value={editStudent.last_name || ""} onChange={e => setEditStudent({ ...editStudent, last_name: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Аты</label>
                  <Input value={editStudent.first_name || ""} onChange={e => setEditStudent({ ...editStudent, first_name: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Сынып</label>
                  <Input type="number" value={editStudent.grade_level || ""} onChange={e => setEditStudent({ ...editStudent, grade_level: Number(e.target.value) })} /></div>
                <div><label className="text-xs text-muted-foreground">Параллель</label>
                  <Input value={editStudent.section || ""} onChange={e => setEditStudent({ ...editStudent, section: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Туған күні</label>
                  <Input type="date" value={editStudent.birth_date || ""} onChange={e => setEditStudent({ ...editStudent, birth_date: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Телефон</label>
                  <Input value={editStudent.phone || ""} onChange={e => setEditStudent({ ...editStudent, phone: e.target.value })} /></div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Оқу бағдарламасы</label>
                <Select value={editStudent.education_program || "general"} onValueChange={v => setEditStudent({ ...editStudent, education_program: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROGRAM_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Ата-ана</label>
                  <Input value={editStudent.parent_name || ""} onChange={e => setEditStudent({ ...editStudent, parent_name: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Ата-ана тел.</label>
                  <Input value={editStudent.parent_phone || ""} onChange={e => setEditStudent({ ...editStudent, parent_phone: e.target.value })} /></div>
              </div>
              <div><label className="text-xs text-muted-foreground">Мекенжайы</label>
                <Input value={editStudent.address || ""} onChange={e => setEditStudent({ ...editStudent, address: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStudent(null)}>Болдырмау</Button>
            <Button onClick={saveStudent}>Сақтау</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Оқушыны шығару */}
      <Dialog open={!!exitStudent} onOpenChange={v => { if (!v) { setExitStudent(null); setExitReason(""); setExitOrderNo(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Оқушыны мектептен шығару</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{exitStudent?.last_name} {exitStudent?.first_name}</strong> орта білім ұйымынан шығарылады.
            Бұл әрекет Алфавиттік кітапта тіркеледі.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Бұйрық №</label>
            <Input value={exitOrderNo} onChange={e => setExitOrderNo(e.target.value)} placeholder="Мыс: 142" />
            <label className="text-sm font-medium">Шығу себебі</label>
            <Input value={exitReason} onChange={e => setExitReason(e.target.value)} placeholder="Себебін жазыңыз" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExitStudent(null)}>Болдырмау</Button>
            <Button variant="destructive" onClick={exitStudentAction}>Шығару</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
