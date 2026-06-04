import SimpleCrud from "@/components/SimpleCrud";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import * as XLSX from "xlsx";

// 📖 Алфавиттік кітап (бұл кесте Оқушылар мен сыныптар бетіне автоматты түрде түседі)
const PROGRAM_OPTIONS = [
  { value: "general", label: "Жалпы оқу білімі" },
  { value: "home", label: "Үйден оқыту" },
  { value: "gifted", label: "Дарынды бала" },
  { value: "inclusive", label: "Жеке/инклюзивті оқыту" },
  { value: "remote", label: "Қашықтан оқу" },
];

const TEMPLATE_COLUMNS = [
  "alphabet_number", "last_name", "first_name", "birth_date", "gender",
  "nationality", "address", "phone", "grade_level", "section",
  "education_program", "parent_name", "parent_phone", "enroll_date",
];

function ExcelImportBar() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_COLUMNS,
      [1, "Алмұратов", "Дана", "2012-09-01", "male", "қазақ", "Алматы қ.", "+77071234567", 7, "Г", "general", "Әке Аты", "+77079876543", "2024-09-01"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Оқушылар");
    XLSX.writeFile(wb, "alphabet_book_template.xlsx");
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !profile?.school_id) return;
    setBusy(true);
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rowsRaw: any[] = XLSX.utils.sheet_to_json(ws);
      const rows = rowsRaw.map((r) => {
        const out: any = { school_id: profile.school_id, status: "active" };
        TEMPLATE_COLUMNS.forEach((c) => { if (r[c] !== undefined && r[c] !== "") out[c] = r[c]; });
        if (out.grade_level) out.grade_level = Number(out.grade_level);
        if (out.alphabet_number) out.alphabet_number = Number(out.alphabet_number);
        return out;
      }).filter((r) => r.last_name && r.first_name);
      if (rows.length === 0) {
        toast({ title: "Бос файл", description: "Оқушы табылмады", variant: "destructive" });
        return;
      }
      const { error } = await (supabase as any).from("alphabet_book").insert(rows);
      if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Импорт сәтті", description: `${rows.length} оқушы қосылды. Сыныптарға автоматты түрде орналастырылды.` });
      setTimeout(() => window.location.reload(), 700);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 flex flex-wrap items-center gap-3">
      <FileSpreadsheet className="h-5 w-5 text-primary" />
      <div className="text-sm flex-1 min-w-[200px]">
        <div className="font-medium text-foreground">Excel арқылы көп оқушыны бір рет тіркеу</div>
        <div className="text-xs text-muted-foreground">Үлгіні жүктеп, толтырыңыз да, қайтадан осы жерге тиеңіз. Жүйе автоматты тексеріп қосады.</div>
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
        <Download className="h-4 w-4" /> Excel импорттау үлгісі
      </Button>
      <Button size="sm" className="gap-2" onClick={() => fileRef.current?.click()} disabled={busy}>
        <Upload className="h-4 w-4" /> {busy ? "Жүктелуде..." : "Excel импорттау"}
      </Button>
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
    </div>
  );
}

