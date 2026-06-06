import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, Send, Bot, User as UserIcon, Trash2, CalendarRange } from "lucide-react";
import BilimLoader, { BilimSpinner } from "@/components/BilimLoader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const ADMIN_PROMPTS = [
  { icon: "📊", label: "Үлгерім талдауы", prompt: "Соңғы тоқсандағы оқушылар үлгерімінің жалпы талдауын жасап, проблемалы тұстарды атап, 5 нақты ұсыныс беріңіз." },
  { icon: "📝", label: "Бұйрық жобасы", prompt: "Тоқсандық қорытынды бойынша оқушыларды марапаттау туралы бұйрық жобасын дайындаңыз. Қазақша, ресми стиль." },
  { icon: "✉️", label: "Хабарландыру", prompt: "Ата-аналар жиналысы туралы қысқа әрі сыпайы хабарландыру жазыңыз." },
  { icon: "🧠", label: "Әдістемелік кеңес", prompt: "Үлгерімі төмен 8-сынып оқушыларымен жұмыс істеудің 7 тиімді тәсілін ұсыныңыз." },
  { icon: "📅", label: "Тоқсандық жоспар", prompt: "ІІ тоқсанға арналған оқу-тәрбие жұмысының ықшам жоспарын жасаңыз." },
  { icon: "📈", label: "Есеп жобасы", prompt: "Жыл басынан бергі мектептің оқу-тәрбие жұмысы туралы директор есебіне арналған құрылым ұсыныңыз." },
];

const TEACHER_PROMPTS = [
  { icon: "🧠", label: "Сабақ жоспары / Жылдық жоспар", prompt: "Менің пәнім бойынша осы тақырыпқа қысқа мерзімді сабақ жоспарын (немесе ұзақ мерзімді жылдық жоспарды) жасап беріңіз. Мақсат, дағдылар, рефлексия, бағалау критерийлерін қосыңыз." },
  { icon: "🧑‍🎓", label: "Оқушыға авто мінездеме", prompt: "Менің сыныбымдағы оқушыға мінездеме жазып беріңіз: үлгерімі, тәртібі, белсенділігі, сильные/слабые жақтары, ұсыныс." },
  { icon: "📊", label: "Үлгерім анализі (өз сыныбы)", prompt: "Менің сыныбымның үлгерімін талдаңыз: үздіктер, артта қалғандар, орташа балл, динамика, нақты ұсыныстар." },
  { icon: "🤖", label: "Ақылды көмекші (Chat AI)", prompt: "Маған сабаққа дайындалуға, ата-анамен сөйлесуге, оқушыны ынталандыруға кеңес беріңіз." },
  { icon: "📽", label: "Презентация генерациялау", prompt: "Тақырып: [мысалы, «Алгоритмдер»]. Осы тақырып бойынша 8-10 слайдтан тұратын презентация құрылымын (әр слайдтың мазмұнымен) дайындаңыз." },
  { icon: "🔬", label: "Онлайн зертхана 8D/3D/2D", prompt: "Тақырып: [мысалы, «Молекулалар»]. Осы тақырыпқа сай 8D/3D/2D онлайн зертхана идеяларын, қолжетімді сілтемелер мен қадамдық тапсырмаларды ұсыныңыз." },
  { icon: "📃", label: "Тест жасау", prompt: "Тақырып: [мысалы, «Квадрат теңдеулер»]. Осы тақырып бойынша 10 сұрақтан тұратын тест жасап беріңіз: А/В/С/D нұсқалары, дұрыс жауаптары." },
];

interface Props {
  context?: Record<string, any>;
  variant?: "admin" | "teacher";
}

