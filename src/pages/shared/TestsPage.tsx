import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Play, CheckCircle, Clock, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Test {
  id: number;
  title: string;
  subject: string;
  questions: number;
  duration: number;
  status: "Белсенді" | "Аяқталды" | "Жоспарланған";
  score?: number;
}

const initialTests: Test[] = [
  { id: 1, title: "1-тоқсандық бақылау жұмысы", subject: "Математика", questions: 20, duration: 45, status: "Аяқталды", score: 85 },
  { id: 2, title: "Ньютон заңдары тест", subject: "Физика", questions: 15, duration: 30, status: "Белсенді" },
  { id: 3, title: "Грамматика тексерісі", subject: "Қазақ тілі", questions: 25, duration: 40, status: "Жоспарланған" },
  { id: 4, title: "Unit 5 Quiz", subject: "Ағылшын тілі", questions: 10, duration: 20, status: "Белсенді" },
  { id: 5, title: "Периодтық жүйе", subject: "Химия", questions: 18, duration: 35, status: "Аяқталды", score: 92 },
];

const statusConfig: Record<string, { bg: string; icon: typeof CheckCircle }> = {
  "Белсенді": { bg: "bg-success/10 text-success", icon: Play },
  "Аяқталды": { bg: "bg-muted text-muted-foreground", icon: CheckCircle },
  "Жоспарланған": { bg: "bg-warning/10 text-warning", icon: Clock },
};

export default function TestsPage({ isTeacher = false }: { isTeacher?: boolean }) {
  const [tests, setTests] = useState(initialTests);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const { toast } = useToast();

  const handleCreate = () => {
    if (!newTitle.trim() || !newSubject.trim()) return;
    const t: Test = {
      id: Date.now(),
      title: newTitle,
      subject: newSubject,
      questions: 10,
      duration: 30,
      status: "Жоспарланған",
    };
    setTests([t, ...tests]);
    setNewTitle("");
    setNewSubject("");
    setShowCreate(false);
    toast({ title: "Тест жасалды!", description: t.title });
  };

  const handleDelete = (id: number) => {
    setTests(tests.filter(t => t.id !== id));
    toast({ title: "Тест жойылды", variant: "destructive" });
  };

  const handleStart = (test: Test) => {
    toast({ title: "Тест басталды!", description: `${test.title} — ${test.duration} минут` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Тесттер</h2>
        {isTeacher && (
          <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
            <Plus className="h-4 w-4" /> Тест жасау
          </Button>
        )}
      </div>

      {showCreate && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Жаңа тест</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Тест атауы" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <Input placeholder="Пән" value={newSubject} onChange={e => setNewSubject(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate}>Жасау</Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Болдырмау</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tests.map(t => {
          const cfg = statusConfig[t.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={t.id} className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{t.subject}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1 ${cfg.bg}`}>
                      <StatusIcon className="h-3 w-3" /> {t.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.questions} сұрақ · {t.duration} минут{t.score !== undefined && ` · Нәтиже: ${t.score}%`}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {t.status === "Белсенді" && !isTeacher && (
                    <Button size="sm" onClick={() => handleStart(t)} className="gap-1"><Play className="h-3.5 w-3.5" /> Бастау</Button>
                  )}
                  {t.status === "Аяқталды" && (
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Нәтижелер", description: `${t.title}: ${t.score}%` })} className="gap-1"><Eye className="h-3.5 w-3.5" /> Нәтиже</Button>
                  )}
                  {isTeacher && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
