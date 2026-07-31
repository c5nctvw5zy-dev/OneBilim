import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import i18n from "@/i18n";

interface Contact {
  id: string;
  user_id: string;
  full_name: string;
  roles: string[];
}

interface Msg {
  id: string;
  from_user: string;
  to_user: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

const T = {
  kk: { contacts: "Байланыстар", search: "Іздеу...", pick: "Әңгімелесушіні таңдаңыз", placeholder: "Хабарлама жазыңыз...", empty: "Хабарламалар жоқ", noUsers: "Пайдаланушылар табылмады", err: "Қате" },
  ru: { contacts: "Контакты", search: "Поиск...", pick: "Выберите собеседника", placeholder: "Напишите сообщение...", empty: "Сообщений нет", noUsers: "Пользователи не найдены", err: "Ошибка" },
  en: { contacts: "Contacts", search: "Search...", pick: "Select a contact", placeholder: "Write a message...", empty: "No messages", noUsers: "No users found", err: "Error" },
};

const ROLE_LABEL: Record<string, string> = {
  director: "Директор", zavuch: "Завуч", teacher: "Мұғалім", student: "Оқушы", parent: "Ата-ана",
  librarian: "Кітапханашы", psychologist: "Психолог", social_pedagogue: "Әлеуметтік педагог",
  speech_therapist: "Логопед", nurse: "Медбике", hr: "HR", secretary: "Хатшы", super_admin: "Супер админ",
};

export default function ChatPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const lang = (i18n.language || "kk").slice(0, 2);
  const t = T[lang as keyof typeof T] || T.kk;

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [active, setActive] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !profile?.school_id) { setLoading(false); return; }
    (async () => {
      const [{ data: profs }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id, user_id, full_name").eq("school_id", profile.school_id),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const roleMap = new Map<string, string[]>();
      (roles || []).forEach((r: any) => {
        roleMap.set(r.user_id, [...(roleMap.get(r.user_id) || []), r.role]);
      });
      setContacts(
        (profs || [])
          .filter((p: any) => p.user_id !== user.id)
          .map((p: any) => ({ id: p.id, user_id: p.user_id, full_name: p.full_name, roles: roleMap.get(p.user_id) || [] }))
          .sort((a, b) => a.full_name.localeCompare(b.full_name))
      );
      setLoading(false);
    })();
  }, [user, profile?.school_id]);

  const loadMessages = async (peer: Contact) => {
    if (!user) return;
    const { data, error } = await (supabase as any)
      .from("direct_messages")
      .select("id, from_user, to_user, body, created_at, read_at")
      .or(`and(from_user.eq.${user.id},to_user.eq.${peer.user_id}),and(from_user.eq.${peer.user_id},to_user.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) { toast({ title: t.err, description: error.message, variant: "destructive" }); return; }
    setMessages((data as Msg[]) || []);
    const unread = (data || []).filter((m: Msg) => m.to_user === user.id && !m.read_at).map((m: Msg) => m.id);
    if (unread.length) await (supabase as any).from("direct_messages").update({ read_at: new Date().toISOString() }).in("id", unread);
  };

  useEffect(() => { if (active) loadMessages(active); }, [active?.user_id]);

  // Realtime for new messages addressed to me
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("dm-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        const m = payload.new as Msg;
        const peerId = active?.user_id;
        const relevant = peerId && ((m.from_user === peerId && m.to_user === user.id) || (m.from_user === user.id && m.to_user === peerId));
        if (relevant) setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, active?.user_id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
  useEffect(() => { inputRef.current?.focus(); }, [active?.user_id, sending]);

  const send = async () => {
    if (!text.trim() || !active || !user) return;
    setSending(true);
    const body = text.trim();
    setText("");
    const { data, error } = await (supabase as any).from("direct_messages").insert({
      from_user: user.id, to_user: active.user_id, body, school_id: profile?.school_id ?? null,
    }).select("id, from_user, to_user, body, created_at, read_at").single();
    setSending(false);
    if (error) { toast({ title: t.err, description: error.message, variant: "destructive" }); setText(body); return; }
    setMessages((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data as Msg]));
  };

  const filtered = useMemo(
    () => contacts.filter((c) => !search || c.full_name.toLowerCase().includes(search.toLowerCase())),
    [contacts, search]
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr] h-[calc(100vh-160px)]">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t.contacts}</CardTitle>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto space-y-1">
          {filtered.map((c) => (
            <button
              key={c.user_id}
              onClick={() => setActive(c)}
              className={`w-full flex items-center gap-2 rounded-lg p-2 text-left text-sm transition-colors ${active?.user_id === c.user_id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {c.full_name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-foreground">{c.full_name}</div>
                <div className="truncate text-[11px] text-muted-foreground">{c.roles.map((r) => ROLE_LABEL[r] || r).join(", ")}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">{t.noUsers}</p>}
        </CardContent>
      </Card>

      <Card className="flex flex-col overflow-hidden">
        {active ? (
          <>
            <CardHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{active.full_name}</CardTitle>
                <Badge variant="outline" className="text-xs">{active.roles.map((r) => ROLE_LABEL[r] || r).join(", ")}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {messages.map((m) => {
                  const mine = m.from_user === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleString(lang === "kk" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">{t.empty}</p>}
                <div ref={bottomRef} />
              </div>
            </CardContent>
            <div className="border-t border-border p-3 flex gap-2">
              <Input
                ref={inputRef}
                placeholder={t.placeholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                className="flex-1"
              />
              <Button size="icon" onClick={send} disabled={sending || !text.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">{t.pick}</div>
        )}
      </Card>
    </div>
  );
}
