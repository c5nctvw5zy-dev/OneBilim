import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, BookOpen, ChevronRight, Sparkles } from "lucide-react";

type Subject = { name: string; emoji: string; color: string; grades: number[] };

const SUBJECTS: Subject[] = [
  { name: "Қазақ тілі", emoji: "🇰🇿", color: "from-sky-500 to-blue-600", grades: [1,2,3,4,5,6,7,8,9,10,11] },
  { name: "Қазақ әдебиеті", emoji: "📖", color: "from-blue-500 to-indigo-600", grades: [5,6,7,8,9,10,11] },
  { name: "Орыс тілі", emoji: "🅰️", color: "from-rose-500 to-red-600", grades: [1,2,3,4,5,6,7,8,9,10,11] },
  { name: "Орыс әдебиеті", emoji: "📚", color: "from-red-500 to-rose-600", grades: [5,6,7,8,9,10,11] },
  { name: "Ағылшын тілі", emoji: "🇬🇧", color: "from-indigo-500 to-purple-600", grades: [1,2,3,4,5,6,7,8,9,10,11] },
  { name: "Математика", emoji: "➗", color: "from-orange-500 to-amber-600", grades: [1,2,3,4,5,6] },
  { name: "Алгебра", emoji: "🧮", color: "from-amber-500 to-orange-600", grades: [7,8,9,10,11] },
  { name: "Геометрия", emoji: "📐", color: "from-yellow-500 to-amber-600", grades: [7,8,9,10,11] },
  { name: "Жаратылыстану", emoji: "🌱", color: "from-emerald-500 to-green-600", grades: [5,6] },
  { name: "Биология", emoji: "🧬", color: "from-green-500 to-emerald-600", grades: [7,8,9,10,11] },
  { name: "Физика", emoji: "⚛️", color: "from-cyan-500 to-blue-600", grades: [7,8,9,10,11] },
  { name: "Химия", emoji: "🧪", color: "from-teal-500 to-cyan-600", grades: [7,8,9,10,11] },
  { name: "География", emoji: "🌍", color: "from-lime-500 to-green-600", grades: [7,8,9,10,11] },
  { name: "Қазақстан тарихы", emoji: "🏛️", color: "from-yellow-600 to-orange-600", grades: [5,6,7,8,9,10,11] },
  { name: "Дүниежүзі тарихы", emoji: "🌐", color: "from-purple-500 to-pink-600", grades: [5,6,7,8,9,10,11] },
  { name: "Информатика", emoji: "💻", color: "from-slate-600 to-gray-700", grades: [2,3,4,5,6,7,8,9,10,11] },
  { name: "Көркем еңбек", emoji: "🎨", color: "from-pink-500 to-rose-600", grades: [1,2,3,4,5,6,7,8,9] },
  { name: "Музыка", emoji: "🎵", color: "from-fuchsia-500 to-purple-600", grades: [1,2,3,4,5,6,7] },
  { name: "Дене шынықтыру", emoji: "⚽", color: "from-red-500 to-orange-600", grades: [1,2,3,4,5,6,7,8,9,10,11] },
  { name: "АӘД", emoji: "🛡️", color: "from-gray-600 to-slate-700", grades: [10,11] },
  { name: "Құқық негіздері", emoji: "⚖️", color: "from-indigo-600 to-blue-700", grades: [9,10,11] },
  { name: "Кәсіпкерлік және бизнес негіздері", emoji: "💼", color: "from-emerald-600 to-teal-700", grades: [10,11] },
];

export default function SubjectsCatalogPage() {
  const navigate = useNavigate();
  const { subject, grade } = useParams();
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState<number | null>(null);

  const filtered = useMemo(() => SUBJECTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterGrade === null || s.grades.includes(filterGrade))
  ), [search, filterGrade]);

  // Topics view
  if (subject && grade) {
    const subj = SUBJECTS.find(s => s.name === decodeURIComponent(subject));
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="h-4 w-4"/>Артқа</Button>
        <div className={`rounded-2xl p-6 bg-gradient-to-br ${subj?.color || "from-blue-500 to-purple-600"} text-white shadow-xl`}>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{subj?.emoji}</div>
            <div>
              <h1 className="text-2xl font-bold">{subj?.name}</h1>
              <p className="text-white/85">{grade} сынып • Оқу бағдарламасы</p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">Бөлімдер мен тақырыптар</h2>
            <p className="text-sm text-muted-foreground">ҚР МЖМБС стандартына сәйкес автоматты түрде ЖИ арқылы құрылатын оқу бағдарламасы.</p>
            <div className="grid gap-3">
              {["I тоқсан — Кіріспе бөлім", "II тоқсан — Негізгі ұғымдар", "III тоқсан — Тереңдетілген тақырыптар", "IV тоқсан — Қайталау мен жинақтау"].map((sec, i) => (
                <div key={i} className="rounded-xl border bg-card p-4 hover:shadow-md transition">
                  <p className="font-medium">{sec}</p>
                  <p className="text-xs text-muted-foreground mt-1">8-12 сабақ • БЖБ/ТЖБ кіреді</p>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600" onClick={() => navigate("/teacher/curriculum-ai")}>
              <Sparkles className="h-4 w-4 mr-2"/>ЖИ арқылы ҚМЖ/КТЖ жасау
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Grades for selected subject
  if (subject) {
    const subj = SUBJECTS.find(s => s.name === decodeURIComponent(subject));
    if (!subj) return <div>Пән табылмады</div>;
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="h-4 w-4"/>Барлық пәндер</Button>
        <div className={`rounded-2xl p-6 bg-gradient-to-br ${subj.color} text-white shadow-xl`}>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{subj.emoji}</div>
            <div>
              <h1 className="text-2xl font-bold">{subj.name}</h1>
              <p className="text-white/85">{subj.grades.length} сыныпта оқытылады</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {subj.grades.map(g => (
            <Card key={g} className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition group" onClick={() => navigate(`${g}`)}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{g}</p>
                  <p className="text-xs text-muted-foreground">сынып</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition"/>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Catalog
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur"><BookOpen className="h-7 w-7"/></div>
          <div>
            <h1 className="text-2xl font-bold">Пәндер каталогы</h1>
            <p className="text-white/85 text-sm">Барлық мектеп пәндері мен оқу бағдарламалары</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пән іздеу…" className="pl-10"/>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant={filterGrade === null ? "default" : "outline"} onClick={() => setFilterGrade(null)}>Барлығы</Button>
          {[1,2,3,4,5,6,7,8,9,10,11].map(g => (
            <Button key={g} size="sm" variant={filterGrade === g ? "default" : "outline"} onClick={() => setFilterGrade(g)}>{g}</Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(s => (
          <Card key={s.name} className="cursor-pointer overflow-hidden hover:shadow-xl hover:-translate-y-1 transition group" onClick={() => navigate(encodeURIComponent(s.name))}>
            <div className={`h-2 bg-gradient-to-r ${s.color}`}/>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="text-4xl">{s.emoji}</div>
                <Badge variant="outline" className="text-xs">{s.grades.length} сынып</Badge>
              </div>
              <h3 className="font-semibold leading-snug">{s.name}</h3>
              <div className="flex flex-wrap gap-1">
                {s.grades.slice(0,6).map(g => <span key={g} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{g}</span>)}
                {s.grades.length > 6 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{s.grades.length-6}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">Пән табылмады</p>}
    </div>
  );
}
