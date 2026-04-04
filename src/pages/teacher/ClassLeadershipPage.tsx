import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Phone, CheckCircle, FileText, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const students = [
  { id: 1, name: "Назарбекова Айым", gender: "Қыз", phone: "+7 701 123 4567", parent: "Назарбеков Б.", parentPhone: "+7 702 234 5678", attendance: 96 },
  { id: 2, name: "Сейітов Арман", gender: "Ұл", phone: "+7 705 345 6789", parent: "Сейітова Г.", parentPhone: "+7 700 456 7890", attendance: 92 },
  { id: 3, name: "Қасымова Дана", gender: "Қыз", phone: "+7 707 567 8901", parent: "Қасымов А.", parentPhone: "+7 701 678 9012", attendance: 98 },
  { id: 4, name: "Мұхтаров Елдос", gender: "Ұл", phone: "+7 708 789 0123", parent: "Мұхтарова Д.", parentPhone: "+7 702 890 1234", attendance: 88 },
  { id: 5, name: "Байжанова Мадина", gender: "Қыз", phone: "+7 700 901 2345", parent: "Байжанов К.", parentPhone: "+7 705 012 3456", attendance: 95 },
  { id: 6, name: "Тұрсынов Асқар", gender: "Ұл", phone: "+7 701 234 5678", parent: "Тұрсынова Л.", parentPhone: "+7 707 345 6789", attendance: 90 },
];

export default function ClassLeadershipPage() {
  const [groupBy, setGroupBy] = useState<string>("alphabet");

  const sortedStudents = [...students].sort((a, b) => {
    if (groupBy === "gender") return a.gender.localeCompare(b.gender);
    if (groupBy === "count") return a.id - b.id;
    return a.name.localeCompare(b.name);
  });

  const grouped = groupBy === "gender"
    ? { "Қыз": sortedStudents.filter((s) => s.gender === "Қыз"), "Ұл": sortedStudents.filter((s) => s.gender === "Ұл") }
    : { "Барлығы": sortedStudents };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students"><Users className="h-4 w-4 mr-1" /> Оқушылар</TabsTrigger>
          <TabsTrigger value="parents"><Phone className="h-4 w-4 mr-1" /> Ата-аналар</TabsTrigger>
          <TabsTrigger value="attendance"><CheckCircle className="h-4 w-4 mr-1" /> Қатысу</TabsTrigger>
          <TabsTrigger value="character"><FileText className="h-4 w-4 mr-1" /> Мінездеме</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Label className="text-sm">Топқа бөлу:</Label>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabet">Алфавит бойынша</SelectItem>
                <SelectItem value="count">Саны бойынша</SelectItem>
                <SelectItem value="gender">Қыз / Ұл</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {Object.entries(grouped).map(([group, items]) => (
            <Card key={group}>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{group} ({items.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.gender} · {s.phone}</p>
                        </div>
                      </div>
                      <Badge variant={s.attendance >= 95 ? "default" : s.attendance >= 90 ? "secondary" : "destructive"}>{s.attendance}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="parents" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.parent}</p>
                      <p className="text-xs text-muted-foreground">Бала: {s.name}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{s.parentPhone}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm text-foreground">{s.name}</span>
                    <Badge variant={s.attendance >= 95 ? "default" : s.attendance >= 90 ? "secondary" : "destructive"}>{s.attendance}% қатысу</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="character" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm text-foreground">{s.name}</span>
                    <Button variant="outline" size="sm"><FileText className="h-3.5 w-3.5 mr-1" /> Мінездеме жазу</Button>
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
