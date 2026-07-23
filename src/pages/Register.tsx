import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ChevronRight, ChevronLeft, CheckCircle2, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const steps = ["Мектеп туралы", "Директор", "Құжаттар", "Растау"];

export default function Register() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextParam = searchParams.get("next");
  const nextQs = nextParam ? `?next=${encodeURIComponent(nextParam)}` : "";
  const [form, setForm] = useState({
    schoolName: "", bin: "", schoolType: "", region: "", city: "", address: "", phone: "", email: "",
    dirName: "", dirIIN: "", dirPhone: "", dirEmail: "",
    agreed: false,
  });

  const set = (key: string, val: string | boolean) => setForm({ ...form, [key]: val });

  const handleSubmit = async () => {
    if (!form.agreed) return;
    setSubmitting(true);
    const { error } = await supabase.from("applications").insert({
      school_name: form.schoolName,
      bin: form.bin,
      school_type: form.schoolType,
      region: form.region,
      city: form.city,
      address: form.address,
      phone: form.phone,
      email: form.email,
      director_name: form.dirName,
      director_iin: form.dirIIN,
      director_phone: form.dirPhone,
      director_email: form.dirEmail,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Қате!", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Өтінім жіберілді!", description: "1-2 жұмыс күні ішінде тексеріледі." });
    navigate("/login" + nextQs);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <GraduationCap className="h-7 w-7" /> BilimApp
          </Link>
          <Link to={"/login" + nextQs}><Button variant="ghost" size="sm">Кіру</Button></Link>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-2 text-2xl font-bold text-foreground animate-fade-in">Мектепті тіркеу</h1>
        <p className="mb-8 text-sm text-muted-foreground animate-fade-in">Анкетаны толтырып, өтінім жіберіңіз</p>

        <div className="mb-10 flex items-center gap-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                i < step ? "bg-success text-success-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-sm sm:inline ${i === step ? "font-medium text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-scale-in">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2"><Label>Мектептің толық атауы *</Label><Input value={form.schoolName} onChange={e => set("schoolName", e.target.value)} placeholder="№1 мектеп-лицей" /></div>
              <div className="space-y-2"><Label>БИН *</Label><Input value={form.bin} onChange={e => set("bin", e.target.value)} placeholder="123456789012" /></div>
              <div className="space-y-2"><Label>Мектеп түрі *</Label><Input value={form.schoolType} onChange={e => set("schoolType", e.target.value)} placeholder="Жалпы білім беретін" /></div>
              <div className="space-y-2"><Label>Облыс *</Label><Input value={form.region} onChange={e => set("region", e.target.value)} placeholder="Алматы облысы" /></div>
              <div className="space-y-2"><Label>Қала / аудан *</Label><Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Алматы" /></div>
              <div className="sm:col-span-2 space-y-2"><Label>Мекенжай *</Label><Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Абай к-сі, 12" /></div>
              <div className="space-y-2"><Label>Телефон *</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+7 (777) 123-45-67" /></div>
              <div className="space-y-2"><Label>Email *</Label><Input value={form.email} onChange={e => set("email", e.target.value)} placeholder="school@mail.kz" /></div>
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2"><Label>Аты-жөні *</Label><Input value={form.dirName} onChange={e => set("dirName", e.target.value)} placeholder="Сейтова Гүлнар Мұхтарқызы" /></div>
              <div className="space-y-2"><Label>ЖСН *</Label><Input value={form.dirIIN} onChange={e => set("dirIIN", e.target.value)} placeholder="123456789012" /></div>
              <div className="space-y-2"><Label>Телефон *</Label><Input value={form.dirPhone} onChange={e => set("dirPhone", e.target.value)} placeholder="+7 (777) 123-45-67" /></div>
              <div className="sm:col-span-2 space-y-2"><Label>Email *</Label><Input value={form.dirEmail} onChange={e => set("dirEmail", e.target.value)} /></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              {[
                { label: "Мектеп лицензиясы (PDF/JPG, 10MB)", accept: ".pdf,.jpg,.jpeg" },
                { label: "Мемлекеттік тіркеу куәлігі (PDF/JPG, 10MB)", accept: ".pdf,.jpg,.jpeg" },
                { label: "Директордың жеке куәлігі (PDF/JPG, 5MB)", accept: ".pdf,.jpg,.jpeg" },
                { label: "Мектеп мөрі (JPG/PNG, 2MB)", accept: ".jpg,.jpeg,.png" },
              ].map((doc) => (
                <div key={doc.label} className="space-y-2">
                  <Label>{doc.label}</Label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5">
                    <Upload className="h-5 w-5 shrink-0" />
                    <span>Файлды таңдаңыз</span>
                    <input type="file" accept={doc.accept} className="hidden" />
                  </label>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">* Құжаттарды жүктеу міндетті емес, кейін қоса аласыз</p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
                <p><strong>Мектеп:</strong> {form.schoolName || "—"}</p>
                <p><strong>БИН:</strong> {form.bin || "—"}</p>
                <p><strong>Облыс/Қала:</strong> {form.region}, {form.city}</p>
                <p><strong>Директор:</strong> {form.dirName || "—"}</p>
                <p><strong>Email:</strong> {form.dirEmail || "—"}</p>
              </div>
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm text-foreground">
                Өтінім 1–2 жұмыс күні ішінде тексеріледі. Нәтиже email арқылы жіберіледі.
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.agreed} onChange={e => set("agreed", e.target.checked)} className="mt-1 h-4 w-4 rounded border-border text-primary" />
                <span className="text-sm text-foreground">Қолдану шарттарымен келісемін</span>
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4" /> Артқа
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>Келесі <ChevronRight className="h-4 w-4" /></Button>
          ) : (
            <Button disabled={!form.agreed || submitting} variant="success" onClick={handleSubmit}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Өтінім жіберу
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
