import { useState } from "react";
import { BookOpen, FileText, Video, Download, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const initialMaterials = [
  { id: 1, title: "Алгебра формулалары", type: "PDF", subject: "Математика", size: "2.3 MB", icon: FileText },
  { id: 2, title: "Физика сабағы - Ньютон заңдары", type: "Видео", subject: "Физика", size: "45 MB", icon: Video },
  { id: 3, title: "Қазақ тілі грамматика", type: "PDF", subject: "Қазақ тілі", size: "1.8 MB", icon: FileText },
  { id: 4, title: "Химия презентация", type: "PPTX", subject: "Химия", size: "5.2 MB", icon: BookOpen },
  { id: 5, title: "Ағылшын тілі - Unit 5", type: "PDF", subject: "Ағылшын тілі", size: "3.1 MB", icon: FileText },
];

const typeColors: Record<string, string> = {
  "PDF": "bg-destructive/10 text-destructive",
  "Видео": "bg-primary/10 text-primary",
  "PPTX": "bg-warning/10 text-warning",
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState(initialMaterials);
  const { toast } = useToast();

  const handleDownload = (title: string) => {
    toast({ title: "Жүктелуде...", description: `${title} файлы жүктелуде.` });
  };

  const handleUpload = () => {
    const newMat = { id: Date.now(), title: `Жаңа материал ${materials.length + 1}`, type: "PDF", subject: "Жалпы", size: "1.0 MB", icon: FileText };
    setMaterials([newMat, ...materials]);
    toast({ title: "Материал жүктелді!", description: newMat.title });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Материалдар</h2>
        <Button onClick={handleUpload} className="gap-2"><Plus className="h-4 w-4" /> Материал жүктеу</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map(m => (
          <div key={m.id} className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
                <m.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[m.type] || "bg-muted text-muted-foreground"}`}>{m.type}</span>
                  <span className="text-xs text-muted-foreground">{m.size}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{m.subject}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3 gap-2" onClick={() => handleDownload(m.title)}>
              <Download className="h-3.5 w-3.5" />
              Жүктеу
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