export const AlphabetBookPage = () => (
  <div className="space-y-4">
    <ExcelImportBar />
    <SimpleCrud
      title="📖 Алфавиттік кітап"
      table="alphabet_book"
      fields={[
        { key: "alphabet_number", label: "Реттік нөмір", type: "number" },
        { key: "last_name", label: "Тегі", required: true },
        { key: "first_name", label: "Аты", required: true },
        { key: "birth_date", label: "Туған күні", type: "date" },
        { key: "gender", label: "Жынысы", type: "select", options: [{ value: "male", label: "Ұл" }, { value: "female", label: "Қыз" }] },
        { key: "nationality", label: "Ұлты" },
        { key: "address", label: "Мекенжайы" },
        { key: "phone", label: "Телефон" },
        { key: "grade_level", label: "Сынып", type: "number", required: true },
        { key: "section", label: "Параллель (А/Ә/Б)" },
        { key: "education_program", label: "Оқу бағдарламасы", type: "select", options: PROGRAM_OPTIONS },
        { key: "parent_name", label: "Ата-ана аты" },
        { key: "parent_phone", label: "Ата-ана телефоны" },
        { key: "enroll_date", label: "Қабылданған күні", type: "date" },
        { key: "status", label: "Күйі", type: "select", options: [{ value: "active", label: "Оқып жүр" }, { value: "exited", label: "Шығарылған" }] },
        { key: "exit_date", label: "Шыққан күні", type: "date" },
        { key: "exit_order_no", label: "Шығу бұйрығы №" },
        { key: "exit_reason", label: "Шығу себебі", type: "textarea" },
      ]}
      listColumns={["alphabet_number", "last_name", "first_name", "grade_level", "section", "education_program", "status"]}
    />
  </div>
);

// 📜 Бұйрықтар кітабы
export const OrdersBookPage = () => (
  <SimpleCrud
    title="📜 Бұйрықтар кітабы"
    table="orders_book"
    fields={[
      { key: "order_no", label: "Бұйрық №", required: true },
      { key: "order_date", label: "Күні", type: "date", required: true },
      { key: "reason", label: "Себебі / тақырыбы", type: "textarea", required: true },
      { key: "issued_by", label: "Шығарушы" },
      { key: "file_url", label: "Файл сілтемесі" },
    ]}
    listColumns={["order_no", "order_date", "reason", "issued_by"]}
  />
);

// 👥 Қызметкерлер
export const StaffPage = () => (
  <SimpleCrud
    title="👥 Қызметкерлер"
    table="staff"
    fields={[
      { key: "full_name", label: "Аты-жөні", required: true },
      { key: "position", label: "Лауазымы" },
      { key: "phone", label: "Телефон" },
      { key: "iin", label: "ЖСН" },
      { key: "hire_date", label: "Қабылданған күні", type: "date" },
      { key: "notes", label: "Ескертулер", type: "textarea" },
    ]}
    listColumns={["full_name", "position", "phone", "hire_date", "status"]}
  />
);

// 🗒️ Табельдер
export const TimesheetsPage = () => (
  <SimpleCrud
    title="🗒️ Табельдер"
    table="timesheets"
    fields={[
      { key: "staff_name", label: "Қызметкер", required: true },
      { key: "position", label: "Лауазымы" },
      { key: "period", label: "Кезең (айы/тоқсан)", required: true },
      { key: "worked_days", label: "Жұмыс күндері", type: "number" },
      { key: "worked_hours", label: "Жұмыс сағаттары", type: "number" },
      { key: "absences", label: "Жоқ күндер", type: "number" },
      { key: "notes", label: "Ескертулер", type: "textarea" },
    ]}
    listColumns={["staff_name", "position", "period", "worked_days", "worked_hours", "absences"]}
  />
);

// 📊 Журнал пайыздары
export const JournalPercentPage = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("lesson_hours").select("*").order("subject_name");
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">📊 Журнал пайыздары</h2>
      <p className="text-sm text-muted-foreground">Әр пән/мұғалім бойынша өткізілген сағаттардың жалпы сағаттан үлесі</p>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Жүктелуде...</div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Сағат деректері әлі енгізілмеген. «Оқу бағдарламасы» бөлімінде сағаттар енгізілген соң мұнда пайыздар көрсетіледі.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => {
            const pct = r.total_hours > 0 ? Math.round((r.conducted_hours / r.total_hours) * 100) : 0;
            return (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{r.subject_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {r.conducted_hours} / {r.total_hours} сағ
                      {r.quarter ? ` · ${r.quarter}-тоқсан` : ""}
                      {r.academic_year ? ` · ${r.academic_year}` : ""}
                    </span>
                    <span className="font-semibold tabular-nums">{pct}%</span>
                  </div>
                  <Progress value={pct} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
