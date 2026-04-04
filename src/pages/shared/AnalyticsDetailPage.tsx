import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, BarChart3, Users } from "lucide-react";
import StatCard from "@/components/StatCard";

const topClasses = [
  { name: "11А", avg: 4.6, students: 28 },
  { name: "10А", avg: 4.4, students: 30 },
  { name: "9А", avg: 4.1, students: 32 },
  { name: "10Б", avg: 4.0, students: 29 },
  { name: "11Б", avg: 3.7, students: 27 },
];

const topSubjects = [
  { name: "Дене шынықтыру", avg: 4.8 },
  { name: "Информатика", avg: 4.5 },
  { name: "Қазақ тілі", avg: 4.1 },
  { name: "Математика", avg: 3.9 },
  { name: "Физика", avg: 3.7 },
];

const topTeachers = [
  { name: "Ахметова С.", subject: "Қазақ тілі", avg: 4.6, students: 120 },
  { name: "Сейітов Қ.", subject: "Математика", avg: 4.4, students: 150 },
  { name: "Смайлова Д.", subject: "Ағылшын тілі", avg: 4.3, students: 90 },
  { name: "Тұрсынов А.", subject: "Информатика", avg: 4.5, students: 80 },
  { name: "Мұхтаров Е.", subject: "Физика", avg: 4.0, students: 100 },
];

export default function AnalyticsDetailPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Мектеп сапасы" value="72%" icon={Trophy} color="blue" />
        <StatCard title="Орташа балл" value="4.1" icon={BarChart3} color="green" />
        <StatCard title="Жалпы оқушы" value={840} icon={Users} color="orange" />
        <StatCard title="Жалпы мұғалім" value={62} icon={Award} color="blue" />
      </div>

      <Tabs defaultValue="classes">
        <TabsList>
          <TabsTrigger value="classes"><Trophy className="h-4 w-4 mr-1" /> Сыныптар сапасы</TabsTrigger>
          <TabsTrigger value="subjects"><BarChart3 className="h-4 w-4 mr-1" /> Пәндер рейтингі</TabsTrigger>
          <TabsTrigger value="teachers"><Users className="h-4 w-4 mr-1" /> Мұғалімдер рейтингі</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">🥇 ТОП сыныптар</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topClasses.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{c.name} сынып</p>
                      <p className="text-xs text-muted-foreground">{c.students} оқушы</p>
                    </div>
                    <Badge variant={c.avg >= 4.0 ? "default" : "secondary"}>{c.avg}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">📊 Пәндер рейтингі</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topSubjects.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
                    <span className="text-sm font-medium text-foreground flex-1">{s.name}</span>
                    <Badge variant={s.avg >= 4.0 ? "default" : "secondary"}>{s.avg}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">👨‍🏫 ТОП мұғалімдер</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTeachers.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.subject} · {t.students} оқушы</p>
                    </div>
                    <Badge variant="default">{t.avg}</Badge>
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
