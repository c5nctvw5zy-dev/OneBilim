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
// (PROGRAM_OPTIONS moved to AlphabetBookWizard)

const TEMPLATE_COLUMNS = [
  "alphabet_number", "last_name", "first_name", "birth_date", "gender",
  "nationality", "address", "phone", "grade_level", "section",
  "education_program", "parent_name", "parent_phone", "enroll_date",
] as const;

type Col = (typeof TEMPLATE_COLUMNS)[number];

const HEADER_LABELS: Record<string, Record<Col, string>> = {
  kk: {
    alphabet_number: "№", last_name: "Тегі", first_name: "Аты", birth_date: "Туған күні (ЖЖЖЖ-АА-КК)",
    gender: "Жынысы (ер/әйел)", nationality: "Ұлты", address: "Мекенжайы", phone: "Телефон",
    grade_level: "Сынып (сан)", section: "Литер", education_program: "Оқу бағдарламасы",
    parent_name: "Ата-анасы", parent_phone: "Ата-ана телефоны", enroll_date: "Қабылданған күні",
  },
  ru: {
    alphabet_number: "№", last_name: "Фамилия", first_name: "Имя", birth_date: "Дата рождения (ГГГГ-ММ-ДД)",
    gender: "Пол (муж/жен)", nationality: "Национальность", address: "Адрес", phone: "Телефон",
    grade_level: "Класс (число)", section: "Литера", education_program: "Учебная программа",
    parent_name: "Родитель", parent_phone: "Телефон родителя", enroll_date: "Дата зачисления",
  },
  en: {
    alphabet_number: "No", last_name: "Last name", first_name: "First name", birth_date: "Birth date (YYYY-MM-DD)",
    gender: "Gender (male/female)", nationality: "Nationality", address: "Address", phone: "Phone",
    grade_level: "Grade (number)", section: "Section", education_program: "Education program",
    parent_name: "Parent", parent_phone: "Parent phone", enroll_date: "Enrollment date",
  },
};

const SAMPLE_ROW: Record<string, (string | number)[]> = {
  kk: [1, "Алмұратов", "Дана", "2012-09-01", "ер", "қазақ", "Алматы қ.", "+77071234567", 7, "Г", "general", "Әке Аты", "+77079876543", "2024-09-01"],
  ru: [1, "Алмуратов", "Дана", "2012-09-01", "муж", "казах", "г. Алматы", "+77071234567", 7, "Г", "general", "Отец Имя", "+77079876543", "2024-09-01"],
  en: [1, "Almuratov", "Dana", "2012-09-01", "male", "Kazakh", "Almaty", "+77071234567", 7, "G", "general", "Parent Name", "+77079876543", "2024-09-01"],
};

const UI = {
  kk: { title: "Excel арқылы көп оқушыны бір рет тіркеу", hint: "Үлгіні жүктеп, толтырыңыз да, қайтадан осы жерге тиеңіз. Жүйе автоматты тексеріп қосады.", tpl: "Excel импорттау үлгісі", imp: "Excel импорттау", busy: "Жүктелуде...", sheet: "Оқушылар", empty: "Оқушы табылмады", ok: "Импорт сәтті", err: "Қате" },
  ru: { title: "Массовая регистрация учеников через Excel", hint: "Скачайте шаблон, заполните и загрузите обратно. Система проверит и добавит записи.", tpl: "Шаблон импорта Excel", imp: "Импорт Excel", busy: "Загрузка...", sheet: "Ученики", empty: "Ученики не найдены", ok: "Импорт выполнен", err: "Ошибка" },
  en: { title: "Bulk-register students via Excel", hint: "Download the template, fill it in and upload it back. The system validates and imports.", tpl: "Excel import template", imp: "Import Excel", busy: "Uploading...", sheet: "Students", empty: "No students found", ok: "Import complete", err: "Error" },
};

