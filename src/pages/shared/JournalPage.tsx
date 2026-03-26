import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, BookOpen, Loader2, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface JournalRecord {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  quarter: number;
  start_date: string;
  end_date: string;
  classes: { id: string; name: string; grade_level: number } | null;
  subjects: { id: string; name: string } | null;
}

interface GradeRecord {
  id: string;
  student_id: string;
  grade_date: string;
  grade: number | null;
  grade_type: string | null;
  journal_id: string;
}

interface StudentRecord {
  student_id: string;
  group_name: string | null;
  profiles: { id: string; full_name: string } | null;
}

export default function JournalPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [journals, setJournals] = useState<JournalRecord[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<JournalRecord | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddDate, setShowAddDate] = useState(false);
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [assessmentType, setAssessmentType] = useState("бжб");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [createForm, setCreateForm] = useState({ class_id: "", subject_id: "", quarter: "1", start_date: "", end_date: "" });
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadInitial();
  }, [user]);

  const loadInitial = async () => {
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user!.id).single();
    if (!prof) { setLoading(false); return; }
    setProfileId(prof.id);
    setSchoolId(prof.school_id);

    const { data: journalData } = await supabase
      .from("journals")
      .select("*, classes(*), subjects(*)")
      .eq(role === "teacher" ? "teacher_id" : "class_id", role === "teacher" ? prof.id : prof.id);

    // For teacher: fetch their journals. For zavuch/director: fetch school journals
    let jData: any[] = [];
    if (role === "teacher") {
      const { data } = await supabase.from("journals").select("*, classes(*), subjects(*)").eq("teacher_id", prof.id);
      jData = data || [];
    } else {
      // Zavuch/Director see all school journals
      const { data: schoolClasses } = await supabase.from("classes").select("id").eq("school_id", prof.school_id!);
      if (schoolClasses && schoolClasses.length > 0) {
        const classIds = schoolClasses.map(c => c.id);
        const { data } = await supabase.from("journals").select("*, classes(*), subjects(*)").in("class_id", classIds);
        jData = data || [];
      }
    }
    setJournals(jData);

    if (prof.school_id) {
      const { data: cls } = await supabase.from("classes").select("*").eq("school_id", prof.school_id);
      setClasses(cls || []);
    }
    const { data: subs } = await supabase.from("subjects").select("*");
    setSubjects(subs || []);
    setLoading(false);
  };

  const selectJournal = async (journal: JournalRecord) => {
    setSelectedJournal(journal);
    setSelectedGroup("all");
    const { data: sc } = await supabase
      .from("student_classes")
      .select("student_id, group_name, profiles!student_classes_student_id_fkey(id, full_name)")
      .eq("class_id", journal.class_id);
    setStudents((sc as any[]) || []);

    const { data: gr } = await supabase.from("grades").select("*").eq("journal_id", journal.id);
    setGrades(gr || []);
  };

  const createJournal = async () => {
    if (!profileId || !createForm.class_id || !createForm.subject_id || !createForm.start_date || !createForm.end_date) {
      toast({ title: "Барлық өрістерді толтырыңыз", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase.from("journals").insert({
      class_id: createForm.class_id,
      subject_id: createForm.subject_id,
      quarter: parseInt(createForm.quarter),
      start_date: createForm.start_date,
      end_date: createForm.end_date,
      teacher_id: profileId,
    }).select("*, classes(*), subjects(*)").single();

    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Журнал ашылды!" });
    setJournals(prev => [...prev, data as any]);
    setShowCreate(false);
    selectJournal(data as any);
  };

  const saveGrade = useCallback(async (studentId: string, date: string, value: string, gradeType: string = "lesson") => {
    if (!selectedJournal) return;
    const numVal = value === "" ? null : parseInt(value);
    if (numVal !== null && (isNaN(numVal) || numVal < 1 || numVal > 10)) return;

    const key = `${studentId}-${date}-${gradeType}`;
    setSaving(key);

    const existing = grades.find(g => g.student_id === studentId && g.grade_date === date && g.grade_type === gradeType);

    if (existing) {
      if (numVal === null) {
        await supabase.from("grades").delete().eq("id", existing.id);
        setGrades(prev => prev.filter(g => g.id !== existing.id));
      } else {
        await supabase.from("grades").update({ grade: numVal }).eq("id", existing.id);
        setGrades(prev => prev.map(g => g.id === existing.id ? { ...g, grade: numVal } : g));
      }
    } else if (numVal !== null) {
      const { data } = await supabase.from("grades").insert({
        journal_id: selectedJournal.id,
        student_id: studentId,
        grade_date: date,
        grade: numVal,
        grade_type: gradeType,
      }).select().single();
      if (data) setGrades(prev => [...prev, data]);
    }
    setSaving(null);
  }, [selectedJournal, grades]);

  const addDateColumn = () => {
    if (!newDate) return;
    setShowAddDate(false);
    setNewDate("");
    // The date column will appear when any grade is entered for it
    // Pre-create empty entries to show the column
    toast({ title: `${newDate} күні қосылды` });
  };

  const addAssessment = () => {
    if (!assessmentDate) return;
    setShowAddAssessment(false);
    toast({ title: `${assessmentType.toUpperCase()} қосылды` });
    setAssessmentDate("");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  // Get unique dates for columns
  const lessonDates = [...new Set(grades.filter(g => g.grade_type === "lesson" || !g.grade_type).map(g => g.grade_date))].sort();
  const assessments = [...new Set(grades.filter(g => g.grade_type === "бжб" || g.grade_type === "тжб").map(g => `${g.grade_type}|${g.grade_date}`))].sort();
  const hasQortyndy = grades.some(g => g.grade_type === "қортынды");

  // If newDate was added but no grades yet, include it
  if (newDate && !lessonDates.includes(newDate)) {
    // Already handled via toast
  }

  // Filter students by group
  const filteredStudents = selectedGroup === "all"
    ? students
    : students.filter(s => s.group_name === selectedGroup);

  const groups = [...new Set(students.map(s => s.group_name).filter(Boolean))];

  const getGrade = (studentId: string, date: string, type: string) => {
    return grades.find(g => g.student_id === studentId && g.grade_date === date && g.grade_type === type);
  };

  const calcAverage = (studentId: string) => {
    const studentGrades = grades.filter(g => g.student_id === studentId && g.grade !== null);
    if (studentGrades.length === 0) return "—";
    return (studentGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / studentGrades.length).toFixed(1);
  };

  const formatDate = (d: string) => {
    const parts = d.split("-");
    return `${parts[2]}.${parts[1]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">Электронды журнал</h2>
        {role === "teacher" && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Журнал ашу</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Жаңа журнал ашу</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Сынып</Label>
                  <Select value={createForm.class_id} onValueChange={v => setCreateForm(p => ({ ...p, class_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Сынып таңдаңыз" /></SelectTrigger>
                    <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Пән</Label>
                  <Select value={createForm.subject_id} onValueChange={v => setCreateForm(p => ({ ...p, subject_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Пән таңдаңыз" /></SelectTrigger>
                    <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Тоқсан</Label>
                  <Select value={createForm.quarter} onValueChange={v => setCreateForm(p => ({ ...p, quarter: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4].map(q => <SelectItem key={q} value={String(q)}>{q}-тоқсан</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Басталу күні</Label>
                    <Input type="date" value={createForm.start_date} onChange={e => setCreateForm(p => ({ ...p, start_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Аяқталу күні</Label>
                    <Input type="date" value={createForm.end_date} onChange={e => setCreateForm(p => ({ ...p, end_date: e.target.value }))} />
                  </div>
                </div>
                <Button className="w-full" onClick={createJournal}><BookOpen className="h-4 w-4 mr-2" /> Журнал ашу</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Journal selector */}
      {journals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {journals.map(j => (
            <button
              key={j.id}
              onClick={() => selectJournal(j)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                selectedJournal?.id === j.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {j.classes?.name} · {j.subjects?.name} · {j.quarter}-тоқсан
            </button>
          ))}
        </div>
      )}

      {journals.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Журналдар жоқ</p>
          {role === "teacher" && (
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Журнал ашу
            </Button>
          )}
        </div>
      )}

      {/* Grade table */}
      {selectedJournal && (
        <div className="space-y-4">
          {/* Group tabs + controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedGroup("all")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedGroup === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                Жалпы сынып
              </button>
              {groups.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGroup(g!)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedGroup === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Dialog open={showAddDate} onOpenChange={setShowAddDate}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1"><Calendar className="h-3.5 w-3.5" /> + Күн</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Сабақ күнін қосу</DialogTitle></DialogHeader>
                  <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                  <Button onClick={addDateColumn}>Қосу</Button>
                </DialogContent>
              </Dialog>
              <Dialog open={showAddAssessment} onOpenChange={setShowAddAssessment}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> БЖБ/ТЖБ</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Бақылау жұмысын қосу</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <Select value={assessmentType} onValueChange={setAssessmentType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="бжб">БЖБ</SelectItem>
                        <SelectItem value="тжб">ТЖБ</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="date" value={assessmentDate} onChange={e => setAssessmentDate(e.target.value)} />
                    <Button onClick={addAssessment}>Қосу</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground sticky left-0 bg-muted/50 z-10">Оқушы</th>
                  {lessonDates.map(d => (
                    <th key={d} className="px-1 py-3 text-center font-medium text-muted-foreground w-12">{formatDate(d)}</th>
                  ))}
                  {newDate && !lessonDates.includes(newDate) && (
                    <th className="px-1 py-3 text-center font-medium text-primary w-12">{formatDate(newDate)}</th>
                  )}
                  {assessments.map(a => {
                    const [type, date] = a.split("|");
                    return <th key={a} className="px-1 py-3 text-center font-medium text-warning w-12">{type.toUpperCase()}<br/><span className="text-[10px]">{formatDate(date)}</span></th>;
                  })}
                  {assessmentDate && !assessments.includes(`${assessmentType}|${assessmentDate}`) && (
                    <th className="px-1 py-3 text-center font-medium text-warning w-12">{assessmentType.toUpperCase()}<br/><span className="text-[10px]">{formatDate(assessmentDate)}</span></th>
                  )}
                  <th className="px-2 py-3 text-center font-medium text-foreground w-16">Қортынды</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const sid = student.profiles?.id || student.student_id;
                  const avg = calcAverage(sid);
                  return (
                    <tr key={sid} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 font-medium text-foreground text-xs sticky left-0 bg-card z-10">
                        {student.profiles?.full_name || "—"}
                      </td>
                      {lessonDates.map(d => {
                        const g = getGrade(sid, d, "lesson");
                        return (
                          <td key={d} className="px-1 py-1 text-center">
                            <GradeInput
                              value={g?.grade?.toString() || ""}
                              onChange={v => saveGrade(sid, d, v, "lesson")}
                              saving={saving === `${sid}-${d}-lesson`}
                            />
                          </td>
                        );
                      })}
                      {newDate && !lessonDates.includes(newDate) && (
                        <td className="px-1 py-1 text-center">
                          <GradeInput value="" onChange={v => saveGrade(sid, newDate, v, "lesson")} saving={false} />
                        </td>
                      )}
                      {assessments.map(a => {
                        const [type, date] = a.split("|");
                        const g = getGrade(sid, date, type);
                        return (
                          <td key={a} className="px-1 py-1 text-center">
                            <GradeInput
                              value={g?.grade?.toString() || ""}
                              onChange={v => saveGrade(sid, date, v, type)}
                              saving={saving === `${sid}-${date}-${type}`}
                              isAssessment
                            />
                          </td>
                        );
                      })}
                      {assessmentDate && !assessments.includes(`${assessmentType}|${assessmentDate}`) && (
                        <td className="px-1 py-1 text-center">
                          <GradeInput value="" onChange={v => saveGrade(sid, assessmentDate, v, assessmentType)} saving={false} isAssessment />
                        </td>
                      )}
                      <td className="px-2 py-2 text-center">
                        <GradeInput
                          value={getGrade(sid, selectedJournal.end_date, "қортынды")?.grade?.toString() || ""}
                          onChange={v => saveGrade(sid, selectedJournal.end_date, v, "қортынды")}
                          saving={saving === `${sid}-${selectedJournal.end_date}-қортынды`}
                          isFinal
                        />
                        <span className="text-[10px] text-muted-foreground block">{avg !== "—" ? `≈${avg}` : ""}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Бұл сыныпта оқушылар тіркелмеген
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GradeInput({ value, onChange, saving, isAssessment, isFinal }: {
  value: string;
  onChange: (v: string) => void;
  saving: boolean;
  isAssessment?: boolean;
  isFinal?: boolean;
}) {
  const [local, setLocal] = useState(value);

  useEffect(() => { setLocal(value); }, [value]);

  const handleBlur = () => {
    if (local !== value) onChange(local);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
  };

  const colorClass = !local ? "border-border bg-background text-foreground" :
    parseInt(local) >= 9 ? "bg-success/10 text-success border-success/30" :
    parseInt(local) >= 7 ? "bg-primary/10 text-primary border-primary/30" :
    parseInt(local) >= 5 ? "bg-warning/10 text-warning border-warning/30" :
    "bg-destructive/10 text-destructive border-destructive/30";

  return (
    <input
      value={local}
      onChange={e => {
        const v = e.target.value;
        if (v === "" || (/^\d{1,2}$/.test(v) && parseInt(v) >= 1 && parseInt(v) <= 10)) setLocal(v);
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`w-10 h-8 text-center rounded-md border text-sm font-bold outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${colorClass} ${
        isFinal ? "ring-1 ring-foreground/20" : ""
      } ${isAssessment ? "bg-warning/5" : ""} ${saving ? "opacity-50" : ""}`}
      maxLength={2}
    />
  );
}
