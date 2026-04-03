import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { School, Users, Activity, FileText, Plus, Bell, ClipboardList, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function SuperAdminHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ schools: 0, users: 0, pending: 0, recent: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [{ count: schoolCount }, { count: userCount }, { count: pendingCount }, { data: apps }] = await Promise.all([
        supabase.from("schools").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("applications").select("id, school_name, status, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        schools: schoolCount || 0,
        users: userCount || 0,
        pending: pendingCount || 0,
        recent: (apps || []).length,
      });
      setRecentApps(apps || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Жаңа ғана";
    if (hours < 24) return `${hours} сағат бұрын`;
    return `${Math.floor(hours / 24)} күн бұрын`;
  };

  const statusLabels: Record<string, string> = {
    pending: "Жаңа",
    approved: "Мақұлданды",
    rejected: "Қабылданбады",
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Мектептер" value={stats.schools} icon={School} color="blue" />
        <StatCard title="Пайдаланушылар" value={stats.users} icon={Users} color="green" />
        <StatCard title="Жаңа өтінімдер" value={stats.pending} icon={FileText} color="orange" />
        <StatCard title="Соңғы әрекеттер" value={stats.recent} icon={Activity} color="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Жылдам әрекеттер</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/super-admin/schools")}>
              <Plus className="h-4 w-4" /> Мектеп қосу
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/super-admin/applications")}>
              <ClipboardList className="h-4 w-4" /> Өтінімдерді қабылдау
              {stats.pending > 0 && <span className="ml-auto rounded-full bg-warning/10 px-2 py-0.5 text-xs font-bold text-warning">{stats.pending}</span>}
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/super-admin/users")}>
              <Users className="h-4 w-4" /> Пайдаланушылар
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Соңғы өтінімдер</h3>
          <div className="space-y-3">
            {recentApps.length === 0 ? (
              <p className="text-sm text-muted-foreground">Өтінімдер жоқ</p>
            ) : recentApps.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <span className="text-sm text-foreground">{a.school_name}</span>
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.status === "pending" ? "bg-warning/10 text-warning" : a.status === "approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}>{statusLabels[a.status] || a.status}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
