import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, BookOpen, Search } from "lucide-react";

const initialSubjects = [
  { id: 1, name: "Математика", level: "Барлық", hours: 5, teacher: "Сейітов Қ.", desc: "Алгебра, геометрия негіздері" },
  { id: 2, name: "Қазақ тілі", level: "Барлық", hours: 3, teacher: "Ахметова С.", desc: "Грамматика, әдебиет" },
  { id: 3, name: "Физика", level: "Орта", hours: 3, teacher: "Мұхтаров Е.", desc: "Механика, термодинамика" },
  { id: 4, name: "Химия", level: "Орта", hours: 2, teacher: "Жанұзақова Г.", desc: "Бейорганикалық, органикалық химия" },
  { id: 5, name: "Биология", level: "Барлық", hours: 2, teacher: "Қасымова Л.", desc: "Адам анатомиясы, экология" },
  { id: 6, name: "Ағылшын тілі", level: "Барлық", hours: 3, teacher: "Смайлова Д.", desc: "Grammar, vocabulary, speaking" },
  { id: 7, name: "Информатика", level: "Орта", hours: 2, teacher: "Тұрсынов А.", desc: "Программалау, IT негіздері" },
  { id: 8, name: "Дүниетану", level: "Бастауыш", hours: 2, teacher: "Ерланова К.", desc: "Табиғат пен қоғам" },
];

export default function SubjectsManagementPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("Барлық");
  const filtered = initialSubjects.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) && (filter === "Барлық" || s.level === filter || s.level === "Барлық")
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Пән іздеу..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {["Барлық", "Бастауыш", "Орта"].map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>{f}</Button>
          ))}
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Қосу</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <Card key={s.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-primary" /> {s.name}
                </CardTitle>
                <Badge variant="secondary">{s.level}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Сағат: <span className="font-medium text-foreground">{s.hours}/апта</span></span>
                <span className="text-muted-foreground">{s.teacher}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" size="sm"><Edit className="h-3.5 w-3.5 mr-1" /> Өңдеу</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1" /> Жою</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
