import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileDown, FileText, Presentation, ListChecks, UserCog, Image as ImageIcon, FlaskConical, BarChart3, Sparkles, FileType, FileImage } from "lucide-react";
import BilimLoader, { BilimSpinner } from "@/components/BilimLoader";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import PptxGenJS from "pptxgenjs";
import { Document as DocxDoc, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

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
    key: "plan", icon: FileText, title: "Сабақ / Жылдық жоспар",
    subtitle: "Тақырып немесе кітап бойынша автоматты жоспар",
    brand: "PDF · DOCX", color: "from-blue-500/20 to-cyan-500/10",
    fields: [
      { name: "subject", label: "Пән", placeholder: "Математика" },
      { name: "grade", label: "Сынып", placeholder: "7" },
      { name: "topic", label: "Тақырып / Кітап", placeholder: "Алгебра, 1-тарау" },
      { name: "type", label: "Жоспар түрі", placeholder: "қысқа мерзімді / жылдық" },
    ],
    buildPrompt: (v) =>
      `Қазақ тіліндегі ${v.type || "қысқа мерзімді"} сабақ жоспары жаса.
Пән: ${v.subject} | Сынып: ${v.grade} | Тақырып: ${v.topic}.

Маркдаунмен мынандай құрылыммен ӘРБІР бөлімді H2 (## ...) тақырыппен жаз:
## Сабақ мақсаты
## Күтілетін нәтиже
## Бағалау критерийлері
## Сабақ кезеңдері
(кесте: уақыт | мұғалім әрекеті | оқушы әрекеті)
## Ресурстар
## Үй тапсырмасы
## Рефлексия`,
  },
  {
    key: "presentation", icon: Presentation, title: "Презентация",
    subtitle: "Әр слайд үшін тақырып + мәтін + сурет идеясы",
    brand: "PPTX экспорт", color: "from-orange-500/20 to-red-500/10",
    fields: [
      { name: "topic", label: "Тақырып", placeholder: "Алгоритмдер" },
      { name: "slides", label: "Слайд саны", placeholder: "8" },
      { name: "audience", label: "Аудитория", placeholder: "7-сынып" },
    ],
    buildPrompt: (v) =>
      `«${v.topic}» бойынша ${v.slides || "8"} слайдтан тұратын презентация жаса. Аудитория: ${v.audience || "оқушылар"}.

ӘРБІР слайдты H2 түрде былай жаз:
## Slide N: Тақырып
**Мәтін:** негізгі 3-5 пункт (- белгісімен тізім)
**Сурет идеясы:** қандай сурет/иллюстрация қою керек (қысқа сипаттама)
**Дикторлық дауыс:** 1-2 сөйлем

Соңында "## Дизайн палитрасы" бөлімінде 3 HEX түс пен шрифт ұсыныстарын бер.`,
  },
  {
    key: "tasks", icon: ListChecks, title: "Тапсырмалар",
    subtitle: "Тест · сәйкестендіру · бос орын — жауап кілтімен",
    brand: "PDF экспорт", color: "from-green-500/20 to-emerald-500/10",
    fields: [
      { name: "topic", label: "Тақырып", placeholder: "Квадрат теңдеулер" },
      { name: "kind", label: "Тапсырма түрі", placeholder: "тест / сәйкестендіру / бос орын" },
      { name: "count", label: "Сұрақ саны", placeholder: "10" },
    ],
    buildPrompt: (v) =>
      `«${v.topic}» бойынша ${v.kind || "тест"} жасап бер. Сұрақ саны: ${v.count || "10"}.

ӘРБІР сұрақты H2 ретінде жаз: ## Сұрақ N
- Сұрақ мәтіні
- 4 жауап (А/В/С/D)
- Деңгей: оңай/орташа/қиын

Соңында "## Жауап кілті" бөлімі — кестемен (№ | Дұрыс жауап | Түсіндірме).`,
  },
  {
    key: "personal", icon: UserCog, title: "Жеке оқыту",
    subtitle: "Оқушы деңгейіне сай апталық жоспар",
    brand: "Карточкалар", color: "from-purple-500/20 to-pink-500/10",
    fields: [
      { name: "student", label: "Оқушы аты", placeholder: "Айдана А." },
      { name: "level", label: "Деңгейі", placeholder: "артта / орта / озат" },
      { name: "topic", label: "Тақырып / Пән", placeholder: "Математика, бөлшектер" },
      { name: "weakness", label: "Қиналатын тұстары", placeholder: "көбейту, бөлу", multiline: true },
    ],
    buildPrompt: (v) =>
      `Оқушы: ${v.student}, деңгейі: ${v.level}, ${v.topic}. Қиналатын тұстары: ${v.weakness || "—"}.

Маркдаунмен ӘРБІР күнді H2 түрде жаз:
## Дүйсенбі
- Мақсат: ...
- Тапсырма: ...
- Ұсыныс: ...

(Дүйсенбіден жұмаға дейін 5 күн). Соңында "## Жалпы ұсыныстар" және "## Мотивация" бөлімдері.`,
  },
  {
    key: "visuals", icon: ImageIcon, title: "Көрнекіліктер",
    subtitle: "Диаграмма · кесте · инфографика сипаттамасы",
    brand: "PNG/PDF", color: "from-yellow-500/20 to-orange-500/10",
    fields: [
      { name: "topic", label: "Тақырып", placeholder: "Күн жүйесі" },
      { name: "format", label: "Формат", placeholder: "инфографика / диаграмма / кесте" },
      { name: "details", label: "Элементтер", placeholder: "8 планета, өлшемі, қашықтығы", multiline: true },
    ],
    buildPrompt: (v) =>
      `«${v.topic}» бойынша ${v.format || "көрнекілік"} жасауға арналған толық сценарий бер.
Элементтер: ${v.details || "—"}.

H2 бөлімдер:
## Құрылым (блоктар қалай орналасады)
## Сандық деректер (кесте)
## Түс схемасы (3 HEX)
## Иконкалар тізімі
## Мұғалімге кеңес`,
  },
  {
    key: "lab", icon: FlaskConical, title: "Онлайн зертхана",
    subtitle: "Интерактивті эксперимент сценарийі",
    brand: "Анимация · қадам", color: "from-cyan-500/20 to-blue-500/10",
    fields: [
      { name: "subject", label: "Пән", placeholder: "Химия" },
      { name: "topic", label: "Тақырып", placeholder: "Қышқыл + металл" },
      { name: "format", label: "Формат", placeholder: "3D / 2D / симуляция" },
    ],
    buildPrompt: (v) =>
      `${v.subject} пәнінен «${v.topic}» ${v.format || "3D"} онлайн зертхана сценарийі.

H2 бөлімдер:
## Теориялық кіріспе
## Құралдар мен реактивтер
## Қадамдық эксперимент (1-8 қадам)
## Анимация ұсынысы (қандай эффектілер)
## Қауіпсіздік ережелері
## Күтілетін нәтиже
## Онлайн платформалар (PhET, Mozaik т.б. сілтемелер)`,
  },
  {
    key: "analysis", icon: BarChart3, title: "Үлгерім анализі",
    subtitle: "Орташа балл · әлсіз/күшті · диаграмма",
    brand: "Charts", color: "from-rose-500/20 to-pink-500/10",
    fields: [
      { name: "class", label: "Сынып", placeholder: "7Г" },
      { name: "subject", label: "Пән", placeholder: "Математика" },
      { name: "data", label: "Үлгерім деректері", placeholder: "Айдос: 8, Айгүл: 5, Бекзат: 9...", multiline: true },
    ],
    buildPrompt: (v) =>
      `${v.class}, ${v.subject} бойынша үлгерім талдау. Деректер: ${v.data || "—"}.

H2 бөлімдер:
## Жалпы көрсеткіш (орташа балл, динамика)
## Күшті оқушылар
## Әлсіз оқушылар  
## Себептер
## Ұсыныстар (10 пункт)
## Әрекет жоспары (келесі тоқсанға)

ЕРЕЖЕ: егер деректерде "Аты: балл" түрінде сандар болса, ОҚУШЫ_БАЛЛДАР: ат1=балл, ат2=балл, ... түрінде бөлек жол шығар (диаграмма үшін).`,
  },
];

