import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { BarChart3, ClipboardList, Calendar, GraduationCap } from "lucide-react";

export default function StudentHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="cursor-pointer" onClick={() => navigate("/student/grades")}><StatCard title="Орташа балл" value="4.5" icon={BarChart3} color="blue" /></div>
        <div className="cursor-pointer" onClick={() => navigate("/student/homework")}><StatCard title="Тапсырмалар" value={3} icon={ClipboardList} color="orange" /></div>
        <div className="cursor-pointer" onClick={() => navigate("/student/schedule")}><StatCard title="Бүгінгі сабақтар" value={7} icon={Calendar} color="green" /></div>
        <div className="cursor-pointer" onClick={() => navigate("/student/achievements")}><StatCard title="Жетістіктер" value={12} icon={GraduationCap} color="blue" /></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Жақын тапсырмалар</h3>
          <div className="space-y-2">
            {[
              { subject: "Математика", task: "15-жаттығу", due: "Бүгін" },
              { subject: "Қазақ тілі", task: "Шығарма жазу", due: "Ертең" },
              { subject: "Физика", task: "Тест №4", due: "25.03" },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate("/student/homework")}>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.task}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.due === "Бүгін" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                  {t.due}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Хабарламалар</h3>
          <div className="space-y-2">
            {[
              { text: "Математикадан жаңа баға қойылды: 5", time: "1 сағат бұрын" },
              { text: "Физика тесті нәтижесі: 85%", time: "Кеше" },
              { text: "Кесте өзгерді: сейсенбі", time: "2 күн бұрын" },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
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
