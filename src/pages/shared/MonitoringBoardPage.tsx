import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, AlertTriangle } from "lucide-react";

const subjectHours = [
  { name: "Математика", total: 136, done: 98, remaining: 38 },
  { name: "Қазақ тілі", total: 102, done: 72, remaining: 30 },
  { name: "Физика", total: 68, done: 45, remaining: 23 },
  { name: "Химия", total: 68, done: 50, remaining: 18 },
  { name: "Биология", total: 68, done: 48, remaining: 20 },
  { name: "Тарих", total: 68, done: 52, remaining: 16 },
  { name: "Ағылшын тілі", total: 102, done: 70, remaining: 32 },
  { name: "Информатика", total: 34, done: 24, remaining: 10 },
];

export default function MonitoringBoardPage() {
  const totalAll = subjectHours.reduce((s, h) => s + h.total, 0);
  const doneAll = subjectHours.reduce((s, h) => s + h.done, 0);
  const remainAll = totalAll - doneAll;
  const pct = Math.round((doneAll / totalAll) * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">📘 Жалпы сағаттар</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-foreground">{totalAll}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">📗 Өткен сағаттар</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-success">{doneAll}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">📕 Қалған сағаттар</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-destructive">{remainAll}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Жалпы прогресс</CardTitle></CardHeader>
        <CardContent>
          <Progress value={pct} className="h-3" />
          <p className="mt-2 text-sm text-muted-foreground">{pct}% аяқталды</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-5 w-5" /> Пән бойынша сағаттар</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subjectHours.map((s) => {
              const sp = Math.round((s.done / s.total) * 100);
              const warning = s.remaining < 20;
              return (
                <div key={s.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{s.name}</span>
                      {warning && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{s.done}/{s.total}</Badge>
                      <span className="text-xs text-muted-foreground">қалды: {s.remaining}</span>
                    </div>
                  </div>
                  <Progress value={sp} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
