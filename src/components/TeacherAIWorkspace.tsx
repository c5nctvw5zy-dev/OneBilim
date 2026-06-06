import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Download, Sparkles, FileText, Presentation, ListChecks, UserCog, Image as ImageIcon, FlaskConical, BarChart3 } from "lucide-react";
import BilimLoader, { BilimSpinner } from "@/components/BilimLoader";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type BlockKey = "plan" | "presentation" | "tasks" | "personal" | "visuals" | "lab" | "analysis";

interface Block {
  key: BlockKey;
  icon: any;
  title: string;
  subtitle: string;
  brand: string;
  color: string;
  fields: { name: string; label: string; placeholder: string; multiline?: boolean }[];
  buildPrompt: (v: Record<string, string>) => string;
}

const BLOCKS: Block[] = [
  {
    key: "plan",
    icon: FileText,
    title: "Сабақ / Жылдық жоспар",
    subtitle: "Тақырып немесе кітап бойынша автоматты жоспар",
    brand: "ChatGPT-style",
    color: "from-blue-500/20 to-cyan-500/10",
    fields: [
      { name: "subject", label: "Пән", placeholder: "Математика" },
      { name: "grade", label: "Сынып", placeholder: "7" },
      { name: "topic", label: "Тақырып / Кітап", placeholder: "Алгебра, 1-тарау" },
      { name: "type", label: "Жоспар түрі (қысқа/ұзақ/жылдық)", placeholder: "қысқа мерзімді" },
      { name: "notes", label: "Қосымша талаптар", placeholder: "СТО, бағалау критерийлерін қос", multiline: true },
    ],
    buildPrompt: (v) =>
      `Қазақ тіліндегі ${v.type || "қысқа мерзімді"} сабақ жоспары:
Пән: ${v.subject}
Сынып: ${v.grade}
Тақырып/Кітап: ${v.topic}
Қосымша: ${v.notes || "—"}

Құрылым: Мақсат · Күтілетін нәтиже · Дағдылар · Уақыт кестесі (5/10/20/5 мин) · Ресурстар · Бағалау критерийлері · Рефлексия · Үй тапсырмасы. Маркдаунмен ресімде, кестелер қолдан.`,
  },
  {
    key: "presentation",
    icon: Presentation,
    title: "Презентация генерациялау",
    subtitle: "Тақырып + слайд саны → толық сценарий + дизайн",
    brand: "PowerPoint 2026",
    color: "from-orange-500/20 to-red-500/10",
    fields: [
      { name: "topic", label: "Тақырып", placeholder: "Алгоритмдер" },
      { name: "slides", label: "Слайд саны", placeholder: "10" },
      { name: "style", label: "Стиль", placeholder: "Минималистік, көк түс" },
      { name: "audience", label: "Аудитория", placeholder: "7-сынып оқушылары" },
    ],
    buildPrompt: (v) =>
      `«${v.topic}» тақырыбы бойынша ${v.slides || "10"} слайдтан тұратын презентация сценарийін жаса.
Аудитория: ${v.audience || "оқушылар"}. Стиль: ${v.style || "заманауи"}.

Әр слайдқа: 
- № және тақырыбы
- Негізгі мәтін (3-5 пункт)
- Сурет идеясы (қандай сурет / иллюстрация керек)
- Анимация ұсынысы (қандай эффект)
- Дикторлық дауыс мәтіні (1-2 сөйлем)

Соңында дизайн палитрасы (3 түс HEX) мен шрифт ұсыныстарын бер. Маркдаунмен.`,
  },
  {
    key: "tasks",
    icon: ListChecks,
    title: "Тапсырмалар құрастыру",
    subtitle: "Тесттер · бақылау · викторина · деңгейлік",
    brand: "Wordwall-style",
    color: "from-green-500/20 to-emerald-500/10",
    fields: [
      { name: "topic", label: "Тақырып", placeholder: "Квадрат теңдеулер" },
      { name: "kind", label: "Тапсырма түрі", placeholder: "тест / викторина / БЖБ" },
      { name: "count", label: "Сұрақ саны", placeholder: "10" },
      { name: "levels", label: "Деңгейлер", placeholder: "оңай · орташа · қиын" },
    ],
    buildPrompt: (v) =>
      `«${v.topic}» бойынша ${v.kind || "тест"} жасап бер. Сұрақ саны: ${v.count || "10"}. Деңгейлері: ${v.levels || "оңай, орташа, қиын"}.
Әр сұраққа: нөмір, сұрақ мәтіні, 4 жауап (А/В/С/D), дұрыс жауап, түсіндірме, деңгей белгісі. Соңында жауап кілті кестесі. Маркдаунмен.`,
  },
  {
    key: "personal",
    icon: UserCog,
    title: "Жеке оқыту",
    subtitle: "Әр оқушының деңгейіне сай тапсырмалар",
    brand: "Wordwall-style",
    color: "from-purple-500/20 to-pink-500/10",
    fields: [
      { name: "student", label: "Оқушы аты", placeholder: "Айдана А." },
      { name: "level", label: "Деңгейі", placeholder: "орташа / артта / озат" },
      { name: "topic", label: "Тақырып", placeholder: "Бөлшектер" },
      { name: "weakness", label: "Қиналатын тұстары", placeholder: "көбейту, аралас сандар", multiline: true },
    ],
    buildPrompt: (v) =>
      `Оқушы: ${v.student}. Деңгейі: ${v.level}. Тақырып: ${v.topic}.
Қиналатын тұстары: ${v.weakness || "—"}.

Осы оқушыға арналған 8 жеке тапсырма жаса (қарапайымнан күрделіге қарай), әрқайсысына: мақсат, тапсырма, ишара (hint), жауап. Соңында оқушыға қысқа мотивациялық жазба қос. Маркдаунмен.`,
  },
  {
    key: "visuals",
    icon: ImageIcon,
    title: "Көрнекіліктер генерациялау",
    subtitle: "Оқу материалдары · схема · инфографика",
    brand: "Visual AI",
    color: "from-yellow-500/20 to-orange-500/10",
    fields: [
      { name: "topic", label: "Тақырып", placeholder: "Күн жүйесі" },
      { name: "format", label: "Формат", placeholder: "инфографика / схема / постер" },
      { name: "details", label: "Қандай элементтер керек", placeholder: "8 планета, өлшемдері, қашықтығы", multiline: true },
    ],
    buildPrompt: (v) =>
      `«${v.topic}» тақырыбына ${v.format || "көрнекілік"} жасауға арналған толық сипаттама бер.
Қажет элементтер: ${v.details || "—"}.

Шығар: 
1. Көрнекіліктің құрылымы (қандай блоктар, қалай орналасады)
2. Әр блоктың мәтіні мен сандық деректері
3. Түс схемасы (HEX)
4. Иконкалар мен суреттер тізімі
5. Қысқа түсіндірме мұғалімге

Маркдаунмен.`,
  },
  {
    key: "lab",
    icon: FlaskConical,
    title: "Онлайн зертхана",
    subtitle: "8D / 3D / 2D форматтағы пішіндеу",
    brand: "Lab Simulator",
    color: "from-cyan-500/20 to-blue-500/10",
    fields: [
      { name: "topic", label: "Тақырып", placeholder: "Молекулалар құрылысы" },
      { name: "subject", label: "Пән", placeholder: "Химия" },
      { name: "format", label: "Формат (8D/3D/2D)", placeholder: "3D" },
    ],
    buildPrompt: (v) =>
      `«${v.topic}» (${v.subject}) бойынша ${v.format || "3D"} онлайн зертхана сценарийін жаса.

Кіреді:
1. Қысқа теориялық кіріспе
2. Зертхана құралдары мен модельдері тізімі
3. Қадамдық эксперимент жоспары (5-8 қадам)
4. Қауіпсіздік ережелері
5. Күтілетін нәтижелер
6. Қолжетімді онлайн платформалар сілтемелері (PhET, Labster, Mozaik және т.б.)
7. Бағалау критерийлері

Маркдаунмен.`,
  },
  {
    key: "analysis",
    icon: BarChart3,
    title: "Үлгерім анализі (өз сыныбы)",
    subtitle: "Талдау + бағыт-бағдар",
    brand: "Analytics AI",
    color: "from-rose-500/20 to-pink-500/10",
    fields: [
      { name: "class", label: "Сынып", placeholder: "7Г" },
      { name: "subject", label: "Пән", placeholder: "Математика" },
      { name: "data", label: "Үлгерім деректері", placeholder: "Орташа балл: 7.2, үздіктер: 5, артта: 3...", multiline: true },
    ],
    buildPrompt: (v) =>
      `${v.class} сыныбы, ${v.subject} пәні бойынша үлгерім талдауын жаса.
Берілген деректер: ${v.data || "—"}.

Қамт: 
1. Жалпы көрсеткіш (динамика, орташа)
2. Үздік / орта / артта қалған топтар
3. Себептер мен болжамдар
4. Әр топқа нақты ұсыныстар (7-10 пункт)
5. Келесі тоқсанға арналған әрекет жоспары
6. Ата-аналармен жұмыс ұсыныстары

Маркдаунмен, кестелер пайдалан.`,
  },
];