// ---------- Card renderer ----------
function parseSections(md: string): { title: string; body: string }[] {
  if (!md) return [];
  const lines = md.split("\n");
  const sections: { title: string; body: string }[] = [];
  let current: { title: string; body: string } | null = null;
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      if (current) sections.push(current);
      current = { title: m[1].trim(), body: "" };
    } else if (current) {
      current.body += line + "\n";
    } else {
      // pre-heading content
      if (!sections.length || sections[0].title !== "Кіріспе") {
        sections.unshift({ title: "Жалпы", body: line + "\n" });
      } else {
        sections[0].body += line + "\n";
      }
    }
  }
  if (current) sections.push(current);
  return sections.filter(s => s.body.trim());
}

function extractScores(md: string): { name: string; score: number }[] {
  const line = md.split("\n").find(l => l.startsWith("ОҚУШЫ_БАЛЛДАР:"));
  if (!line) return [];
  return line.replace("ОҚУШЫ_БАЛЛДАР:", "").split(",").map(p => {
    const [name, sc] = p.split("=").map(s => s.trim());
    return { name, score: parseFloat(sc) };
  }).filter(p => p.name && !isNaN(p.score));
}

function renderTable(body: string) {
  // Detect markdown table
  const lines = body.split("\n").filter(l => l.trim());
  const tableLines = lines.filter(l => l.includes("|"));
  if (tableLines.length < 2) return null;
  const rows = tableLines
    .filter(l => !/^\s*\|?\s*[:\-\s|]+\|?\s*$/.test(l))
    .map(l => l.split("|").map(c => c.trim()).filter(Boolean));
  if (rows.length < 1) return null;
  const [head, ...body2] = rows;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border border-border rounded-lg">
        <thead className="bg-muted/60"><tr>{head.map((h, i) => <th key={i} className="px-2 py-1.5 text-left font-medium">{h}</th>)}</tr></thead>
        <tbody>{body2.map((r, i) => <tr key={i} className="border-t border-border">{r.map((c, j) => <td key={j} className="px-2 py-1.5">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function renderBody(body: string) {
  const table = renderTable(body);
  if (table) {
    // Show non-table text + table
    const nonTable = body.split("\n").filter(l => !l.includes("|")).join("\n").trim();
    return <>{nonTable && <p className="text-sm whitespace-pre-wrap text-foreground/90 mb-2">{nonTable}</p>}{table}</>;
  }
  // Bullet detection
  const lines = body.split("\n").filter(l => l.trim());
  const bullets = lines.filter(l => /^[-•*]\s+/.test(l.trim()));
  if (bullets.length >= 2 && bullets.length >= lines.length * 0.6) {
    return (
      <ul className="space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="text-sm text-foreground/90 flex gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>{b.replace(/^[-•*]\s+/, "").replace(/\*\*(.+?)\*\*/g, "$1")}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm whitespace-pre-wrap text-foreground/90">{body.replace(/\*\*(.+?)\*\*/g, "$1")}</p>;
}

function ScoreBars({ scores }: { scores: { name: string; score: number }[] }) {
  const max = Math.max(...scores.map(s => s.score), 10);
  return (
    <div className="space-y-2">
      {scores.map(s => (
        <div key={s.name} className="space-y-0.5">
          <div className="flex justify-between text-xs"><span className="font-medium">{s.name}</span><span className="text-muted-foreground tabular-nums">{s.score}</span></div>
          <Progress value={(s.score / max) * 100} className="h-2" />
        </div>
      ))}
    </div>
  );
}

// ---------- Exports ----------
async function exportPDF(title: string, sections: { title: string; body: string }[]) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  let y = M;
  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(title, M, y); y += 22;
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  for (const s of sections) {
    if (y > 780) { doc.addPage(); y = M; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    const titleLines = doc.splitTextToSize(s.title, W - 2 * M);
    doc.text(titleLines, M, y); y += titleLines.length * 14 + 4;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    const text = s.body.replace(/\*\*/g, "").replace(/\|/g, " ");
    const lines = doc.splitTextToSize(text, W - 2 * M);
    for (const line of lines) {
      if (y > 800) { doc.addPage(); y = M; }
      doc.text(line, M, y); y += 12;
    }
    y += 10;
  }
  // NOTE: Cyrillic glyphs use Helvetica fallback. PDF works but may show "?" for some chars.
  // For full Unicode, use DOCX export instead.
  doc.save(`${title}.pdf`);
}

async function exportDOCX(title: string, sections: { title: string; body: string }[]) {
  const children: Paragraph[] = [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
  ];
  for (const s of sections) {
    children.push(new Paragraph({ text: s.title, heading: HeadingLevel.HEADING_2 }));
    for (const line of s.body.split("\n")) {
      const clean = line.replace(/\*\*(.+?)\*\*/g, "$1");
      if (clean.trim()) children.push(new Paragraph({ children: [new TextRun(clean)] }));
    }
  }
  const docx = new DocxDoc({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(docx);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${title}.docx`; a.click();
  URL.revokeObjectURL(url);
}

async function exportPPTX(topic: string, sections: { title: string; body: string }[]) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  // Title slide
  const t = pptx.addSlide();
  t.background = { color: "1E3A8A" };
  t.addText(topic, { x: 0.5, y: 2.5, w: 12, h: 1.5, fontSize: 44, color: "FFFFFF", bold: true, align: "center", fontFace: "Calibri" });
  t.addText("BilimApp · ЖИ көмекші", { x: 0.5, y: 4.2, w: 12, h: 0.5, fontSize: 18, color: "BFDBFE", align: "center" });
  // Content slides
  for (const s of sections) {
    const slide = pptx.addSlide();
    slide.addText(s.title, { x: 0.5, y: 0.4, w: 12, h: 0.8, fontSize: 28, bold: true, color: "1E3A8A", fontFace: "Calibri" });
    const cleanBody = s.body.replace(/\*\*(.+?)\*\*/g, "$1").trim();
    slide.addText(cleanBody, { x: 0.5, y: 1.4, w: 12, h: 5.5, fontSize: 16, color: "1F2937", fontFace: "Calibri", valign: "top" });
  }
  await pptx.writeFile({ fileName: `${topic}.pptx` });
}

export default function TeacherAIWorkspace({ context }: { context?: Record<string, any> }) {
  const { toast } = useToast();
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const openBlock = (b: Block) => { setActiveBlock(b); setValues({}); setResult(""); };

  const generate = async () => {
    if (!activeBlock) return;
    setLoading(true); setResult("");
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
      let buffer = "", acc = ""; let done = false;
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
    } finally { setLoading(false); }
  };

  const sections = parseSections(result);
  const scores = activeBlock?.key === "analysis" ? extractScores(result) : [];
  const cleanTitle = (activeBlock?.title || "Result").replace(/[^а-яА-ЯәіңғүұқөһЁёa-zA-Z0-9_\- ]/g, "_");

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BLOCKS.map((b) => {
          const Icon = b.icon;
          return (
            <Card key={b.key} onClick={() => openBlock(b)}
              className={`cursor-pointer p-5 hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-br ${b.color}`}>
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
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          {activeBlock && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <activeBlock.icon className="h-5 w-5 text-primary" />
                  {activeBlock.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  {activeBlock.fields.map((f) => (
                    <div key={f.name} className={f.multiline ? "sm:col-span-2" : ""}>
                      <label className="text-sm font-medium text-foreground">{f.label}</label>
                      {f.multiline ? (
                        <Textarea rows={3} placeholder={f.placeholder} value={values[f.name] || ""}
                          onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
                      ) : (
                        <Input placeholder={f.placeholder} value={values[f.name] || ""}
                          onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
                      )}
                    </div>
                  ))}
                </div>

                {loading && !result && (
                  <div className="rounded-xl border border-border bg-muted/30 p-8">
                    <BilimLoader size="lg" label="ЖИ көмекші ойлануда..." />
                  </div>
                )}

                {result && (
                  <div ref={resultRef} className="space-y-3">
                    {scores.length > 0 && (
                      <Card className="p-4 bg-gradient-to-br from-rose-500/10 to-pink-500/5">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" /> Үлгерім диаграммасы
                        </h4>
                        <ScoreBars scores={scores} />
                      </Card>
                    )}
                    {sections.map((s, i) => (
                      <Card key={i} className="p-4">
                        <h4 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {i + 1}
                          </span>
                          {s.title}
                        </h4>
                        {renderBody(s.body)}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2 flex-wrap">
                {result && (
                  <>
                    <Button variant="outline" onClick={() => exportPDF(cleanTitle, sections)} className="gap-2">
                      <FileType className="h-4 w-4" /> PDF
                    </Button>
                    <Button variant="outline" onClick={() => exportDOCX(cleanTitle, sections)} className="gap-2">
                      <FileDown className="h-4 w-4" /> DOCX
                    </Button>
                    {activeBlock.key === "presentation" && (
                      <Button variant="outline" onClick={() => exportPPTX(values.topic || cleanTitle, sections)} className="gap-2">
                        <FileImage className="h-4 w-4" /> PPTX
                      </Button>
                    )}
                  </>
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
