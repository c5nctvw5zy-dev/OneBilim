import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, CheckCircle, FileText, TrendingUp } from "lucide-react";

const classPerformance = [
  { name: "11А", avg: 4.6, attendance: 97 },
  { name: "10А", avg: 4.4, attendance: 95 },
  { name: "10Б", avg: 4.2, attendance: 93 },
  { name: "9А", avg: 4.1, attendance: 94 },
  { name: "9Б", avg: 3.8, attendance: 89 },
  { name: "11Б", avg: 3.7, attendance: 91 },
];

const subjectRating = [
  { name: "Информатика", avg: 4.5 },
  { name: "Дене шынықтыру", avg: 4.8 },
  { name: "Қазақ тілі", avg: 4.1 },
  { name: "Математика", avg: 3.9 },
  { name: "Физика", avg: 3.7 },
  { name: "Химия", avg: 3.6 },
];

const assessmentResults = [
  { type: "БЖБ", subject: "Математика", className: "9А", avg: 16.5, max: 20, date: "2026-03-20" },
  { type: "ТЖБ", subject: "Қазақ тілі", className: "10А", avg: 22, max: 30, date: "2026-03-15" },
  { type: "БЖБ", subject: "Физика", className: "11А", avg: 18, max: 20, date: "2026-03-12" },
];

export default function PerformanceMonitoringPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="grades">
        <TabsList>
          <TabsTrigger value="grades"><BarChart3 className="h-4 w-4 mr-1" /> Сабақ үлгерімі</TabsTrigger>
          <TabsTrigger value="assessments"><FileText className="h-4 w-4 mr-1" /> БЖБ / ТЖБ</TabsTrigger>
          <TabsTrigger value="attendance"><CheckCircle className="h-4 w-4 mr-1" /> Қатысу</TabsTrigger>
          <TabsTrigger value="subjects"><TrendingUp className="h-4 w-4 mr-1" /> Пәндер рейтингі</TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Сыныптар бойынша орташа балл</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classPerformance.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                    <span className="text-sm font-medium text-foreground flex-1">{c.name}</span>
                    <Badge variant={c.avg >= 4.0 ? "default" : "destructive"}>{c.avg}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">БЖБ / ТЖБ нәтижелері</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessmentResults.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.type}: {a.subject}</p>
                      <p className="text-xs text-muted-foreground">{a.className} · {a.date}</p>
                    </div>
                    <Badge variant="outline">{a.avg}/{a.max}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Сыныптар бойынша қатысу</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classPerformance.map((c) => (
                  <div key={c.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <Badge variant={c.attendance >= 95 ? "default" : c.attendance >= 90 ? "secondary" : "destructive"}>{c.attendance}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Пәндер бойынша рейтинг</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...subjectRating].sort((a, b) => b.avg - a.avg).map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                    <span className="text-sm font-medium text-foreground flex-1">{s.name}</span>
                    <Badge variant={s.avg >= 4.0 ? "default" : "secondary"}>{s.avg}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