export default function TeacherAIWorkspace({ context }: { context?: Record<string, any> }) {
  const { toast } = useToast();
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const openBlock = (b: Block) => {
    setActiveBlock(b);
    setValues({});
    setResult("");
  };

  const generate = async () => {
    if (!activeBlock) return;
    setLoading(true);
    setResult("");
    try {
      const prompt = activeBlock.buildPrompt(values);
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-admin-assistant`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], context }),
      });
      if (resp.status === 429) { toast({ title: "Тым көп сұраныс", variant: "destructive" }); setLoading(false); return; }
      if (resp.status === 402) { toast({ title: "Несие таусылды", variant: "destructive" }); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("AI қызметі қолжетімсіз");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", acc = "";
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
            if (c) { acc += c; setResult(acc); }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e: any) {
      toast({ title: "Қате", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result || !activeBlock) return;
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeBlock.title.replace(/\s+/g, "_")}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BLOCKS.map((b) => {
          const Icon = b.icon;
          return (
            <Card
              key={b.key}
              onClick={() => openBlock(b)}
              className={`cursor-pointer p-5 hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-br ${b.color}`}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-background/80 backdrop-blur p-3 shadow-sm">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{b.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{b.subtitle}</p>
                  <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-background/60 text-foreground/70">
                    {b.brand}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!activeBlock} onOpenChange={(o) => !o && setActiveBlock(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {activeBlock && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <activeBlock.icon className="h-5 w-5 text-primary" />
                  {activeBlock.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {activeBlock.fields.map((f) => (
                  <div key={f.name}>
                    <label className="text-sm font-medium text-foreground">{f.label}</label>
                    {f.multiline ? (
                      <Textarea
                        rows={3}
                        placeholder={f.placeholder}
                        value={values[f.name] || ""}
                        onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                      />
                    ) : (
                      <Input
                        placeholder={f.placeholder}
                        value={values[f.name] || ""}
                        onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                      />
                    )}
                  </div>
                ))}

                {loading && !result && (
                  <div className="rounded-xl border border-border bg-muted/30 p-8">
                    <BilimLoader size="lg" label="ЖИ көмекші ойлануда..." />
                  </div>
                )}

                {result && (
                  <div className="rounded-xl border border-border bg-muted/30 p-4 max-h-[400px] overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                {result && (
                  <Button variant="outline" onClick={download} className="gap-2">
                    <Download className="h-4 w-4" /> Жүктеу (.md)
                  </Button>
                )}
                <Button onClick={generate} disabled={loading} className="gap-2">
                  {loading ? <BilimSpinner /> : <Sparkles className="h-4 w-4" />}
                  {result ? "Қайта генерациялау" : "Генерациялау"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
