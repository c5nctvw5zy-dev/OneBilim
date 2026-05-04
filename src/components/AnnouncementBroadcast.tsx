import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  scope: "system" | "school";
  schoolId?: string | null;
  trigger?: React.ReactNode;
  audiences?: { value: string; label: string }[];
}

const defaultAudiences = [
  { value: "all", label: "Барлығы" },
  { value: "students", label: "Оқушылар" },
  { value: "teachers", label: "Мұғалімдер" },
  { value: "parents", label: "Ата-аналар" },
];

export default function AnnouncementBroadcast({ scope, schoolId, trigger, audiences = defaultAudiences }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Тақырып пен мәтінді енгізіңіз", variant: "destructive" });
      return;
    }
    setSending(true);
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      setSending(false);
      toast({ title: "Алдымен жүйеге кіріңіз", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("announcements").insert({
      title: title.trim(),
      body: body.trim(),
      audience,
      school_id: scope === "system" ? null : schoolId ?? null,
      created_by: userRes.user.id,
    });
    setSending(false);
    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Хабарландыру жіберілді" });
    setTitle(""); setBody(""); setAudience("all");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="w-full justify-start gap-2">
            <Megaphone className="h-4 w-4" /> Хабарландыру жазу
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {scope === "system" ? "Жүйелік хабарландыру" : "Мектеп хабарландыруы"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground">Тақырып</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Тақырып" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Мәтін</label>
            <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Хабарландыру мәтіні" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Кімге</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {audiences.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>Болдырмау</Button>
          <Button onClick={send} disabled={sending}>
            {sending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Жіберу
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
