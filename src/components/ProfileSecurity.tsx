import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  History, Smartphone, QrCode, PenTool, Trophy, Check, X, Star, ShieldCheck, Trash2,
} from "lucide-react";

interface LoginRow {
  id: string; device_name: string | null; os: string | null; browser: string | null;
  ip_address: string | null; status: string; created_at: string;
}
interface DeviceRow {
  id: string; device_name: string; device_type: string | null; os: string | null;
  browser: string | null; is_primary: boolean; last_active_at: string;
}
interface LinkReq {
  id: string; token: string; requester_device: string | null; requester_os: string | null;
  requester_browser: string | null; created_at: string; expires_at: string; status: string;
}

const fmt = (d: string) =>
  new Date(d).toLocaleString("kk-KZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function ProfileSecurity() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [logins, setLogins] = useState<LoginRow[]>([]);
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [reqs, setReqs] = useState<LinkReq[]>([]);
  const [sigUrl, setSigUrl] = useState<string | null>(null);
  const [achv, setAchv] = useState<{ label: string; value: string; icon: string }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: lh }, { data: dv }, { data: rq }] = await Promise.all([
      supabase.from("login_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("user_devices").select("*").eq("user_id", user.id).order("last_active_at", { ascending: false }),
      supabase.from("device_link_requests").select("*").eq("status", "pending").gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(10),
    ]);
    setLogins((lh as any) || []);
    setDevices((dv as any) || []);
    setReqs((rq as any) || []);

    const path = (profile as any)?.signature_url as string | null;
    if (path) {
      const { data } = await supabase.storage.from("signatures").createSignedUrl(path, 3600);
      setSigUrl(data?.signedUrl ?? null);
    } else setSigUrl(null);
  }, [user?.id, (profile as any)?.signature_url]);

  useEffect(() => { load(); }, [load]);

  // Жетістіктерім — нақты деректерден
  useEffect(() => {
    (async () => {
      if (!profile?.id) return;
      const [{ data: gr }, { count: docCount }, { count: loginCount }] = await Promise.all([
        supabase.from("grades").select("grade").eq("student_id", profile.id).limit(500),
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("signed_by", profile.id),
        supabase.from("login_history").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      const grades = ((gr as any[]) || []).map((g) => g.grade).filter((g) => typeof g === "number");
      const avg = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1) : "—";
      setAchv([
        { label: "Орташа баға", value: String(avg), icon: "⭐" },
        { label: "Бағалар саны", value: String(grades.length), icon: "📊" },
        { label: "Қол қойылған құжат", value: String(docCount ?? 0), icon: "✍️" },
        { label: "Жүйеге кіру", value: String(loginCount ?? 0), icon: "🔐" },
      ]);
    })();
  }, [profile?.id, user?.id]);

  const setPrimary = async (id: string) => {
    if (!user) return;
    await supabase.from("user_devices").update({ is_primary: false }).eq("user_id", user.id);
    await supabase.from("user_devices").update({ is_primary: true }).eq("id", id);
    toast({ title: "Негізгі құрылғы белгіленді" });
    load();
  };

  const unlink = async (id: string) => {
    await supabase.from("user_devices").delete().eq("id", id);
    setDevices((p) => p.filter((d) => d.id !== id));
    toast({ title: "Құрылғы ажыратылды" });
  };

  const decide = async (id: string, approve: boolean) => {
    if (!user) return;
    const { error } = await supabase
      .from("device_link_requests")
      .update({ user_id: user.id, status: approve ? "approved" : "denied", approved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    setReqs((p) => p.filter((r) => r.id !== id));
    toast({ title: approve ? "QR кіру расталды ✓" : "Сұраныс қабылданбады" });
  };

  const start = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const r = canvasRef.current!.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
  };
  const move = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const r = canvasRef.current!.getBoundingClientRect();
    ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  const end = () => { drawing.current = false; };
  const clear = () => {
    const c = canvasRef.current;
    if (c) c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
  };

  const saveSignature = async () => {
    if (!canvasRef.current || !user) return;
    const blob = await new Promise<Blob | null>((r) => canvasRef.current!.toBlob(r, "image/png"));
    if (!blob) return;
    const path = `${user.id}/signature_${Date.now()}.png`;
    const { error: upErr } = await supabase.storage.from("signatures").upload(path, blob);
    if (upErr) { toast({ title: "Қате", description: upErr.message, variant: "destructive" }); return; }
    const { error } = await supabase.from("profiles").update({ signature_url: path } as any).eq("user_id", user.id);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    const { data } = await supabase.storage.from("signatures").createSignedUrl(path, 3600);
    setSigUrl(data?.signedUrl ?? null);
    toast({ title: "Электронды қолтаңба сақталды" });
  };

  const Section = ({ icon: Icon, title, desc, children }: any) => (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-card-foreground">{title}</h3>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <Section icon={Trophy} title="Жетістіктерім" desc="Нақты деректер негізінде">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {achv.map((a) => (
            <div key={a.label} className="rounded-xl border border-border p-3 text-center">
              <div className="text-xl">{a.icon}</div>
              <div className="text-lg font-bold text-foreground">{a.value}</div>
              <div className="text-[11px] text-muted-foreground">{a.label}</div>
            </div>
          ))}
          {achv.length === 0 && <p className="text-sm text-muted-foreground col-span-4">Деректер жоқ</p>}
        </div>
      </Section>

      <Section icon={QrCode} title="QR арқылы кіруді растау" desc="Басқа құрылғыдан келген сұраныстар (3 минут жарамды)">
        {reqs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Растауды күтетін сұраныс жоқ.</p>
        ) : (
          <div className="space-y-2">
            {reqs.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
                <div className="text-sm">
                  <p className="font-medium text-foreground">{r.requester_device || "Белгісіз құрылғы"}</p>
                  <p className="text-xs text-muted-foreground">{r.requester_os} · {r.requester_browser} · {fmt(r.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1" onClick={() => decide(r.id, true)}><Check className="h-3.5 w-3.5" /> Растау</Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => decide(r.id, false)}><X className="h-3.5 w-3.5" /> Жоқ</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon={Smartphone} title="Байланыстырылған құрылғылар">
        {devices.length === 0 ? (
          <p className="text-sm text-muted-foreground">Құрылғылар тіркелмеген.</p>
        ) : (
          <div className="space-y-2">
            {devices.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
                <div className="text-sm">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    {d.device_name}
                    {d.is_primary && <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">Негізгі</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{d.os} · {d.browser} · {fmt(d.last_active_at)}</p>
                </div>
                <div className="flex gap-2">
                  {!d.is_primary && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setPrimary(d.id)}>
                      <Star className="h-3.5 w-3.5" /> Негізгі
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="gap-1 text-destructive" onClick={() => unlink(d.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Ажырату
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section icon={PenTool} title="Электронды қолтаңба" desc="Құжаттарға қол қою үшін сақталады">
        {sigUrl && (
          <div className="rounded-lg border border-border bg-white p-2">
            <img src={sigUrl} alt="Менің электронды қолтаңбам" className="h-16" />
          </div>
        )}
        <canvas
          ref={canvasRef} width={400} height={140}
          className="w-full cursor-crosshair rounded-lg border border-border bg-white"
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={clear}>Тазалау</Button>
          <Button className="gap-2" onClick={saveSignature}><ShieldCheck className="h-4 w-4" /> Қолтаңбаны сақтау</Button>
        </div>
      </Section>

      <Section icon={History} title="Кіру тарихы" desc="Соңғы 20 кіру">
        {logins.length === 0 ? (
          <p className="text-sm text-muted-foreground">Тарих жоқ.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2">Күні</th><th className="py-2">Құрылғы</th><th className="py-2">Браузер</th><th className="py-2">IP</th><th className="py-2">Күйі</th>
                </tr>
              </thead>
              <tbody>
                {logins.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0">
                    <td className="py-2 whitespace-nowrap">{fmt(l.created_at)}</td>
                    <td className="py-2">{l.device_name || "—"}</td>
                    <td className="py-2">{l.browser || "—"}</td>
                    <td className="py-2 text-muted-foreground">{l.ip_address || "—"}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${l.status === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {l.status === "success" ? "Сәтті" : "Сәтсіз"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
