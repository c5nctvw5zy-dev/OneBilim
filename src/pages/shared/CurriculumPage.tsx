import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

const curriculum = [
  { subject: "Математика", primary: 4, secondary: 5, teacher: "Сейітов Қ." },
  { subject: "Қазақ тілі", primary: 3, secondary: 3, teacher: "Ахметова С." },
  { subject: "Орыс тілі", primary: 2, secondary: 2, teacher: "Петрова А." },
  { subject: "Ағылшын тілі", primary: 2, secondary: 3, teacher: "Смайлова Д." },
  { subject: "Физика", primary: 0, secondary: 3, teacher: "Мұхтаров Е." },
  { subject: "Химия", primary: 0, secondary: 2, teacher: "Жанұзақова Г." },
  { subject: "Биология", primary: 2, secondary: 2, teacher: "Қасымова Л." },
  { subject: "Тарих", primary: 1, secondary: 2, teacher: "Байжанов М." },
  { subject: "Информатика", primary: 1, secondary: 2, teacher: "Тұрсынов А." },
  { subject: "Дене шынықтыру", primary: 3, secondary: 3, teacher: "Ерланов Б." },
];

export default function CurriculumPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-5 w-5" /> Оқу бағдарламасы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left font-medium text-muted-foreground">Пән</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Бастауыш (сағ/апта)</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Орта сынып (сағ/апта)</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Мұғалім</th>
                </tr>
              </thead>
              <tbody>
                {curriculum.map((c) => (
                  <tr key={c.subject} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{c.subject}</td>
                    <td className="p-3 text-center">
                      {c.primary > 0 ? <Badge variant="secondary">{c.primary}</Badge> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-center"><Badge variant="outline">{c.secondary}</Badge></td>
                    <td className="p-3 text-muted-foreground">{c.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
