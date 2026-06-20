import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, RefreshCw, Edit3, Download, Upload, CheckCircle2, Clock, XCircle, BookOpen, FileType2 } from "lucide-react";
import BilimLoader, { BilimSpinner } from "@/components/BilimLoader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { Document as DocxDoc, Packer, Paragraph, HeadingLevel } from "docx";

const CLASSES = ["1","2","3","4","5","6","7","8","9","10","11","12"].flatMap(n => ["А","Ә","Б","В"].map(l => `${n}${l}`));
const SUBJECTS = ["Қазақ тілі","Қазақ әдебиеті","Орыс тілі","Орыс әдебиеті","Ағылшын тілі","Математика","Алгебра","Геометрия","Жаратылыстану","Биология","Физика","Химия","География","Қазақстан тарихы","Дүниежүзі тарихы","Информатика","Көркем еңбек","Музыка","Дене шынықтыру","АӘД","Құқық негіздері","Кәсіпкерлік және бизнес негіздері"];
const TEXTBOOKS = ["Атамұра","Мектеп","Алматыкітап","Арман-ПВ","Білім","Көкжиек-Горизонт"];
const PROGRAMS = ["Жаңартылған білім беру мазмұны","Дарынды балалар бағдарламасы","Инклюзивті бағдарлама"];
const YEARS = ["2024-2025","2025-2026","2026-2027"];

