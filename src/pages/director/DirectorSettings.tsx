import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function DirectorSettings() {
  const { toast } = useToast();
  const [schoolName, setSchoolName] = useState("№1 Мектеп-лицей");
  const [email, setEmail] = useState("info@school1.kz");
  const [phone, setPhone] = useState("+7 727 123 4567");
  const [address, setAddress] = useState("Алматы қ., Абай д-лы, 45");

  const handleSave = () => {
    toast({ title: "Сақталды!", description: "Мектеп ақпараты сәтті жаңартылды." });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Баптаулар</h2>
      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Мектеп ақпараты</h3>
          <div className="space-y-2">
            <Label>Мектеп атауы</Label>
            <Input value={schoolName} onChange={e => setSchoolName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Телефон</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Мекен-жай</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <Button onClick={handleSave}>Сақтау</Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-card-foreground">Оқу жылы</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Басталуы</Label>
              <Input type="date" defaultValue="2025-09-01" />
            </div>
            <div className="space-y-2">
              <Label>Аяқталуы</Label>
              <Input type="date" defaultValue="2026-05-25" />
            </div>
          </div>
          <Button onClick={() => toast({ title: "Жаңартылды!", description: "Оқу жылы мерзімі сақталды." })}>Жаңарту</Button>
        </div>
      </div>
    </div>
  );
}
