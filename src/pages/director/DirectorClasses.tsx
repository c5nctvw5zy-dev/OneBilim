import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, Loader2, UserCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function DirectorClasses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newGrade, setNewGrade] = useState("");
  const [newSection, setNewSection] = useState("");
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [assignTeacherDialog, setAssignTeacherDialog] = useState<any>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user!.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    setSchoolId(prof.school_id);

    const [{ data: cls }, { data: sc }, { data: teacherRoles }] = await Promise.all([
      supabase.from("classes").select("id, name, grade_level, section, homeroom_teacher_id").eq("school_id", prof.school_id).order("grade_level"),
      supabase.from("student_classes").select("class_id"),
      supabase.from("user_roles").select("user_id").eq("role", "teacher"),
    ]);

    // Count students per class
    const counts: Record<string, number> = {};
    (sc || []).forEach(s => { counts[s.class_id] = (counts[s.class_id] || 0) + 1; });
    setStudentCounts(counts);

    // Get teacher profiles
    const teacherUserIds = (teacherRoles || []).map(r => r.user_id);
    const { data: teacherProfiles } = await supabase.from("profiles").select("id, full_name, user_id").eq("school_id", prof.school_id);
    const filteredTeachers = (teacherProfiles || []).filter(p => teacherUserIds.includes(p.user_id));
    setTeachers(filteredTeachers);

    // Map teacher names to classes
    const teacherMap: Record<string, string> = {};
    (teacherProfiles || []).forEach(t => { teacherMap[t.id] = t.full_name; });

    const enrichedClasses = (cls || []).map(c => ({
      ...c,
      teacher_name: c.homeroom_teacher_id ? teacherMap[c.homeroom_teacher_id] || "—" : null,
    }));

    setClasses(enrichedClasses);
    setLoading(false);
  };

  const filtered = classes.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.teacher_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newGrade || !newSection || !schoolId) return;
    const name = `${newGrade}${newSection}`;
    const { error } = await supabase.from("classes").insert({
      name,
      grade_level: parseInt(newGrade),
      section: newSection,
      school_id: schoolId,
    });
    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Сынып қосылды!", description: name });
    setNewGrade(""); setNewSection(""); setShowAdd(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("classes").delete().eq("id", id);
    toast({ title: "Сынып жойылды", variant: "destructive" });
    loadData();
  };

  const handleAssignTeacher = async () => {
    if (!assignTeacherDialog || !selectedTeacherId) return;
    const { error } = await supabase.from("classes").update({ homeroom_teacher_id: selectedTeacherId }).eq("id", assignTeacherDialog.id);
    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Жетекші тағайындалды!" });
    setAssignTeacherDialog(null);
    setSelectedTeacherId("");
    loadData();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Сыныптар ({classes.length})</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Іздеу..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-40 bg-transparent text-sm outline-none" />
          </div>
          <Button className="gap-2" onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4" /> Сынып қосу</Button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Жаңа сынып</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Сынып (мыс: 5)" value={newGrade} onChange={e => setNewGrade(e.target.value)} />
            <Input placeholder="Бөлім (мыс: А)" value={newSection} onChange={e => setNewSection(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd}>Қосу</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Болдырмау</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сынып</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сынып жетекшісі</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Оқушылар</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{c.name}</span>
                </td>
                <td className="px-4 py-3 text-foreground">
                  {c.teacher_name || <span className="text-muted-foreground text-xs">Тағайындалмаған</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{studentCounts[c.id] || 0} оқушы</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { setAssignTeacherDialog(c); setSelectedTeacherId(c.homeroom_teacher_id || ""); }}>
                      <UserCheck className="h-3.5 w-3.5" /> Жетекші тағайындау
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Сыныптар табылмады</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!assignTeacherDialog} onOpenChange={v => { if (!v) setAssignTeacherDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Жетекші тағайындау — {assignTeacherDialog?.name}</DialogTitle>
          </DialogHeader>
          <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
            <SelectTrigger><SelectValue placeholder="Мұғалімді таңдаңыз" /></SelectTrigger>
            <SelectContent>
              {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAssignTeacher} disabled={!selectedTeacherId}>Тағайындау</Button>
            <Button variant="outline" onClick={() => setAssignTeacherDialog(null)}>Болдырмау</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
