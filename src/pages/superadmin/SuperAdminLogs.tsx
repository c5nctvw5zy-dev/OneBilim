import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, RefreshCw, Download } from "lucide-react";

interface LogRow {
  id: string;
  actor: string;
  email: string | null;
  action: string;
  target: string;
  time: string;
  kind: "audit" | "login";
  details: string;
}

const actionLabels: Record<string, string> = {
  login: "Жүйеге кірді",
  logout: "Жүйеден шықты",
  system_settings_updated: "Жүйе баптауларын өзгертті",
  school_profile_updated: "Мектеп профилін өзгертті",
  user_role_updated: "Пайдаланушы рөлін өзгертті",
  user_blocked: "Пайдаланушыны бұғаттады",
  user_unblocked: "Пайдаланушының бұғатын ашты",
  document_deleted: "Құжатты жойды",
  grade_created: "Баға қойды",
  news_published: "Жаңалық жариялады",
};

const kindColors: Record<string, string> = {
  audit: "bg-primary/10 text-primary",
  login: "bg-success/10 text-success",
};

export default function SuperAdminLogs() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | "audit" | "login">("all");

  const load = async () => {
    setLoading(true);
    const [{ data: audits }, { data: logins }, { data: profs }] = await Promise.all([
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("login_history").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("profiles").select("user_id, full_name, email"),
    ]);
    const nameMap = new Map<string, { name: string; email: string | null }>();
    (profs || []).forEach((p: any) => nameMap.set(p.user_id, { name: p.full_name, email: p.email }));

    const auditRows: LogRow[] = (audits || []).map((a: any) => {
      const who = a.actor_id ? nameMap.get(a.actor_id) : undefined;
      const meta = a.metadata || {};
      return {
        id: `a-${a.id}`,
        actor: who?.name || "Жүйе",
        email: who?.email || null,
        action: actionLabels[a.action] || a.action,
        target: [a.target_type, a.target_id].filter(Boolean).join(" · "),
        time: a.created_at,
        kind: "audit",
        details: Object.entries(meta).map(([k, v]) => `${k}: ${String(v)}`).join(", "),
      };
    });

    const loginRows: LogRow[] = (logins || []).map((l: any) => {
      const who = nameMap.get(l.user_id);
      return {
        id: `l-${l.id}`,
        actor: who?.name || "—",
        email: who?.email || null,
        action: l.status === "success" ? "Жүйеге кірді" : "Кіру әрекеті сәтсіз",
        target: "auth",
        time: l.created_at,
        kind: "login",
        details: [l.device_name, l.os, l.browser, l.ip_address].filter(Boolean).join(" · "),
      };
    });

    setRows([...auditRows, ...loginRows].sort((a, b) => +new Date(b.time) - +new Date(a.time)));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = !q || [r.actor, r.email, r.action, r.target, r.details].some((v) => (v || "").toLowerCase().includes(q));
    return matchQ && (kind === "all" || r.kind === kind);
  }), [rows, search, kind]);

  const fmt = (t: string) => new Date(t).toLocaleString("kk-KZ", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const exportCsv = () => {
    const head = "Пайдаланушы;Email;Әрекет;Нысан;Мәліметтер;Уақыт\n";
    const body = filtered.map((r) => [r.actor, r.email || "", r.action, r.target, r.details, fmt(r.time)].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + head + body], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bilimapp-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Логтар</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={load}><RefreshCw className="h-4 w-4" /> Жаңарту</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={exportCsv}><Download className="h-4 w-4" /> CSV</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Пайдаланушы, әрекет, IP бойынша іздеу..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={kind} onChange={(e) => setKind(e.target.value as any)}>
          <option value="all">Барлығы</option>
          <option value="audit">Әрекеттер</option>
          <option value="login">Кіру тарихы</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Пайдаланушы</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Әрекет</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Нысан</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Мәліметтер</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Уақыт</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Логтар жоқ</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.actor}</div>
                    {r.email && <div className="text-xs text-muted-foreground">{r.email}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${kindColors[r.kind]}`}>{r.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.target || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[280px] truncate" title={r.details}>{r.details || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{fmt(r.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
