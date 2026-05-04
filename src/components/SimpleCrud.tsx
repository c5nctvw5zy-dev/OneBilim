import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export type CrudField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "date" | "number" | "boolean";
  required?: boolean;
};

interface Props {
  title: string;
  table: string;
  fields: CrudField[];
  listColumns?: string[];
  defaults?: Record<string, any>;
  scope?: "school" | "user";
  orderBy?: string;
  filter?: Record<string, any>;
}

export default function SimpleCrud({ title, table, fields, listColumns, defaults = {}, scope = "school", orderBy = "created_at", filter }: Props) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const cols = listColumns ?? fields.map(f => f.key);

  const load = async () => {
    setLoading(true);
    let q = (supabase as any).from(table).select("*").order(orderBy, { ascending: false });
    if (filter) Object.entries(filter).forEach(([k, v]) => { q = q.eq(k, v); });
    const { data, error } = await q;
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [table]);

  const submit = async () => {
    for (const f of fields) {
      if (f.required && !form[f.key]) { toast({ title: `${f.label} міндетті`, variant: "destructive" }); return; }
    }
    setSaving(true);
    const payload: any = { ...defaults, ...form };
    if (scope === "school" && profile?.school_id && !payload.school_id) payload.school_id = profile.school_id;
    if (user) {
      ["created_by", "uploaded_by", "from_user", "registered_by", "recorded_by"].forEach(k => {
        if (k in payload && payload[k] === undefined) payload[k] = user.id;
        else if (k === "created_by" && !payload[k]) payload[k] = user.id;
      });
    }
    const { error } = await (supabase as any).from(table).insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Сақталды" });
    setForm({}); setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Жоюды растайсыз ба?")) return;
    const { error } = await (supabase as any).from(table).delete().eq("id", id);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    load();
  };

  const renderCell = (v: any) => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "boolean") return v ? "✓" : "—";
    if (typeof v === "object") return JSON.stringify(v).slice(0, 60);
    const s = String(v);
    return s.length > 80 ? s.slice(0, 80) + "…" : s;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Қосу</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Жаңа жазба</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-foreground">{f.label}{f.required && " *"}</label>
                  {f.type === "textarea" ? (
                    <Textarea rows={4} value={form[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  ) : f.type === "boolean" ? (
                    <input type="checkbox" className="ml-2" checked={!!form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.checked })} />
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={form[f.key] || ""}
                      onChange={e => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Болдырмау</Button>
              <Button onClick={submit} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Сақтау</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Жүктелуде...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Жазба жоқ. «Қосу» батырмасын басыңыз.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {cols.map(c => {
                  const f = fields.find(ff => ff.key === c);
                  return <TableHead key={c}>{f?.label || c}</TableHead>;
                })}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  {cols.map(c => <TableCell key={c}>{renderCell(r[c])}</TableCell>)}
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
