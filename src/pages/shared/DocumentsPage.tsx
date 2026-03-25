import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Eye, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialDocs = [
  { id: 1, name: "Сабақ жоспары - Математика 9А.docx", size: "180 KB", date: "2026-03-20", category: "Жоспар" },
  { id: 2, name: "Бақылау жұмысы №3.pdf", size: "95 KB", date: "2026-03-18", category: "Тест" },
  { id: 3, name: "КТЖ (күнтізбелік-тақырыптық жоспар).xlsx", size: "320 KB", date: "2026-02-15", category: "Жоспар" },
  { id: 4, name: "Оқушылар тізімі - 10Б.pdf", size: "45 KB", date: "2026-03-01", category: "Тізім" },
  { id: 5, name: "Сабақ конспектісі - Ньютон заңдары.pdf", size: "250 KB", date: "2026-03-22", category: "Конспект" },
];

const categoryColors: Record<string, string> = {
  "Жоспар": "bg-primary/10 text-primary",
  "Тест": "bg-warning/10 text-warning",
  "Тізім": "bg-success/10 text-success",
  "Конспект": "bg-muted text-muted-foreground",
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState(initialDocs);
  const { toast } = useToast();

  const handleUpload = () => {
    const newDoc = { id: Date.now(), name: `Жаңа құжат_${docs.length + 1}.pdf`, size: "100 KB", date: new Date().toISOString().split("T")[0], category: "Конспект" };
    setDocs([newDoc, ...docs]);
    toast({ title: "Құжат жүктелді", description: newDoc.name });
  };

  const handleDelete = (id: number) => {
    setDocs(docs.filter(d => d.id !== id));
    toast({ title: "Құжат жойылды", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Құжаттар</h2>
        <Button onClick={handleUpload} className="gap-2"><Plus className="h-4 w-4" /> Құжат жүктеу</Button>
      </div>
      <div className="space-y-3">
        {docs.map(d => (
          <div key={d.id} className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[d.category] || "bg-muted text-muted-foreground"}`}>{d.category}</span>
                    <span className="text-xs text-muted-foreground">{d.size}</span>
                    <span className="text-xs text-muted-foreground">{d.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => toast({ title: "Құжат ашылды", description: d.name })}><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => toast({ title: "Жүктелуде...", description: d.name })}><Download className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
