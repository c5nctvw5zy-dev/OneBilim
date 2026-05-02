import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  created_at: string;
}

/**
 * Listens for new announcements addressed to the current user and shows them
 * as a modal. Once closed it is marked as read and won't show again.
 */
export default function AnnouncementCenter() {
  const [current, setCurrent] = useState<Announcement | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchUnread = async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;
      const { data: anns } = await supabase
        .from("announcements")
        .select("id, title, body, audience, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (!anns || anns.length === 0) return;
      const { data: reads } = await supabase
        .from("announcement_reads")
        .select("announcement_id")
        .eq("user_id", userRes.user.id);
      const readIds = new Set((reads || []).map((r: any) => r.announcement_id));
      const unread = anns.find((a: any) => !readIds.has(a.id));
      if (unread && mounted) setCurrent(unread as Announcement);
    };

    fetchUnread();

    const channel = supabase
      .channel("announcements-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "announcements" },
        () => fetchUnread(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const close = async () => {
    if (!current) return;
    const { data: userRes } = await supabase.auth.getUser();
    if (userRes.user) {
      await supabase.from("announcement_reads").insert({
        announcement_id: current.id,
        user_id: userRes.user.id,
      });
    }
    setCurrent(null);
  };

  if (!current) return null;

  return (
    <Dialog open onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{current.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-foreground whitespace-pre-wrap text-center">{current.body}</p>
        <p className="text-xs text-muted-foreground text-center">
          {new Date(current.created_at).toLocaleString("kk-KZ")}
        </p>
        <DialogFooter>
          <Button onClick={close} className="w-full">Хабарландыруды жабу</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
