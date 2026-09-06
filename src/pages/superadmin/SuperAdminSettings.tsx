import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logAction } from "@/lib/activity";
import { Loader2, Save, Upload } from "lucide-react";

interface Settings {
  system_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  default_language: string;
  timezone: string;
  datetime_format: string;
  academic_year: string;
  maintenance_mode: boolean;
  maintenance_message: string | null;
}

const TIMEZONES = ["Asia/Almaty", "Asia/Aqtobe", "Asia/Qyzylorda", "Asia/Atyrau", "Asia/Oral", "UTC"];
const FORMATS = ["dd.MM.yyyy HH:mm", "yyyy-MM-dd HH:mm", "dd/MM/yyyy hh:mm a", "dd.MM.yyyy"];
const LANGS = [
  { value: "kk", label: "Қазақша" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

export default function SuperAdminSettings() {
  const { toast } = useToast();
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);

  useEffect(() => {
    supabase.from("system_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      setS((data as any) || {
        system_name: "BilimApp", logo_url: null, favicon_url: null, default_language: "kk",
        timezone: "Asia/Almaty", datetime_format: "dd.MM.yyyy HH:mm", academic_year: "2026-2027",
        maintenance_mode: false, maintenance_message: null,
      });
      setLoading(false);
    });
  }, []);

  const set = (k: keyof Settings, v: any) => setS((p) => (p ? { ...p, [k]: v } : p));

  const upload = async (kind: "logo" | "favicon", file: File) => {
    setUploading(kind);
    const path = `system/${kind}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (error) {
      setUploading(null);
      toast({ title: "Қате", description: error.message, variant: "destructive" });
      return;
    }
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 60 * 60 * 24 * 365);
    set(kind === "logo" ? "logo_url" : "favicon_url", data?.signedUrl ?? path);
    setUploading(null);
    toast({ title: "Жүктелді", description: "Сақтау батырмасын басыңыз." });
  };

  const save = async () => {
    if (!s) return;
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("system_settings")
      .upsert({ id: 1, ...s, updated_by: auth.user?.id ?? null } as any);
    setSaving(false);
    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
      return;
    }
    await logAction("system_settings_updated", {
      targetType: "system_settings",
      targetId: "1",
      metadata: { maintenance_mode: s.maintenance_mode, academic_year: s.academic_year, default_language: s.default_language },
    });
    if (s.favicon_url) {
      const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (link) link.href = s.favicon_url;
    }
    document.title = s.system_name;
    toast({ title: "Сақталды", description: "Жүйе баптаулары жаңартылды." });
  };

  if (loading || !s) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Жүйе баптаулары</h2>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Брендинг</h3>
          <div className="space-y-2">
            <Label>Жүйе атауы</Label>
            <Input value={s.system_name} onChange={(e) => set("system_name", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Логотип</Label>
              {s.logo_url && <img src={s.logo_url} alt="Логотип" className="h-12 rounded border border-border object-contain" />}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40">
                {uploading === "logo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Файл таңдау
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload("logo", e.target.files[0])} />
              </label>
            </div>
            <div className="space-y-2">
              <Label>Favicon</Label>
              {s.favicon_url && <img src={s.favicon_url} alt="Favicon" className="h-8 w-8 rounded border border-border object-contain" />}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40">
                {uploading === "favicon" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Файл таңдау
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload("favicon", e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Аймақтық баптаулар</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Негізгі тіл</Label>
              <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={s.default_language} onChange={(e) => set("default_language", e.target.value)}>
                {LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Уақыт белдеуі</Label>
              <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={s.timezone} onChange={(e) => set("timezone", e.target.value)}>
                {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Күн/уақыт форматы</Label>
              <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={s.datetime_format} onChange={(e) => set("datetime_format", e.target.value)}>
                {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Академиялық оқу жылы</Label>
              <Input value={s.academic_year} onChange={(e) => set("academic_year", e.target.value)} placeholder="2026-2027" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Техникалық қызмет</h3>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Жүйені уақытша жабу</p>
              <p className="text-xs text-muted-foreground">Қосылса, супер админнен басқа пайдаланушылар жүйеге кіре алмайды.</p>
            </div>
            <Switch checked={s.maintenance_mode} onCheckedChange={(v) => set("maintenance_mode", v)} />
          </div>
          <div className="space-y-2">
            <Label>Хабарлама мәтіні</Label>
            <Textarea rows={3} value={s.maintenance_message || ""} onChange={(e) => set("maintenance_message", e.target.value)} placeholder="Жүйе техникалық қызмет көрсетуде. Кейінірек кіріп көріңіз." />
          </div>
        </div>

        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Сақтау
        </Button>
      </div>
    </div>
  );
}
