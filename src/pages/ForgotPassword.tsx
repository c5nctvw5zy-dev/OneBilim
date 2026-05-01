import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowLeft, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Step = "iin" | "confirm" | "done";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("iin");
  const [iin, setIin] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [tempPwd, setTempPwd] = useState("");
  const [emailOut, setEmailOut] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const lookup = async () => {
    if (!/^\d{12}$/.test(iin)) {
      toast({ title: "Қате", description: "ЖСН 12 саннан тұруы керек.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("password-recovery", {
      body: { action: "lookup", iin },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast({ title: "Табылмады", description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    setInfo(data);
    setStep("confirm");
  };

  const confirm = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("password-recovery", {
      body: { action: "confirm", iin },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast({ title: "Қате", description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    setTempPwd((data as any).temp_password);
    setEmailOut((data as any).email);
    setStep("done");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(tempPwd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-6 flex items-center justify-center gap-2 text-xl font-bold text-primary">
          <GraduationCap className="h-7 w-7" /> BilimApp
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Құпия сөзді қалпына келтіру</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Жеке сәйкестендіру нөміріңіз (ЖСН) арқылы есептік жазбаңызды табыңыз.
        </p>

        {step === "iin" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="iin">ЖСН (12 сан)</Label>
              <Input
                id="iin"
                inputMode="numeric"
                maxLength={12}
                placeholder="000000000000"
                value={iin}
                onChange={(e) => setIin(e.target.value.replace(/\D/g, ""))}
                className="h-11"
              />
            </div>
            <Button onClick={lookup} disabled={loading} className="w-full" size="lg">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Табу"}
            </Button>
          </div>
        )}

        {step === "confirm" && info && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">ЖСН:</span><span className="font-medium">{info.iin}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Аты-жөні:</span><span className="font-medium">{info.full_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Туған күні:</span><span className="font-medium">{info.birth_date || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Жынысы:</span><span className="font-medium">{info.gender || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span className="font-medium">{info.email_masked || "—"}</span></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Бұл сіздің ақпаратыңыз болса, растаңыз. Жүйе бір реттік құпия сөзді жасайды.
              Кірген соң профильден жаңа құпия сөз орнатыңыз.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("iin")} className="flex-1">Артқа</Button>
              <Button onClick={confirm} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Иә, бұл мен"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-success/30 bg-success/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-success font-medium">
                <CheckCircle2 className="h-5 w-5" /> Бір реттік құпия сөз жасалды
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Email:</div>
                <div className="font-mono font-medium">{emailOut}</div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Уақытша құпия сөз:</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-base">{tempPwd}</code>
                  <Button size="icon" variant="outline" onClick={copy}><Copy className="h-4 w-4" /></Button>
                </div>
                {copied && <p className="mt-1 text-xs text-success">Көшірілді</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                Жүйеге кірген соң профильден құпия сөзді бірден өзгертіңіз.
              </p>
            </div>
            <Button className="w-full" onClick={() => navigate("/login")}>Кіру бетіне өту</Button>
          </div>
        )}

        <Link to="/login" className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Кіру бетіне оралу
        </Link>
      </div>
    </div>
  );
}
