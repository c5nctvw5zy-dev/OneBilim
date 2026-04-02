import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Eye, UserPlus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function DirectorStudents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignDialog, setAssignDialog] = useState<any>(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user!.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    setSchoolId(prof.school_id);

    const [{ data: allProfiles }, { data: cls }, { data: sc }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").eq("school_id", prof.school_id),
      supabase.from("classes").select("id, name, grade_level, homeroom_teacher_id").eq("school_id", prof.school_id).order("grade_level"),
      supabase.from("student_classes").select("student_id, class_id, group_name"),
    ]);

    // Get student role user_ids
    const { data: studentRoles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
    const studentUserIds = new Set((studentRoles || []).map(r => r.user_id));

    // Map student_classes by student_id
    const classMap: Record<string, any> = {};
    (sc || []).forEach(s => { classMap[s.student_id] = s; });

    const classNameMap: Record<string, string> = {};
    (cls || []).forEach(c => { classNameMap[c.id] = c.name; });

    const studentList = (allProfiles || [])
      .filter(p => studentUserIds.has(p.id) || classMap[p.id]) // profiles where user_id is student
      .map(p => ({
        ...p,
        class_id: classMap[p.id]?.class_id || null,
        class_name: classMap[p.id] ? classNameMap[classMap[p.id].class_id] || "—" : null,
        group_name: classMap[p.id]?.group_name || null,
      }));

    // Actually we need to match by profile id for student_classes
    // But user_roles uses user_id (auth id), profiles has both id and user_id
    // Let's re-approach: get all profiles in school, check which ones have student role via user_id
    const profileUserIds = (allProfiles || []).map(p => p.id); // this is profile.id, not user_id
    
    // We need user_id from profiles to check roles
    const { data: allProfilesFull } = await supabase.from("profiles").select("id, full_name, email, user_id").eq("school_id", prof.school_id);
    
    const studentProfiles = (allProfilesFull || []).filter(p => studentUserIds.has(p.user_id));
    
    const finalStudents = studentProfiles.map(p => ({
      ...p,
      class_id: classMap[p.id]?.class_id || null,
      class_name: classMap[p.id] ? classNameMap[classMap[p.id].class_id] || "—" : null,
      group_name: classMap[p.id]?.group_name || null,
    }));

    setStudents(finalStudents);
    setClasses(cls || []);
    setLoading(false);
  };

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.class_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignToClass = async () => {
    if (!assignDialog || !selectedClassId) return;
    // Remove from old class if exists
    if (assignDialog.class_id) {
      await supabase.from("student_classes").delete().eq("student_id", assignDialog.id).eq("class_id", assignDialog.class_id);
    }
    // Insert into new class
    const { error } = await supabase.from("student_classes").insert({
      student_id: assignDialog.id,
      class_id: selectedClassId,
    });
    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Сыныпқа жинақталды!", description: `${assignDialog.full_name}` });
    setAssignDialog(null);
    setSelectedClassId("");
    loadData();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Оқушылар ({students.length})</h2>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Іздеу..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-40 bg-transparent text-sm outline-none" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Аты-жөні</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сынып</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Топ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.full_name}</td>
                <td className="px-4 py-3">
                  {s.class_name ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s.class_name}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Жинақталмаған</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{s.group_name || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { setAssignDialog(s); setSelectedClassId(s.class_id || ""); }}>
                    <UserPlus className="h-3.5 w-3.5" /> Сыныпқа жинау
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Оқушылар табылмады</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!assignDialog} onOpenChange={v => { if (!v) setAssignDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сыныпқа жинау</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">
            <strong>{assignDialog?.full_name}</strong> оқушысын сыныпқа тағайындаңыз
          </p>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger><SelectValue placeholder="Сыныпты таңдаңыз" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAssignToClass} disabled={!selectedClassId}>Тағайындау</Button>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>Болдырмау</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
