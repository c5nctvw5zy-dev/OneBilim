import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParsedRow {
  name: string;
  class: string;
  iin?: string;
  phone?: string;
}

export default function DirectorImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setImported(false);

    // Simulate CSV/Excel parsing with demo data
    setParsedData([
      { name: "Жаңа Оқушы 1", class: "5А", iin: "010101500123", phone: "+7 777 111 2233" },
      { name: "Жаңа Оқушы 2", class: "5А", iin: "010202500456", phone: "+7 777 222 3344" },
      { name: "Жаңа Оқушы 3", class: "5Б", iin: "010303500789", phone: "+7 777 333 4455" },
      { name: "Жаңа Оқушы 4", class: "6А", iin: "010404500012", phone: "+7 777 444 5566" },
      { name: "Жаңа Оқушы 5", class: "6Б", iin: "010505500345", phone: "+7 777 555 6677" },
    ]);
  };

  const handleImport = async () => {
    setImporting(true);
    await new Promise(r => setTimeout(r, 1500));
    setImporting(false);
    setImported(true);
    toast({ title: "Сәтті импортталды!", description: `${parsedData.length} оқушы жүйеге қосылды.` });
  };

  const handleClear = () => {
    setFile(null);
    setParsedData([]);
    setImported(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Excel импорт</h2>

      <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4">CSV немесе Excel файлды жүктеңіз (оқушылар, мұғалімдер тізімі)</p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
        <Button onClick={() => fileRef.current?.click()} variant="outline" className="gap-2">
          <Upload className="h-4 w-4" /> Файл таңдау
        </Button>
        {file && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-foreground">
            <FileSpreadsheet className="h-4 w-4 text-success" />
            {file.name}
            <button onClick={handleClear} className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {parsedData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Алдын ала қарау ({parsedData.length} жазба)</h3>
            {!imported && (
              <Button onClick={handleImport} disabled={importing} className="gap-2">
                {importing ? "Импортталуда..." : <><CheckCircle className="h-4 w-4" /> Импорттау</>}
              </Button>
            )}
            {imported && (
              <span className="flex items-center gap-2 text-sm text-success font-medium">
                <CheckCircle className="h-4 w-4" /> Сәтті импортталды!
              </span>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Аты-жөні</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Сынып</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">ЖСН</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Телефон</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{row.class}</span></td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.iin}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
