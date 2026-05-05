import SimpleCrud from "@/components/SimpleCrud";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// 📖 Алфавиттік кітап
export const AlphabetBookPage = () => (
  <SimpleCrud
    title="📖 Алфавиттік кітап"
    table="alphabet_book"
    fields={[
      { key: "alphabet_number", label: "Реттік нөмір", type: "number" },
      { key: "last_name", label: "Тегі", required: true },
      { key: "first_name", label: "Аты", required: true },
      { key: "birth_date", label: "Туған күні", type: "date" },
      { key: "nationality", label: "Ұлты" },
      { key: "address", label: "Мекенжайы" },
      { key: "grade_level", label: "Сынып", type: "number" },
      { key: "section", label: "Параллель" },
      { key: "enroll_date", label: "Қабылданған күні", type: "date" },
      { key: "exit_date", label: "Шыққан күні", type: "date" },
      { key: "exit_order_no", label: "Бұйрық №" },
      { key: "exit_reason", label: "Шығу себебі" },
    ]}
    listColumns={["alphabet_number", "last_name", "first_name", "grade_level", "section", "status"]}
  />
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
