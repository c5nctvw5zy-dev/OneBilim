import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Eye, EyeOff, KeyRound, Pencil, Plus, RefreshCw, Trash2, Plug, Globe } from "lucide-react";

type Integration = {
  id: string;
  name: string;
  provider: string | null;
  direction: "incoming" | "outgoing";
  api_key: string | null;
  api_secret: string | null;
  base_url: string | null;
  webhook_url: string | null;
  scopes: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

const emptyForm: Partial<Integration> = {
  name: "",
  provider: "",
  direction: "outgoing",
  api_key: "",
  api_secret: "",
  base_url: "",
  webhook_url: "",
  scopes: "",
  notes: "",
  is_active: true,
};

function generateKey(prefix = "bilim_sk") {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 32);
  return `${prefix}_${b64}`;
}

function MaskedField({ value }: { value: string | null }) {
  const [show, setShow] = useState(false);
  const { toast } = useToast();
  if (!value) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <div className="flex items-center gap-2">
      <code className="rounded-md bg-muted px-2 py-1 text-xs font-mono max-w-[280px] truncate">
        {show ? value : "•".repeat(Math.min(value.length, 24))}
      </code>
      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShow((s) => !s)}>
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast({ title: "Көшірілді" });
        }}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export default function SuperAdminIntegrations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Integration | null>(null);
  const [form, setForm] = useState<Partial<Integration>>(emptyForm);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("integrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    setRows((data as Integration[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (row: Integration) => {
    setEditing(row);
    setForm(row);
    setOpen(true);
  };

  const save = async () => {
    if (!form.name?.trim()) {
      toast({ title: "Атауын енгізіңіз", variant: "destructive" });
      return;
    }
    const payload: any = {
      name: form.name,
      provider: form.provider || null,
      direction: form.direction || "outgoing",
      api_key: form.api_key || null,
      api_secret: form.api_secret || null,
      base_url: form.base_url || null,
      webhook_url: form.webhook_url || null,
      scopes: form.scopes || null,
      notes: form.notes || null,
      is_active: form.is_active ?? true,
    };
    if (editing) {
      const { error } = await (supabase as any).from("integrations").update(payload).eq("id", editing.id);
      if (error) return toast({ title: "Қате", description: error.message, variant: "destructive" });
      toast({ title: "Жаңартылды" });
    } else {
      payload.created_by = user?.id ?? null;
      const { error } = await (supabase as any).from("integrations").insert(payload);
      if (error) return toast({ title: "Қате", description: error.message, variant: "destructive" });
      toast({ title: "Сақталды" });
    }
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Жоюды растайсыз ба?")) return;
    const { error } = await (supabase as any).from("integrations").delete().eq("id", id);
    if (error) return toast({ title: "Қате", description: error.message, variant: "destructive" });
    toast({ title: "Жойылды" });
    load();
  };

  const toggleActive = async (row: Integration) => {
    await (supabase as any).from("integrations").update({ is_active: !row.is_active }).eq("id", row.id);
    load();
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabasePublishable = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
  const oauthIssuer = `https://${projectRef}.supabase.co/auth/v1`;
  const mcpUrl = `${window.location.origin}/mcp`;

  const incoming = rows.filter((r) => r.direction === "incoming");
  const outgoing = rows.filter((r) => r.direction === "outgoing");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            Жүйе API кілттері және басқа жүйелермен интеграция
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Осы бетте BilimApp жүйесінің шынайы API кілттері мен құпиялары сақталады.
            Басқа жүйелер осы кілттер арқылы бізбен интеграцияланады, ал біз басқа жүйелерге қосылу үшін
            олардың API деректерін осында енгіземіз.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Жаңа интеграция
        </Button>
      </div>

      {/* Our system's public endpoints */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" /> BilimApp жүйесінің API соңғы нүктелері
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">REST API URL</Label>
              <MaskedField value={`${supabaseUrl}/rest/v1`} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">OAuth 2.1 Issuer</Label>
              <MaskedField value={oauthIssuer} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">MCP Endpoint</Label>
              <MaskedField value={mcpUrl} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Публикалық anon кілт</Label>
              <MaskedField value={supabasePublishable} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Бұл кілттер жариялы (RLS арқылы қорғалған). Құпия <code>service_role</code> кілт серверде ғана
            сақталады және мұнда көрсетілмейді.
          </p>
        </CardContent>
      </Card>

      {/* Incoming integrations */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          Кіріс интеграциялар <Badge variant="secondary">{incoming.length}</Badge>
          <span className="text-xs font-normal text-muted-foreground">
            (басқа жүйелер бізге қосылу үшін пайдаланатын кілттер)
          </span>
        </h3>
        <IntegrationsList
          loading={loading}
          rows={incoming}
          onEdit={openEdit}
          onDelete={remove}
          onToggle={toggleActive}
        />
      </section>

      {/* Outgoing */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Шығыс интеграциялар <Badge variant="secondary">{outgoing.length}</Badge>
          <span className="text-xs font-normal text-muted-foreground">
            (біз басқа жүйелерге қосылу үшін пайдаланатын кілттер)
          </span>
        </h3>
        <IntegrationsList
          loading={loading}
          rows={outgoing}
          onEdit={openEdit}
          onDelete={remove}
          onToggle={toggleActive}
        />
      </section>

      {/* Editor dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Интеграцияны өзгерту" : "Жаңа интеграция"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Атауы *</Label>
                <Input
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Мысалы: Kundelik.kz"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Провайдер</Label>
                <Input
                  value={form.provider || ""}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  placeholder="kundelik / mektep.edu.kz / 1С..."
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Бағыты</Label>
                <Select
                  value={form.direction || "outgoing"}
                  onValueChange={(v) => setForm({ ...form, direction: v as any })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">Кіріс — олар бізге қосылады</SelectItem>
                    <SelectItem value="outgoing">Шығыс — біз оларға қосыламыз</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.is_active ?? true}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <Label>Белсенді</Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Base URL</Label>
              <Input
                value={form.base_url || ""}
                onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                placeholder="https://api.example.com/v1"
              />
            </div>

            <div className="space-y-1.5">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={form.api_key || ""}
                  onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                  placeholder="pk_live_..."
                  className="font-mono text-xs"
                />
                {form.direction === "incoming" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm({ ...form, api_key: generateKey("bilim_pk") })}
                  >
                    Генерациялау
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>API Secret</Label>
              <div className="flex gap-2">
                <Input
                  value={form.api_secret || ""}
                  onChange={(e) => setForm({ ...form, api_secret: e.target.value })}
                  placeholder="sk_live_..."
                  className="font-mono text-xs"
                />
                {form.direction === "incoming" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm({ ...form, api_secret: generateKey("bilim_sk") })}
                  >
                    Генерациялау
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Webhook URL</Label>
                <Input
                  value={form.webhook_url || ""}
                  onChange={(e) => setForm({ ...form, webhook_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Рұқсаттар (scopes)</Label>
                <Input
                  value={form.scopes || ""}
                  onChange={(e) => setForm({ ...form, scopes: e.target.value })}
                  placeholder="read:students, write:grades"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Ескертулер</Label>
              <Textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Осы интеграция не үшін қажет..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Бас тарту</Button>
            <Button onClick={save}>Сақтау</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IntegrationsList({
  loading, rows, onEdit, onDelete, onToggle,
}: {
  loading: boolean;
  rows: Integration[];
  onEdit: (r: Integration) => void;
  onDelete: (id: string) => void;
  onToggle: (r: Integration) => void;
}) {
  if (loading) return <div className="text-sm text-muted-foreground p-4">Жүктелуде...</div>;
  if (rows.length === 0)
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Әзірге интеграция жоқ. Жоғарыдағы «Жаңа интеграция» батырмасын басыңыз.
        </CardContent>
      </Card>
    );

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map((r) => (
        <Card key={r.id} className={r.is_active ? "" : "opacity-60"}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{r.name}</CardTitle>
                {r.provider && <p className="text-xs text-muted-foreground mt-0.5">{r.provider}</p>}
              </div>
              <div className="flex items-center gap-1">
                <Switch checked={r.is_active} onCheckedChange={() => onToggle(r)} />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onDelete(r.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {r.base_url && (
              <div>
                <Label className="text-xs text-muted-foreground">Base URL</Label>
                <div className="truncate text-xs font-mono">{r.base_url}</div>
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">API Key</Label>
              <MaskedField value={r.api_key} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">API Secret</Label>
              <MaskedField value={r.api_secret} />
            </div>
            {r.scopes && (
              <div className="text-xs text-muted-foreground">Scopes: {r.scopes}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
