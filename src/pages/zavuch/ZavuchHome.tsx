import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Home, Calendar, FileCheck, BookOpen, ClipboardList } from "lucide-react";

export default function ZavuchHome() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Сыныптар" value={12} icon={Home} color="blue" />
        <StatCard title="Мұғалімдер" value={28} icon={BookOpen} color="green" />
        <StatCard title="Тексерілмеген құжаттар" value={5} icon={FileCheck} color="orange" />
        <StatCard title="Бүгінгі сабақтар" value={42} icon={Calendar} color="blue" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Жылдам әрекеттер</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2"><Calendar className="h-4 w-4" /> Кестені тексеру</Button>
            <Button variant="outline" className="w-full justify-start gap-2"><FileCheck className="h-4 w-4" /> Құжаттарға қол қою</Button>
            <Button variant="outline" className="w-full justify-start gap-2"><ClipboardList className="h-4 w-4" /> Журнал мониторинг қарау</Button>
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Хабарламалар</h3>
          <div className="space-y-3">
            {[
              { text: "5А сынып журналы толтырылмаған", time: "1 сағат бұрын" },
              { text: "Математика мұғалімі құжат жүктеді", time: "3 сағат бұрын" },
              { text: "Жаңа кесте бекітілді", time: "Кеше" },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-foreground">{a.text}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
