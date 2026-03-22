import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SuperAdminSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Баптаулар</h2>
      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Жүйелік параметрлер</h3>
          <div className="space-y-2">
            <Label>Платформа атауы</Label>
            <Input defaultValue="BilimApp" />
          </div>
          <div className="space-y-2">
            <Label>Қолдау email</Label>
            <Input defaultValue="support@bilimapp.kz" />
          </div>
          <Button>Сақтау</Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Қауіпсіздік</h3>
          <div className="space-y-2">
            <Label>Сессия мерзімі (минут)</Label>
            <Input type="number" defaultValue="60" />
          </div>
          <Button>Жаңарту</Button>
        </div>
      </div>
    </div>
  );
}
