import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, Shield, ShieldOff, Ban, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface SchoolRow {
  id: string;
  name: string;
  city: string | null;
  status: string;
  protected?: boolean;
}

const statusColors: Record<string, string> = {
  approved: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  blocked: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  approved: "Белсенді",
  pending: "Күтуде",
  blocked: "Бұғатталған",
  rejected: "Қабылданбады",
};

export default function SuperAdminSchools() {
  const { toast } = useToast();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: "", city: "", email: "", phone: "" });

  const load = async () => {
    setLoading(true);
    const [{ data: rows }, { data: sec }] = await Promise.all([
      supabase.from("schools").select("id, name, city, status").order("created_at", { ascending: false }),
      supabase.from("school_security").select("school_id, protected"),
    ]);
    const protMap = new Map<string, boolean>();
    (sec || []).forEach((s: any) => protMap.set(s.school_id, s.protected));
    setSchools((rows || []).map((s: any) => ({ ...s, protected: protMap.get(s.id) || false })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = schools.filter((s) => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.city || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const addSchool = async () => {
    if (!newSchool.name.trim()) {
      toast({ title: "Атауын енгізіңіз", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("schools").insert({
      name: newSchool.name.trim(),
      city: newSchool.city.trim() || null,
      email: newSchool.email.trim() || null,
      phone: newSchool.phone.trim() || null,
      status: "approved",
    });
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Мектеп қосылды" });
      setNewSchool({ name: "", city: "", email: "", phone: "" });
      setShowAdd(false);
      load();
    }
  };

  const setStatus = async (s: SchoolRow, status: "approved" | "blocked") => {
    const { error } = await supabase.from("schools").update({ status }).eq("id", s.id);
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    else { toast({ title: status === "blocked" ? "Бұғатталды" : "Қосылды" }); load(); }
  };

  const setProtected = async (s: SchoolRow, value: boolean) => {
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase.from("school_security").upsert({
      school_id: s.id,
      protected: value,
      updated_by: userRes.user!.id,
      updated_at: new Date().toISOString(),
    });
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    else { toast({ title: value ? "Мектеп қорғалды" : "Қорғау өшірілді" }); load(); }
  };

  const deleteSchool = async (s: SchoolRow) => {
    if (!confirm(`«${s.name}» мектебін жою керек пе?`)) return;
    const { error } = await supabase.from("schools").delete().eq("id", s.id);
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    else { toast({ title: "Жойылды" }); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Мектептер</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Іздеу..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-44 bg-transparent text-sm outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
            <option value="all">Барлық статус</option>
            <option value="approved">Белсенді</option>
            <option value="pending">Күтуде</option>
            <option value="blocked">Бұғатталған</option>
          </select>
          <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="h-4 w-4" /> Мектеп қосу</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Атауы</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Қала</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Әрекеттер</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Табылмады</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                    {s.name}
                    {s.protected && <Shield className="h-3.5 w-3.5 text-primary" />}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.city || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[s.status]}`}>
                      {statusLabels[s.status] || s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title={s.protected ? "Қорғауды өшіру" : "Қорғау"}
                        onClick={() => setProtected(s, !s.protected)}>
                        {s.protected ? <ShieldOff className="h-4 w-4 text-muted-foreground" /> : <Shield className="h-4 w-4 text-primary" />}
                      </Button>
                      {s.status === "blocked" ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Қосу" onClick={() => setStatus(s, "approved")}>
                          <CheckCircle className="h-4 w-4 text-success" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Бұғаттау" onClick={() => setStatus(s, "blocked")}>
                          <Ban className="h-4 w-4 text-warning" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Жою" onClick={() => deleteSchool(s)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Жаңа мектеп</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Мектеп атауы *" value={newSchool.name} onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })} />
            <Input placeholder="Қала" value={newSchool.city} onChange={(e) => setNewSchool({ ...newSchool, city: e.target.value })} />
            <Input placeholder="Email" value={newSchool.email} onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })} />
            <Input placeholder="Телефон" value={newSchool.phone} onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Болдырмау</Button>
            <Button onClick={addSchool}>Қосу</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
