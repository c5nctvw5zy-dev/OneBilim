import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export type CrudField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "date" | "number" | "boolean" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
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
  const [editing, setEditing] = useState<any | null>(null);
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

  const openCreate = () => { setEditing(null); setForm({}); setOpen(true); };
  const openEdit = (row: any) => {
    setEditing(row);
    const f: Record<string, any> = {};
    fields.forEach(fd => { f[fd.key] = row[fd.key] ?? ""; });
    setForm(f); setOpen(true);
  };

  const submit = async () => {
    for (const f of fields) {
      if (f.required && !form[f.key]) { toast({ title: `${f.label} міндетті`, variant: "destructive" }); return; }
    }
    setSaving(true);
    if (editing) {
      const payload: any = {};
      fields.forEach(fd => { payload[fd.key] = form[fd.key] === "" ? null : form[fd.key]; });
      const { error } = await (supabase as any).from(table).update(payload).eq("id", editing.id);
      setSaving(false);
      if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Жаңартылды" });
    } else {
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
    }
    setForm({}); setEditing(null); setOpen(false); load();
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
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({}); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Қосу</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Өзгерту" : "Жаңа жазба"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-foreground">{f.label}{f.required && " *"}</label>
                  {f.type === "textarea" ? (
                    <Textarea rows={4} value={form[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  ) : f.type === "boolean" ? (
                    <input type="checkbox" className="ml-2" checked={!!form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.checked })} />
                  ) : f.type === "select" ? (
                    <Select value={form[f.key] || ""} onValueChange={(v) => setForm({ ...form, [f.key]: v })}>
                      <SelectTrigger><SelectValue placeholder="Таңдаңыз" /></SelectTrigger>
                      <SelectContent>
                        {f.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                <TableHead className="w-24 text-right">Әрекет</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id} className="group">
                  {cols.map(c => <TableCell key={c}>{renderCell(r[c])}</TableCell>)}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)} title="Өзгерту">
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(r.id)} title="Жою">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