export default function AIAssistant({ context, variant = "admin" }: Props) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [schedOpen, setSchedOpen] = useState(false);
  const [schedClass, setSchedClass] = useState("");
  const [schedReq, setSchedReq] = useState("");
  const [schedLoading, setSchedLoading] = useState(false);

  const prompts = variant === "teacher" ? TEACHER_PROMPTS : ADMIN_PROMPTS;

  const generateSchedule = async () => {
    if (!schedClass.trim()) { toast({ title: "Сыныпты енгізіңіз", variant: "destructive" }); return; }
    setSchedLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate-schedule`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ class_name: schedClass.trim(), requirements: schedReq.trim() }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Қате");
      const summary = `✅ **${json.class_name}** үшін кесте жасалды (${json.inserted}/${json.total} сабақ).\n\n«Сабақ кестесі» бөліміне өтіп қараңыз. Қажет болса көшіру / қою / жою арқылы өңдеңіз.`;
      setMessages(prev => [...prev, { role: "user", content: `🗓️ Авто кесте: ${schedClass}${schedReq ? " — " + schedReq : ""}` }, { role: "assistant", content: summary }]);
      setSchedOpen(false); setSchedClass(""); setSchedReq("");
      toast({ title: "Кесте дайын!", description: `${json.inserted} сабақ` });
    } catch (e: any) {
      toast({ title: "Қате", description: e.message, variant: "destructive" });
    } finally { setSchedLoading(false); }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-admin-assistant`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: next, context }),
        signal: controller.signal,
      });

      if (resp.status === 429) { toast({ title: "Тым көп сұраныс", variant: "destructive" }); setLoading(false); return; }
      if (resp.status === 402) { toast({ title: "Несие таусылды", variant: "destructive" }); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("AI қызметі қолжетімсіз");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":") || !line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) { acc += c; setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: acc } : m)); }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") toast({ title: "Қате", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <Card className="flex flex-col h-[640px] overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-primary/5 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/15 p-2"><Sparkles className="h-5 w-5 text-primary" /></div>
          <div>
            <h3 className="font-semibold text-foreground">ЖИ көмекші</h3>
            <p className="text-xs text-muted-foreground">{variant === "teacher" ? "Жоспар · Мінездеме · Талдау · Тест" : "Талдау · Бұйрық · Кеңес · Жоспар"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {variant === "admin" && (
            <Button variant="outline" size="sm" onClick={() => setSchedOpen(true)} className="gap-1">
              <CalendarRange className="h-4 w-4" /> Авто кесте
            </Button>
          )}
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="gap-1">
              <Trash2 className="h-4 w-4" /> Тазарту
            </Button>
          )}
        </div>
      </div>

      <Dialog open={schedOpen} onOpenChange={setSchedOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarRange className="h-5 w-5 text-primary" /> Авто кесте жасау</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Сынып *</label>
              <Input placeholder="мысалы: 7Г" value={schedClass} onChange={e => setSchedClass(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Талаптар</label>
              <Textarea rows={5} placeholder="мысалы: Дене шынықтыру аптасына 3 рет..." value={schedReq} onChange={e => setSchedReq(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Кесте автоматты «Сабақ кестесі» бөліміне сақталады.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchedOpen(false)} disabled={schedLoading}>Болдырмау</Button>
            <Button onClick={generateSchedule} disabled={schedLoading} className="gap-2">
              {schedLoading ? <BilimSpinner /> : <Sparkles className="h-4 w-4" />}
              Кестені жасау
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground py-4">
              {variant === "teacher" ? "Мұғалімге арналған блоктар:" : "Сұрақ қойыңыз немесе төмендегі дайын тапсырмалардан таңдаңыз"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {prompts.map(q => (
                <button key={q.label} onClick={() => send(q.prompt)} className="text-left rounded-xl border border-border bg-card p-3 hover:bg-accent transition-colors">
                  <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                    <span>{q.icon}</span> {q.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{q.prompt}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {m.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:mt-2 [&_h3]:mb-1">
                    <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center"><Bot className="h-4 w-4" /></div>
            <div className="bg-muted rounded-2xl px-4 py-2.5"><Loader2 className="h-4 w-4 animate-spin" /></div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Сұрағыңызды жазыңыз..."
            className="min-h-[44px] max-h-[120px] resize-none"
            disabled={loading}
          />
          <Button onClick={() => send(input)} disabled={loading || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
