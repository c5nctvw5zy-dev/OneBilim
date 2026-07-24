import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BilimLoader from "@/components/BilimLoader";

type HW = { id: string; subject: string; title: string; description: string; due_date: string };

const dayLabels = ["Дүйсенбі", "Сейсенбі", "Сәрсенбі", "Бейсенбі", "Жұма", "Сенбі"];

export default function HomeworkPage({ canUpload = false }: { canUpload?: boolean }) {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<HW[]>([]);
  const [uploaded, setUploaded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => { if (user) load(); }, [user, role]);

  const load = async () => {
    if (!profile?.school_id) { setLoading(false); return; }
    try {
      // Find student's class (for student/parent); teacher/director see all school HW
      let classIds: string[] | null = null;
      if (role === "student") {
        const { data: sc } = await (supabase as any).from("student_classes").select("class_id").eq("student_id", profile.id);
        classIds = (sc || []).map((r: any) => r.class_id);
      }

      let query = (supabase as any)
        .from("homework")
        .select("id, title, description, due_date, subjects(name), classes!inner(id, school_id)")
        .eq("classes.school_id", profile.school_id)
        .order("due_date", { ascending: true });
      if (classIds && classIds.length) query = query.in("class_id", classIds);
      const { data, error } = await query;
      if (error) throw error;

      setItems((data || []).map((h: any) => ({
        id: h.id,
        subject: h.subjects?.name || "—",
        title: h.title,
        description: h.description || "",
        due_date: h.due_date,
      })));
    } catch (e: any) {
      console.warn("hw load failed", e);
    }
    setLoading(false);
  };

  const grouped = useMemo(() => {
    const map: Record<number, HW[]> = {};
    for (const h of items) {
      const d = new Date(h.due_date);
      const day = ((d.getDay() + 6) % 7) + 1; // Mon=1..Sun=7
      if (day > 6) continue;
      (map[day] = map[day] || []).push(h);
    }
    return map;
  }, [items]);

  const handleUpload = (id: string) => {
    setUploaded(prev => new Set(prev).add(id));
    toast({ title: "Жауап жүктелді!" });
  };

  if (loading) return <div className="flex justify-center py-20"><BilimLoader /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Үй тапсырмалар</h2>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium px-3">{weekOffset === 0 ? "Осы апта" : weekOffset < 0 ? `${Math.abs(weekOffset)} апта бұрын` : `${weekOffset} апта кейін`}</span>
          <Button size="icon" variant="outline" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {items.length === 0 && (
        <p className="text-center text-muted-foreground py-10 rounded-xl border border-dashed border-border">
          Үй тапсырмасы әлі жоқ. Мұғалім КТЖ бетінде толтырғаннан кейін мұнда автоматты пайда болады.
        </p>
      )}

      <div className="space-y-3">
        {dayLabels.slice(0, 6).map((label, idx) => {
          const day = idx + 1;
          const list = grouped[day] || [];
          if (list.length === 0 && items.length > 0) return null;
          return (
            <div key={day} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-primary/5 px-4 py-2 font-semibold text-primary flex items-center justify-between">
                <span>{label}</span>
                <span className="text-xs font-normal text-muted-foreground">{list.length} тапсырма</span>
              </div>
              <div className="divide-y divide-border">
                {list.map(h => {
                  const isUp = uploaded.has(h.id);
                  return (
                    <div key={h.id} className="p-3 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{h.subject}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isUp ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                            {isUp ? "Жүктелді" : "Берілді"}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{h.title}</p>
                        {h.description && <p className="text-xs text-muted-foreground mt-1">{h.description}</p>}
                      </div>
                      {canUpload && !isUp && (
                        <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => handleUpload(h.id)}>
                          <Upload className="h-3.5 w-3.5" /> Жауап
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
