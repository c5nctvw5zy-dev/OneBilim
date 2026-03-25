import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const classes = ["9А", "9Б", "10А", "10Б", "11А", "11Б"];
const subjects = ["Математика", "Физика", "Қазақ тілі", "Ағылшын тілі", "Химия", "Биология"];

const studentsByClass: Record<string, string[]> = {
  "9А": ["Назарбекова Айым", "Қасымова Дана", "Мұхтаров Елдос", "Байжанова Мадина", "Сейітов Арман"],
  "9Б": ["Жұмабаев Бексұлтан", "Ахметов Дастан", "Тұрсынова Аяна", "Серікболов Нұрлан", "Қалиева Жансая"],
  "10А": ["Бекболатов Алмас", "Сағындықова Дина", "Мұхамедов Ернар", "Оспанова Мөлдір", "Тұрсынов Бақтияр"],
  "10Б": ["Ақылбекова Гүлнұр", "Жұмағалиев Ерасыл", "Байғабылова Нұрай", "Сәрсенбаев Алдияр", "Қожахметова Аружан"],
  "11А": ["Исаева Дария", "Нұрланов Тимур", "Әбдірахманова Камила", "Бейсенов Санжар", "Тілеуберді Аяла"],
  "11Б": ["Қонысбаев Ернұр", "Мәдиева Ақерке", "Тұрғынбаев Абылай", "Сапарова Жібек", "Нұрмұхамедов Дәулет"],
};

const dates = ["18.03", "19.03", "20.03", "21.03", "22.03", "25.03"];

export default function JournalPage() {
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const students = studentsByClass[selectedClass] || [];
  const { toast } = useToast();

  // Initialize grades with random values
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>(() => {
    const g: Record<string, Record<string, string>> = {};
    students.forEach(s => {
      g[s] = {};
      dates.forEach(d => {
        g[s][d] = Math.random() > 0.2 ? String(Math.floor(Math.random() * 3) + 3) : "";
      });
    });
    return g;
  });

  const handleGradeChange = (student: string, date: string, value: string) => {
    if (value && !/^[2-5]$/.test(value)) return;
    setGrades(prev => ({
      ...prev,
      [student]: { ...prev[student], [date]: value },
    }));
  };

  const handleSave = () => {
    toast({ title: "Журнал сақталды!", description: `${selectedClass} сыныбы, ${selectedSubject} пәні` });
  };

  // Re-init grades when class changes
  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    const newStudents = studentsByClass[cls] || [];
    const g: Record<string, Record<string, string>> = {};
    newStudents.forEach(s => {
      g[s] = {};
      dates.forEach(d => {
        g[s][d] = Math.random() > 0.2 ? String(Math.floor(Math.random() * 3) + 3) : "";
      });
    });
    setGrades(g);
  };

  const currentStudents = studentsByClass[selectedClass] || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Электронды журнал</h2>

      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Сынып</label>
          <div className="flex gap-1">
            {classes.map(c => (
              <button
                key={c}
                onClick={() => handleClassChange(c)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedClass === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Пән</label>
          <div className="flex gap-1 flex-wrap">
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedSubject === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground sticky left-0 bg-muted/50">Оқушы</th>
              {dates.map(d => (
                <th key={d} className="px-2 py-3 text-center font-medium text-muted-foreground w-14">{d}</th>
              ))}
              <th className="px-3 py-3 text-center font-medium text-muted-foreground">Орт.</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map(student => {
              const studentGrades = grades[student] || {};
              const numericGrades = dates.map(d => parseInt(studentGrades[d])).filter(n => !isNaN(n));
              const avg = numericGrades.length ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(1) : "—";
              return (
                <tr key={student} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-medium text-foreground text-xs sticky left-0 bg-card">{student}</td>
                  {dates.map(d => (
                    <td key={d} className="px-1 py-1 text-center">
                      <input
                        value={studentGrades[d] || ""}
                        onChange={e => handleGradeChange(student, d, e.target.value)}
                        className={`w-10 h-8 text-center rounded-md border text-sm font-bold outline-none transition-colors ${
                          studentGrades[d] === "5" ? "bg-success/10 text-success border-success/30" :
                          studentGrades[d] === "4" ? "bg-primary/10 text-primary border-primary/30" :
                          studentGrades[d] === "3" ? "bg-warning/10 text-warning border-warning/30" :
                          studentGrades[d] === "2" ? "bg-destructive/10 text-destructive border-destructive/30" :
                          "border-border bg-background text-foreground"
                        } focus:ring-2 focus:ring-primary/30`}
                        maxLength={1}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <span className={`text-sm font-bold ${
                      parseFloat(avg as string) >= 4.5 ? "text-success" : parseFloat(avg as string) >= 3.5 ? "text-primary" : "text-warning"
                    }`}>{avg}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">Журналды сақтау</Button>
      </div>
    </div>
  );
}
