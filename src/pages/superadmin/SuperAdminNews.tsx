import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface News {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  published: boolean;
  created_at: string;
}

export default function SuperAdminNews() {
  const { toast } = useToast();
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<News | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", image_url: "", published: true });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    setItems((data as News[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", excerpt: "", content: "", image_url: "", published: true });
    setShowForm(true);
  };

  const openEdit = (n: News) => {
    setEditing(n);
    setForm({
      title: n.title,
      excerpt: n.excerpt || "",
      content: n.content || "",
      image_url: n.image_url || "",
      published: n.published,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "Тақырыпты енгізіңіз", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      image_url: form.image_url.trim() || null,
      published: form.published,
      created_by: userRes.user?.id,
    };
    const { error } = editing
      ? await supabase.from("news").update(payload).eq("id", editing.id)
      : await supabase.from("news").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Жаңалық жаңартылды" : "Жаңалық қосылды" });
    setShowForm(false);
    load();
  };

  const togglePublish = async (n: News) => {
    await supabase.from("news").update({ published: !n.published }).eq("id", n.id);
    load();
  };

  const remove = async (n: News) => {
    if (!confirm(`«${n.title}» жаңалығын жою керек пе?`)) return;
    const { error } = await supabase.from("news").delete().eq("id", n.id);
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    else { toast({ title: "Жойылды" }); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" /> Жаңалықтар
        </h2>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Жаңалық қосу</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Әзірше жаңалықтар жоқ</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => (
            <div key={n.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
              {n.image_url && (
                <img src={n.image_url} alt={n.title} className="h-40 w-full object-cover" />
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-card-foreground line-clamp-2">{n.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${n.published ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {n.published ? "Жарияланған" : "Жасырын"}
                  </span>
                </div>
                {n.excerpt && <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{n.excerpt}</p>}
                <p className="text-xs text-muted-foreground mt-auto mb-3">{new Date(n.created_at).toLocaleDateString("kk-KZ")}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(n)} className="gap-1 flex-1"><Edit className="h-3 w-3" /> Өзгерту</Button>
                  <Button variant="outline" size="sm" onClick={() => togglePublish(n)} className="gap-1">
                    {n.published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => remove(n)} className="gap-1 text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Жаңалықты өзгерту" : "Жаңа жаңалық"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Тақырып *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Жаңалық тақырыбы" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Қысқаша</label>
              <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Қысқаша сипаттама" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Толық мәтін</label>
              <Textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Жаңалықтың толық мазмұны" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Сурет URL</label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Жарияланған
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Болдырмау</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Сақтау
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
