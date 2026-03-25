import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { BarChart3, CheckCircle, ClipboardList, Calendar } from "lucide-react";

export default function ParentHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="cursor-pointer" onClick={() => navigate("/parent/grades")}><StatCard title="Орташа балл" value="4.3" icon={BarChart3} color="blue" /></div>
        <div className="cursor-pointer" onClick={() => navigate("/parent/attendance")}><StatCard title="Қатысу %" value="96%" icon={CheckCircle} color="green" /></div>
        <div className="cursor-pointer" onClick={() => navigate("/parent/homework")}><StatCard title="Тапсырмалар" value={2} icon={ClipboardList} color="orange" /></div>
        <div className="cursor-pointer" onClick={() => navigate("/parent/schedule")}><StatCard title="Бүгінгі сабақтар" value={7} icon={Calendar} color="blue" /></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Баланың үлгерімі</h3>
          <div className="space-y-2">
            {[
              { subject: "Математика", avg: "4.5", trend: "↑" },
              { subject: "Қазақ тілі", avg: "4.0", trend: "→" },
              { subject: "Физика", avg: "4.8", trend: "↑" },
              { subject: "Ағылшын тілі", avg: "3.8", trend: "↓" },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate("/parent/grades")}>
                <span className="text-sm text-foreground">{s.subject}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">{s.avg}</span>
                  <span className={`text-sm ${s.trend === "↑" ? "text-success" : s.trend === "↓" ? "text-destructive" : "text-muted-foreground"}`}>{s.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Хабарламалар</h3>
          <div className="space-y-2">
            {[
              { text: "Ағылшын тілі мұғалімінен хабар", time: "2 сағат бұрын" },
              { text: "Баланың қатысу есебі жаңартылды", time: "Кеше" },
              { text: "Ата-аналар жиналысы: 28.03", time: "3 күн бұрын" },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate("/parent/messages")}>
                <span className="text-sm text-foreground">{n.text}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
