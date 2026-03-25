import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminSettings() {
  const { toast } = useToast();
  const [platformName, setPlatformName] = useState("BilimApp");
  const [supportEmail, setSupportEmail] = useState("support@bilimapp.kz");
  const [sessionTimeout, setSessionTimeout] = useState("60");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Баптаулар</h2>
      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Жүйелік параметрлер</h3>
          <div className="space-y-2">
            <Label>Платформа атауы</Label>
            <Input value={platformName} onChange={e => setPlatformName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Қолдау email</Label>
            <Input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
          </div>
          <Button onClick={() => toast({ title: "Сақталды!", description: "Жүйелік параметрлер жаңартылды." })}>Сақтау</Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Қауіпсіздік</h3>
          <div className="space-y-2">
            <Label>Сессия мерзімі (минут)</Label>
            <Input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} />
          </div>
          <Button onClick={() => toast({ title: "Жаңартылды!", description: `Сессия мерзімі: ${sessionTimeout} минут.` })}>Жаңарту</Button>
        </div>
      </div>
    </div>
  );
}
