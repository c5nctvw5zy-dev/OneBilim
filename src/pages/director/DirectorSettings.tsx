import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, CalendarDays, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DirectorSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [schoolName, setSchoolName] = useState("№1 Мектеп-лицей");
  const [email, setEmail] = useState("info@school1.kz");
  const [phone, setPhone] = useState("+7 727 123 4567");
  const [address, setAddress] = useState("Алматы қ., Абай д-лы, 45");
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [showHoliday, setShowHoliday] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ title: "", start_date: "", end_date: "", type: "holiday" });

  useEffect(() => { if (user) loadHolidays(); }, [user]);

  const loadHolidays = async () => {
    const { data: prof } = await supabase.from("profiles").select("school_id").eq("user_id", user!.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    setSchoolId(prof.school_id);
    const { data } = await supabase.from("holidays").select("*").eq("school_id", prof.school_id).order("start_date");
    setHolidays(data || []);
    setLoading(false);
  };

  const handleSave = () => {
    toast({ title: "Сақталды!", description: "Мектеп ақпараты сәтті жаңартылды." });
  };

  const addHoliday = async () => {
    if (!holidayForm.title || !holidayForm.start_date || !holidayForm.end_date || !schoolId) {
      toast({ title: "Барлық өрістерді толтырыңыз", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("holidays").insert({
      school_id: schoolId,
      title: holidayForm.title,
      start_date: holidayForm.start_date,
      end_date: holidayForm.end_date,
      type: holidayForm.type,
    });
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Қосылды!" });
    setShowHoliday(false);
    setHolidayForm({ title: "", start_date: "", end_date: "", type: "holiday" });
    loadHolidays();
  };

  const deleteHoliday = async (id: string) => {
    await supabase.from("holidays").delete().eq("id", id);
    setHolidays(prev => prev.filter(h => h.id !== id));
    toast({ title: "Жойылды" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Баптаулар</h2>
      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Мектеп ақпараты</h3>
          <div className="space-y-2"><Label>Мектеп атауы</Label><Input value={schoolName} onChange={e => setSchoolName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label>Телефон</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div className="space-y-2"><Label>Мекен-жай</Label><Input value={address} onChange={e => setAddress(e.target.value)} /></div>
          <Button onClick={handleSave}>Сақтау</Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Оқу жылы</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Басталуы</Label><Input type="date" defaultValue="2025-09-01" /></div>
            <div className="space-y-2"><Label>Аяқталуы</Label><Input type="date" defaultValue="2026-05-25" /></div>
          </div>
          <Button onClick={() => toast({ title: "Жаңартылды!" })}>Жаңарту</Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Мереке және демалыс күндері</h3>
            <Dialog open={showHoliday} onOpenChange={setShowHoliday}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Қосу</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Мереке / Демалыс күнін қосу</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Атауы</Label>
                    <Input value={holidayForm.title} onChange={e => setHolidayForm(p => ({ ...p, title: e.target.value }))} placeholder="Мысалы: Наурыз мейрамы" />
                  </div>
                  <div className="space-y-2">
                    <Label>Түрі</Label>
                    <Select value={holidayForm.type} onValueChange={v => setHolidayForm(p => ({ ...p, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="holiday">Мереке күні</SelectItem>
                        <SelectItem value="weekend">Демалыс күні</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Басталуы</Label><Input type="date" value={holidayForm.start_date} onChange={e => setHolidayForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Аяқталуы</Label><Input type="date" value={holidayForm.end_date} onChange={e => setHolidayForm(p => ({ ...p, end_date: e.target.value }))} /></div>
                  </div>
                  <Button className="w-full" onClick={addHoliday}>Қосу</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : holidays.length === 0 ? (
            <p className="text-sm text-muted-foreground">Мереке/демалыс күндері орнатылмаған</p>
          ) : (
            <div className="space-y-2">
              {holidays.map(h => (
                <div key={h.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{h.start_date} — {h.end_date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={h.type === "holiday" ? "default" : "secondary"}>{h.type === "holiday" ? "Мереке" : "Демалыс"}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => deleteHoliday(h.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
