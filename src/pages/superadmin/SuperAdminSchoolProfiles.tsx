import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, Save, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAction } from "@/lib/activity";

interface SchoolProfile {
  id: string;
  name: string;
  bin: string | null;
  school_type: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  director_name: string | null;
  director_phone: string | null;
  students_count: number | null;
  staff_count: number | null;
  classes_count: number | null;
  founded_year: number | null;
  language_of_instruction: string | null;
  shifts_count: number | null;
  internal_notes: string | null;
  public_description: string | null;
  status: string;
}

const FIELDS = "id, name, bin, school_type, region, city, address, phone, email, website, director_name, director_phone, students_count, staff_count, classes_count, founded_year, language_of_instruction, shifts_count, internal_notes, public_description, status";

export default function SuperAdminSchoolProfiles() {
  const { toast } = useToast();
  const [schools, setSchools] = useState<SchoolProfile[]>([]);
  const [selected, setSelected] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("schools").select(FIELDS).order("name");
    const rows = (data || []) as any as SchoolProfile[];
    setSchools(rows);
    setSelected((prev) => (prev ? rows.find((r) => r.id === prev.id) || rows[0] || null : rows[0] || null));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = schools.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const setField = (key: keyof SchoolProfile, value: any) =>
    setSelected((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const { id, ...rest } = selected;
    const payload: any = { ...rest };
    ["students_count", "staff_count", "classes_count", "founded_year", "shifts_count"].forEach((k) => {
      payload[k] = payload[k] === "" || payload[k] === null ? null : Number(payload[k]);
    });
    const { error } = await supabase.from("schools").update(payload).eq("id", id);
    setSaving(false);
    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
      return;
    }
    await logAction("school_profile_updated", { targetType: "school", targetId: id, metadata: { name: selected.name } });
    toast({ title: "Сақталды", description: "Мектеп профилі жаңартылды." });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Мектеп профильдері</h2>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Іздеу..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="max-h-[520px] space-y-1 overflow-y-auto">
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">Мектептер жоқ</p>}
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selected?.id === s.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {!selected ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Мектеп таңдаңыз</div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-card-foreground">Жалпы ақпарат</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Мектеп атауы</Label><Input value={selected.name || ""} onChange={(e) => setField("name", e.target.value)} /></div>
                <div className="space-y-2"><Label>БСН</Label><Input value={selected.bin || ""} onChange={(e) => setField("bin", e.target.value)} /></div>
                <div className="space-y-2"><Label>Мектеп түрі</Label><Input value={selected.school_type || ""} onChange={(e) => setField("school_type", e.target.value)} /></div>
                <div className="space-y-2"><Label>Оқыту тілі</Label><Input value={selected.language_of_instruction || ""} onChange={(e) => setField("language_of_instruction", e.target.value)} /></div>
                <div className="space-y-2"><Label>Облыс</Label><Input value={selected.region || ""} onChange={(e) => setField("region", e.target.value)} /></div>
                <div className="space-y-2"><Label>Қала</Label><Input value={selected.city || ""} onChange={(e) => setField("city", e.target.value)} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Мекенжай</Label><Input value={selected.address || ""} onChange={(e) => setField("address", e.target.value)} /></div>
                <div className="space-y-2"><Label>Құрылған жылы</Label><Input type="number" value={selected.founded_year ?? ""} onChange={(e) => setField("founded_year", e.target.value)} /></div>
                <div className="space-y-2"><Label>Ауысым саны</Label><Input type="number" value={selected.shifts_count ?? ""} onChange={(e) => setField("shifts_count", e.target.value)} /></div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-card-foreground">Сыртқы байланыс ақпараты</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Телефон</Label><Input value={selected.phone || ""} onChange={(e) => setField("phone", e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={selected.email || ""} onChange={(e) => setField("email", e.target.value)} /></div>
                <div className="space-y-2"><Label>Веб-сайт</Label><Input value={selected.website || ""} onChange={(e) => setField("website", e.target.value)} /></div>
                <div className="space-y-2"><Label>Директор аты-жөні</Label><Input value={selected.director_name || ""} onChange={(e) => setField("director_name", e.target.value)} /></div>
                <div className="space-y-2"><Label>Директор телефоны</Label><Input value={selected.director_phone || ""} onChange={(e) => setField("director_phone", e.target.value)} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Жария сипаттама (сайтта көрінеді)</Label><Textarea rows={3} value={selected.public_description || ""} onChange={(e) => setField("public_description", e.target.value)} /></div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-card-foreground">Ішкі ақпарат</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>Оқушы саны</Label><Input type="number" value={selected.students_count ?? ""} onChange={(e) => setField("students_count", e.target.value)} /></div>
                <div className="space-y-2"><Label>Қызметкер саны</Label><Input type="number" value={selected.staff_count ?? ""} onChange={(e) => setField("staff_count", e.target.value)} /></div>
                <div className="space-y-2"><Label>Сынып саны</Label><Input type="number" value={selected.classes_count ?? ""} onChange={(e) => setField("classes_count", e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Ішкі жазбалар (тек супер админ көреді)</Label><Textarea rows={4} value={selected.internal_notes || ""} onChange={(e) => setField("internal_notes", e.target.value)} /></div>
            </section>

            <Button onClick={save} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Сақтау
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
