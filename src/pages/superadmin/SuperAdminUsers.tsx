import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Shield, ShieldOff, Ban, CheckCircle, Trash2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface UserRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  school_id: string | null;
  school_name?: string;
  role?: string;
  status?: string;
  protected?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Супер Админ",
  director: "Директор",
  zavuch: "Завуч",
  teacher: "Мұғалім",
  student: "Оқушы",
  parent: "Ата-ана",
  librarian: "Кітапханашы",
};

export default function SuperAdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirm, setConfirm] = useState<{ user: UserRow; type: "delete" | "block" | "unblock" | "protect" | "unprotect" } | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: statuses }, { data: schools }] = await Promise.all([
      supabase.from("profiles").select("id, user_id, full_name, email, phone, school_id"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("user_status").select("user_id, status, protected"),
      supabase.from("schools").select("id, name"),
    ]);

    const roleMap = new Map<string, string>();
    (roles || []).forEach((r: any) => roleMap.set(r.user_id, r.role));
    const statusMap = new Map<string, { status: string; protected: boolean }>();
    (statuses || []).forEach((s: any) => statusMap.set(s.user_id, { status: s.status, protected: s.protected }));
    const schoolMap = new Map<string, string>();
    (schools || []).forEach((s: any) => schoolMap.set(s.id, s.name));

    const rows: UserRow[] = (profiles || []).map((p: any) => ({
      ...p,
      school_name: p.school_id ? schoolMap.get(p.school_id) : "—",
      role: roleMap.get(p.user_id) || "—",
      status: statusMap.get(p.user_id)?.status || "active",
      protected: statusMap.get(p.user_id)?.protected || false,
    }));
    setUsers(rows);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const setStatus = async (u: UserRow, status: "active" | "blocked") => {
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase.from("user_status").upsert({
      user_id: u.user_id,
      status,
      protected: u.protected || false,
      updated_by: userRes.user!.id,
      updated_at: new Date().toISOString(),
    });
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    else { toast({ title: status === "blocked" ? "Бұғатталды" : "Қосылды" }); load(); }
  };

  const setProtected = async (u: UserRow, value: boolean) => {
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase.from("user_status").upsert({
      user_id: u.user_id,
      status: u.status || "active",
      protected: value,
      updated_by: userRes.user!.id,
      updated_at: new Date().toISOString(),
    });
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    else { toast({ title: value ? "Қорғау қосылды" : "Қорғау өшірілді" }); load(); }
  };

  const deleteUser = async (u: UserRow) => {
    const { error } = await supabase.from("profiles").delete().eq("id", u.id);
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    else { toast({ title: "Пайдаланушы жойылды" }); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Пайдаланушылар</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Іздеу..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 bg-transparent text-sm outline-none"
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
            <option value="all">Барлық рөл</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
            <option value="all">Барлық статус</option>
            <option value="active">Белсенді</option>
            <option value="blocked">Бұғатталған</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Аты-жөні</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Рөл</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Мектеп</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Әрекеттер</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Табылмады</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                    {u.full_name}
                    {u.protected && <Shield className="h-3.5 w-3.5 text-primary" />}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {ROLE_LABELS[u.role || ""] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.school_name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.status === "blocked" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                    }`}>
                      {u.status === "blocked" ? "Бұғатталған" : "Белсенді"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title={u.protected ? "Қорғауды өшіру" : "Қорғау"}
                        onClick={() => setProtected(u, !u.protected)}>
                        {u.protected ? <ShieldOff className="h-4 w-4 text-muted-foreground" /> : <Shield className="h-4 w-4 text-primary" />}
                      </Button>
                      {u.status === "blocked" ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Қосу" onClick={() => setStatus(u, "active")}>
                          <CheckCircle className="h-4 w-4 text-success" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Бұғаттау" onClick={() => setConfirm({ user: u, type: "block" })}>
                          <Ban className="h-4 w-4 text-warning" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Жою"
                        onClick={() => setConfirm({ user: u, type: "delete" })}>
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

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Растау</DialogTitle>
            <DialogDescription>
              «{confirm?.user.full_name}» пайдаланушысын {confirm?.type === "delete" ? "жою" : "бұғаттау"} керек пе?
              {confirm?.user.protected && " Бұл пайдаланушы қорғалған!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Болдырмау</Button>
            <Button variant="destructive" onClick={() => {
              if (!confirm) return;
              if (confirm.type === "delete") deleteUser(confirm.user);
              else if (confirm.type === "block") setStatus(confirm.user, "blocked");
              setConfirm(null);
            }}>Растау</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
