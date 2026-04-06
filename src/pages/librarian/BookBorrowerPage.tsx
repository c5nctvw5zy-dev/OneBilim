import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2, CheckCircle } from "lucide-react";

export default function BookBorrowerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [borrowers, setBorrowers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [form, setForm] = useState({ book_id: "", borrower_name: "", borrow_start: "", borrow_end: "" });

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user!.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    setProfileId(prof.id);
    setSchoolId(prof.school_id);
    const [{ data: bData }, { data: bkData }] = await Promise.all([
      supabase.from("book_borrowers").select("*, books(title, author)").eq("school_id", prof.school_id).order("created_at", { ascending: false }),
      supabase.from("books").select("id, title").eq("school_id", prof.school_id),
    ]);
    setBorrowers(bData || []);
    setBooks(bkData || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.book_id || !form.borrower_name || !form.borrow_start || !form.borrow_end || !schoolId || !profileId) {
      toast({ title: "Барлық өрістерді толтырыңыз", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("book_borrowers").insert({
      book_id: form.book_id,
      borrower_name: form.borrower_name,
      borrow_start: form.borrow_start,
      borrow_end: form.borrow_end,
      school_id: schoolId,
      registered_by: profileId,
    });
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Тіркелді!" });
    setShowCreate(false);
    setForm({ book_id: "", borrower_name: "", borrow_start: "", borrow_end: "" });
    loadData();
  };

  const markReturned = async (id: string) => {
    await supabase.from("book_borrowers").update({ returned: true }).eq("id", id);
    setBorrowers(prev => prev.map(b => b.id === id ? { ...b, returned: true } : b));
    toast({ title: "Қайтарылды деп белгіленді" });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Кітап алушыны тіркеу</h2>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Кітап алушыны тіркеу</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Кітап алушыны тіркеу</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Кітап</Label>
                <Select value={form.book_id} onValueChange={v => setForm(p => ({ ...p, book_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Кітапты таңдаңыз" /></SelectTrigger>
                  <SelectContent>{books.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Кітап алушының аты-жөні</Label>
                <Input value={form.borrower_name} onChange={e => setForm(p => ({ ...p, borrower_name: e.target.value }))} placeholder="Аты-жөні" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Алу мерзімі</Label>
                  <Input type="date" value={form.borrow_start} onChange={e => setForm(p => ({ ...p, borrow_start: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Қайтару мерзімі</Label>
                  <Input type="date" value={form.borrow_end} onChange={e => setForm(p => ({ ...p, borrow_end: e.target.value }))} />
                </div>
              </div>
              <Button className="w-full" onClick={handleCreate}>Тіркеу</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {borrowers.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Тіркелген алушылар жоқ</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {borrowers.map(b => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
              <div>
                <p className="text-sm font-medium text-foreground">{b.borrower_name}</p>
                <p className="text-xs text-muted-foreground">{(b as any).books?.title} · {b.borrow_start} — {b.borrow_end}</p>
              </div>
              <div className="flex items-center gap-2">
                {b.returned ? (
                  <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> Қайтарылды</Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => markReturned(b.id)}>Қайтарылды</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