const GENDER_MAP: Record<string, string> = {
  "ер": "male", "ұл": "male", "муж": "male", "мужской": "male", "male": "male", "m": "male", "м": "male",
  "әйел": "female", "қыз": "female", "жен": "female", "женский": "female", "female": "female", "f": "female", "ж": "female",
};

const normDate = (v: any): string | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(v).trim();
  const dmy = s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  const ymd = s.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
  return undefined;
};

function ExcelImportBar() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const lang = (i18n.language || "kk").slice(0, 2);
  const L = HEADER_LABELS[lang] || HEADER_LABELS.kk;
  const T = UI[lang as keyof typeof UI] || UI.kk;

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_COLUMNS.map((c) => L[c]),
      SAMPLE_ROW[lang] || SAMPLE_ROW.kk,
    ]);
    ws["!cols"] = TEMPLATE_COLUMNS.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, T.sheet);
    XLSX.writeFile(wb, `alphabet_book_template_${lang}.xlsx`);
  };

  // Map any header (db key or a label in any language) back to the db column
  const headerToCol = (header: string): Col | null => {
    const h = String(header).trim().toLowerCase();
    for (const c of TEMPLATE_COLUMNS) {
      if (h === c) return c;
      for (const set of Object.values(HEADER_LABELS)) {
        if (h === set[c].toLowerCase()) return c;
      }
    }
    return null;
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !profile?.school_id) return;
    setBusy(true);
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rowsRaw: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const rows = rowsRaw.map((r) => {
        const out: any = { school_id: profile.school_id, status: "active" };
        Object.keys(r).forEach((key) => {
          const col = headerToCol(key);
          if (!col) return;
          const raw = r[key];
          if (raw === "" || raw === null || raw === undefined) return;
          out[col] = typeof raw === "string" ? raw.trim() : raw;
        });
        if (out.grade_level !== undefined) out.grade_level = Number(String(out.grade_level).replace(/\D/g, "")) || null;
        if (out.alphabet_number !== undefined) out.alphabet_number = Number(out.alphabet_number) || null;
        if (out.gender) out.gender = GENDER_MAP[String(out.gender).trim().toLowerCase()] || null;
        if (out.birth_date) out.birth_date = normDate(out.birth_date) ?? null;
        if (out.enroll_date) out.enroll_date = normDate(out.enroll_date) ?? null;
        if (out.section) out.section = String(out.section).trim().toUpperCase();
        if (!out.education_program) out.education_program = "general";
        Object.keys(out).forEach((k) => { if (out[k] === "" || out[k] === undefined) delete out[k]; });
        return out;
      }).filter((r) => r.last_name && r.first_name);
      if (rows.length === 0) {
        toast({ title: T.err, description: T.empty, variant: "destructive" });
        return;
      }
      const { error } = await (supabase as any).from("alphabet_book").insert(rows);
      if (error) { toast({ title: T.err, description: error.message, variant: "destructive" }); return; }
      toast({ title: T.ok, description: `${rows.length}` });
      setTimeout(() => window.location.reload(), 700);
    } catch (err: any) {
      toast({ title: T.err, description: err?.message || String(err), variant: "destructive" });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 flex flex-wrap items-center gap-3">
      <FileSpreadsheet className="h-5 w-5 text-primary" />
      <div className="text-sm flex-1 min-w-[200px]">
        <div className="font-medium text-foreground">{T.title}</div>
        <div className="text-xs text-muted-foreground">{T.hint}</div>
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
        <Download className="h-4 w-4" /> {T.tpl}
      </Button>
      <Button size="sm" className="gap-2" onClick={() => fileRef.current?.click()} disabled={busy}>
        <Upload className="h-4 w-4" /> {busy ? T.busy : T.imp}
      </Button>
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />
    </div>
  );
}


import AlphabetBookWizard from "@/components/AlphabetBookWizard";

export const AlphabetBookPage = () => (
  <div className="space-y-4">
    <ExcelImportBar />
    <AlphabetBookWizard />
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
