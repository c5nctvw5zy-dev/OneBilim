import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { BarChart3, ClipboardList, Calendar, MessageSquare } from "lucide-react";

export default function StudentHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="cursor-pointer" onClick={() => navigate("/student/schedule")}><StatCard title="Менің кестем" value={7} icon={Calendar} color="blue" /></div>
        <div className="cursor-pointer" onClick={() => navigate("/student/grades")}><StatCard title="Менің бағаларым" value="4.5" icon={BarChart3} color="green" /></div>
        <div className="cursor-pointer" onClick={() => navigate("/student/homework")}><StatCard title="Үй тапсырмасы" value={3} icon={ClipboardList} color="orange" /></div>
        <div className="cursor-pointer" onClick={() => navigate("/student/chat")}><StatCard title="Хабарламалар" value={2} icon={MessageSquare} color="blue" /></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">📅 Бүгінгі сабақтар</h3>
          <div className="space-y-2">
            {[
              { time: "08:30", subject: "Математика" },
              { time: "09:20", subject: "Қазақ тілі" },
              { time: "10:20", subject: "Физика" },
              { time: "11:10", subject: "Ағылшын тілі" },
              { time: "12:10", subject: "Тарих" },
              { time: "13:00", subject: "Дене шынықтыру" },
              { time: "13:50", subject: "Информатика" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-3">
                <span className="text-sm font-mono font-medium text-primary tabular-nums w-12">{s.time}</span>
                <span className="text-sm text-foreground">{s.subject}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-card-foreground">📝 Жақын тапсырмалар</h3>
            <div className="space-y-2">
              {[
                { subject: "Математика", task: "15-жаттығу", due: "Бүгін" },
                { subject: "Қазақ тілі", task: "Шығарма жазу", due: "Ертең" },
                { subject: "Физика", task: "Тест №4", due: "25.04" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate("/student/homework")}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">{t.task}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.due === "Бүгін" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{t.due}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-card-foreground">📊 Соңғы бағалар</h3>
            <div className="space-y-2">
              {[
                { subject: "Математика", grade: 5, date: "Бүгін" },
                { subject: "Физика", grade: 4, date: "Кеше" },
                { subject: "Қазақ тілі", grade: 5, date: "Кеше" },
              ].map((g, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm text-foreground">{g.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">{g.grade}</span>
                    <span className="text-xs text-muted-foreground">{g.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
