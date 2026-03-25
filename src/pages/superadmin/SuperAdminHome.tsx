import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { School, Users, Activity, FileText, Plus, Bell, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const recentActions = [
  { text: "№45 мектеп тіркелу өтінімін жіберді", time: "2 сағат бұрын" },
  { text: "Ахметова А. жаңа оқушылар қосты", time: "4 сағат бұрын" },
  { text: "№12 мектеп лицензиясы жаңартылды", time: "Кеше" },
  { text: "Жүйе жаңартуы орнатылды v2.4.1", time: "2 күн бұрын" },
];

export default function SuperAdminHome() {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Мектептер" value={127} icon={School} color="blue" />
        <StatCard title="Белсенді пайдаланушылар" value="4,823" icon={Users} color="green" />
        <StatCard title="Жаңа өтінімдер" value={8} icon={FileText} color="orange" />
        <StatCard title="Соңғы әрекеттер" value={342} icon={Activity} color="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Жылдам әрекеттер</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/super-admin/schools")}>
              <Plus className="h-4 w-4" /> Мектеп қосу
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/super-admin/applications")}>
              <ClipboardList className="h-4 w-4" /> Өтінімдерді қабылдау
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast({ title: "Хабарландыру жіберілді!", description: "Барлық мектептерге жаңа хабарландыру жіберілді." })}>
              <Bell className="h-4 w-4" /> Хабарландыру жіберу
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">Соңғы әрекеттер</h3>
          <div className="space-y-3">
            {recentActions.map((a, i) => (
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
