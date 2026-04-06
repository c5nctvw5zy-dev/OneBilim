import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, BookOpen, Loader2, Trash2 } from "lucide-react";

export default function BookRegistrationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", author: "", online_link: "" });

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user!.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    setProfileId(prof.id);
    setSchoolId(prof.school_id);
    const { data } = await supabase.from("books").select("*").eq("school_id", prof.school_id).order("created_at", { ascending: false });
    setBooks(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.title || !form.author || !schoolId || !profileId) {
      toast({ title: "Барлық өрістерді толтырыңыз", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("books").insert({
      title: form.title,
      author: form.author,
      online_link: form.online_link || null,
      school_id: schoolId,
      registered_by: profileId,
    });
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Кітап тіркелді!" });
    setShowCreate(false);
    setForm({ title: "", author: "", online_link: "" });
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("books").delete().eq("id", id);
    setBooks(prev => prev.filter(b => b.id !== id));
    toast({ title: "Жойылды" });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Кітапті тіркеу</h2>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Кітап тіркеу</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Жаңа кітап тіркеу</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Кітаптың аты</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Кітап атын жазыңыз" />
              </div>
              <div className="space-y-2">
                <Label>Кітаптың авторы</Label>
                <Input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} placeholder="Автор аты-жөні" />
              </div>
              <div className="space-y-2">
                <Label>Онлайн сілтемесі (міндетті емес)</Label>
                <Input value={form.online_link} onChange={e => setForm(p => ({ ...p, online_link: e.target.value }))} placeholder="https://..." />
              </div>
              <Button className="w-full" onClick={handleCreate}>Тіркеу</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {books.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><BookOpen className="mx-auto h-12 w-12 mb-4" />Тіркелген кітаптар жоқ</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {books.map((b, i) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {b.online_link && (
                  <a href={b.online_link} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Онлайн</a>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
