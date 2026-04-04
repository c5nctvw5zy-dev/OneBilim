import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Edit, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const subjects = ["Математика", "Қазақ тілі", "Физика", "Химия", "Биология", "Тарих", "Ағылшын тілі", "Информатика"];
const classList = ["9А", "9Б", "10А", "10Б", "11А", "11Б"];
const quarters = ["1-тоқсан", "2-тоқсан", "3-тоқсан", "4-тоқсан"];

interface GeneratedAssessment {
  id: number;
  type: string;
  subject: string;
  className: string;
  quarter: string;
  topic: string;
  totalScore: number;
  createdAt: string;
}

export default function AssessmentGeneratorPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [quarter, setQuarter] = useState("");
  const [topic, setTopic] = useState("");
  const [totalScore, setTotalScore] = useState("20");
  const [type, setType] = useState("БЖБ");
  const [assessments, setAssessments] = useState<GeneratedAssessment[]>([
    { id: 1, type: "БЖБ", subject: "Математика", className: "9А", quarter: "3-тоқсан", topic: "Квадрат теңдеулер", totalScore: 20, createdAt: "2026-04-01" },
    { id: 2, type: "ТЖБ", subject: "Физика", className: "10Б", quarter: "3-тоқсан", topic: "Кинематика", totalScore: 30, createdAt: "2026-03-28" },
  ]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!subject || !className || !quarter || !topic) {
      toast({ title: "Қате", description: "Барлық өрістерді толтырыңыз", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      const newA: GeneratedAssessment = {
        id: Date.now(),
        type,
        subject,
        className,
        quarter,
        topic,
        totalScore: parseInt(totalScore) || 20,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setAssessments((prev) => [newA, ...prev]);
      setGenerating(false);
      toast({ title: "Дайын!", description: `${type} сәтті жасалды` });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-primary" /> Жаңа БЖБ / ТЖБ жасау (ЖИ)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Түрі</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="БЖБ">БЖБ</SelectItem>
                  <SelectItem value="ТЖБ">ТЖБ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Пән</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Таңдау" /></SelectTrigger>
                <SelectContent>{subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Сынып</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger><SelectValue placeholder="Таңдау" /></SelectTrigger>
                <SelectContent>{classList.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Тоқсан</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger><SelectValue placeholder="Таңдау" /></SelectTrigger>
                <SelectContent>{quarters.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Тақырып</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Тақырыпты жазыңыз" />
            </div>
            <div className="space-y-2">
              <Label>Жалпы балл</Label>
              <Input type="number" value={totalScore} onChange={(e) => setTotalScore(e.target.value)} />
            </div>
          </div>
          <Button className="mt-4" onClick={handleGenerate} disabled={generating}>
            <Sparkles className="h-4 w-4 mr-2" />
            {generating ? "Жасалуда..." : "ЖИ арқылы жасау"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Жасалған тапсырмалар</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assessments.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.type}: {a.topic}</p>
                    <p className="text-xs text-muted-foreground">{a.subject} · {a.className} · {a.quarter} · {a.totalScore} балл</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{a.createdAt}</Badge>
                  <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