export default function CurriculumAIPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [planType, setPlanType] = useState<"ҚМЖ" | "КТЖ">("ҚМЖ");
  const [form, setForm] = useState({
    className: "",
    subject: "",
    textbook: "",
    program: "",
    academicYear: "2025-2026",
    teacher: profile?.full_name || "",
  });
  const [additional, setAdditional] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [content, setContent] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending"|"approved"|"returned"|null>(null);

  const allFilled = Object.values(form).every(Boolean);

  const generate = async (regenerate = false) => {
    if (!allFilled) {
      toast({ title: "Барлық өрістерді толтырыңыз", variant: "destructive" });
      return;
    }
    setLoading(true); setProgress(0);
    const timer = setInterval(() => setProgress(p => Math.min(p + Math.random() * 12, 92)), 400);
    try {
      const { data, error } = await supabase.functions.invoke("ai-curriculum-plan", {
        body: {
          planType,
          className: form.className,
          subject: form.subject,
          textbook: form.textbook,
          program: form.program,
          academicYear: form.academicYear,
          teacher: form.teacher,
          additionalInstructions: regenerate ? additional : undefined,
          previousContent: regenerate ? content : undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setContent(data.content || "");
      setProgress(100);
      toast({ title: "✅ ЖИ жоспарды дайындады!" });
    } catch (e: any) {
      toast({ title: "Қате", description: e.message, variant: "destructive" });
    } finally {
      clearInterval(timer);
      setTimeout(() => { setLoading(false); setProgress(0); }, 600);
    }
  };

  const saveToSystem = async () => {
    try {
      const { data, error } = await supabase.from("curriculum_plans").insert({
        school_id: profile?.school_id,
        plan_type: planType,
        class_name: form.className,
        subject_name: form.subject,
        textbook: form.textbook,
        program: form.program,
        academic_year: form.academicYear,
        teacher_name: form.teacher,
        content,
        additional_instructions: additional,
        status: "pending",
      }).select().single();
      if (error) throw error;
      setSavedId(data.id);
      setStatus("pending");
      toast({ title: "🟢 Жүйеге жүктелді!", description: "Завучке тексеруге жіберілді" });
    } catch (e: any) {
      toast({ title: "Қате", description: e.message, variant: "destructive" });
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content.replace(/[#*|`]/g, ""), 180);
    doc.setFontSize(11);
    doc.text(lines, 15, 20);
    doc.save(`${planType}_${form.subject}_${form.className}.pdf`);
  };

  const exportDocx = async () => {
    const doc = new DocxDoc({
      sections: [{
        children: content.split("\n").map(line => {
          if (line.startsWith("## ")) return new Paragraph({ text: line.replace("## ",""), heading: HeadingLevel.HEADING_1 });
          if (line.startsWith("### ")) return new Paragraph({ text: line.replace("### ",""), heading: HeadingLevel.HEADING_2 });
          return new Paragraph({ text: line.replace(/[*`|]/g, "") });
        }),
      }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${planType}_${form.subject}_${form.className}.docx`; a.click();
  };

  const statusBadge = status === "pending" ? <Badge className="bg-yellow-500 gap-1"><Clock className="h-3 w-3"/>🟡 Тексерілуде</Badge>
    : status === "approved" ? <Badge className="bg-green-600 gap-1"><CheckCircle2 className="h-3 w-3"/>🟢 Бекітілді</Badge>
    : status === "returned" ? <Badge className="bg-red-600 gap-1"><XCircle className="h-3 w-3"/>🔴 Қайтарылды</Badge> : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur"><Sparkles className="h-7 w-7"/></div>
          <div>
            <h1 className="text-2xl font-bold">ЖИ арқылы ҚМЖ / КТЖ жасау</h1>
            <p className="text-white/85 text-sm">ҚР білім беру стандартына сай автоматты түрде жоспар құру</p>
          </div>
        </div>
      </div>

      <Tabs value={planType} onValueChange={(v) => setPlanType(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ҚМЖ" className="gap-2"><FileText className="h-4 w-4"/>ҚМЖ (қысқа мерзімді)</TabsTrigger>
          <TabsTrigger value="КТЖ" className="gap-2"><FileType2 className="h-4 w-4"/>КТЖ (күнтізбелік)</TabsTrigger>
        </TabsList>
      </Tabs>

      {!content && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Параметрлерді таңдаңыз</CardTitle>
            <CardDescription>Барлық өрістер толтырылған соң ЖИ жоспарды құрады</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <SelectField label="Сынып" value={form.className} onChange={v => setForm({...form, className: v})} options={CLASSES} />
            <SelectField label="Пән" value={form.subject} onChange={v => setForm({...form, subject: v})} options={SUBJECTS} />
            <SelectField label="Оқулық" value={form.textbook} onChange={v => setForm({...form, textbook: v})} options={TEXTBOOKS} />
            <SelectField label="Бағдарлама" value={form.program} onChange={v => setForm({...form, program: v})} options={PROGRAMS} />
            <SelectField label="Оқу жылы" value={form.academicYear} onChange={v => setForm({...form, academicYear: v})} options={YEARS} />
            <div className="space-y-2">
              <Label>Педагог</Label>
              <Input value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} placeholder="Аты-жөні"/>
            </div>
            <div className="sm:col-span-2">
              <Button size="xl" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90" onClick={() => generate(false)} disabled={!allFilled || loading}>
                {loading ? <BilimSpinner className="mr-2"/> : <Sparkles className="h-5 w-5 mr-2"/>}
                🤖 ЖИ көмегімен жасау
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="shadow-lg">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <BilimLoader size="xl"/>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">ЖИ жоспарды дайындауда…</p>
              <p className="text-sm text-muted-foreground">ҚР білім беру стандартына сай талдау жүруде</p>
            </div>
            <div className="w-full max-w-md h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all" style={{width: `${progress}%`}}/>
            </div>
          </CardContent>
        </Card>
      )}

      {content && !loading && (
        <>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/>Алдын ала қарау — {planType}</CardTitle>
                <CardDescription>{form.subject} • {form.className} сынып • {form.academicYear}</CardDescription>
              </div>
              {statusBadge}
            </CardHeader>
            <CardContent>
              {editing ? (
                <Textarea value={content} onChange={e => setContent(e.target.value)} className="min-h-[500px] font-mono text-sm"/>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-primary prose-table:text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Қайта жасатуға қосымша нұсқау (қажет болса)</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={additional} onChange={e => setAdditional(e.target.value)} placeholder="Мысалы: Практикалық тапсырмаларды көбейт, топтық жұмыс қос, саралауды күшейт..."/>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3 justify-center sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-2xl shadow-2xl border">
            <Button onClick={saveToSystem} className="bg-green-600 hover:bg-green-700 gap-2" disabled={!!savedId}><Upload className="h-4 w-4"/>🟢 Жүйеге жүктеу</Button>
            <Button variant="outline" onClick={() => generate(true)} className="gap-2"><RefreshCw className="h-4 w-4"/>🔄 Қайта жасату</Button>
            <Button variant="outline" onClick={() => setEditing(!editing)} className="gap-2"><Edit3 className="h-4 w-4"/>✏️ {editing ? "Дайын" : "Өңдеу"}</Button>
            <Button variant="outline" onClick={exportPDF} className="gap-2"><Download className="h-4 w-4"/>📄 PDF</Button>
            <Button variant="outline" onClick={exportDocx} className="gap-2"><Download className="h-4 w-4"/>📝 Word</Button>
            <Button variant="ghost" onClick={() => { setContent(""); setSavedId(null); setStatus(null); }}>Жаңасын жасау</Button>
          </div>
        </>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={`${label} таңдаңыз`}/></SelectTrigger>
        <SelectContent className="max-h-72">
          {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
