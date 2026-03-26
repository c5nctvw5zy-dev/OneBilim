import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

interface Application {
  id: string;
  school_name: string;
  bin: string | null;
  school_type: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  director_name: string | null;
  director_iin: string | null;
  director_phone: string | null;
  director_email: string | null;
  status: string;
  review_note: string | null;
  created_at: string;
}

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Жаңа", className: "bg-warning/10 text-warning" },
  reviewing: { label: "Қаралуда", className: "bg-primary/10 text-primary" },
  approved: { label: "Мақұлданды", className: "bg-success/10 text-success" },
  rejected: { label: "Қабылданбады", className: "bg-destructive/10 text-destructive" },
};

export default function SuperAdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setApplications(data);
    if (error) toast({ title: "Қате", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  const handleApprove = async (app: Application) => {
    setProcessing(app.id);
    // 1. Update application status
    const { error: updateErr } = await supabase
      .from("applications")
      .update({ status: "approved", review_note: reviewNote || null })
      .eq("id", app.id);

    if (updateErr) {
      toast({ title: "Қате", description: updateErr.message, variant: "destructive" });
      setProcessing(null);
      return;
    }

    // 2. Create school record
    const { error: schoolErr } = await supabase.from("schools").insert({
      name: app.school_name,
      bin: app.bin,
      school_type: app.school_type,
      region: app.region,
      city: app.city,
      address: app.address,
      phone: app.phone,
      email: app.email,
      status: "approved",
    });

    if (schoolErr) {
      toast({ title: "Мектеп құру қатесі", description: schoolErr.message, variant: "destructive" });
    }

    toast({ title: "Өтінім мақұлданды!", description: `${app.school_name} жүйеге қосылды.` });
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "approved", review_note: reviewNote } : a));
    setProcessing(null);
    setExpandedId(null);
    setReviewNote("");
  };

  const handleReject = async (app: Application) => {
    setProcessing(app.id);
    const { error } = await supabase
      .from("applications")
      .update({ status: "rejected", review_note: reviewNote || null })
      .eq("id", app.id);

    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Өтінім қабылданбады" });
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "rejected", review_note: reviewNote } : a));
    }
    setProcessing(null);
    setExpandedId(null);
    setReviewNote("");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const pendingCount = applications.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Өтінімдер</h2>
        {pendingCount > 0 && (
          <span className="rounded-full bg-warning/10 px-3 py-1 text-sm font-medium text-warning">
            {pendingCount} жаңа өтінім
          </span>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Өтінімдер жоқ
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const st = statusMap[app.status] || statusMap.pending;
            const isExpanded = expandedId === app.id;
            const isPending = app.status === "pending" || app.status === "reviewing";
            return (
              <div key={app.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{app.school_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {app.city}{app.region ? `, ${app.region}` : ""} · {app.director_name || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString("kk-KZ")} · {app.director_email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${st.className}`}>{st.label}</span>
                      <Button size="sm" variant="ghost" onClick={() => { setExpandedId(isExpanded ? null : app.id); setReviewNote(app.review_note || ""); }}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border bg-muted/30 p-5 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div><span className="text-muted-foreground">БИН:</span> <span className="font-medium">{app.bin || "—"}</span></div>
                      <div><span className="text-muted-foreground">Түрі:</span> <span className="font-medium">{app.school_type || "—"}</span></div>
                      <div><span className="text-muted-foreground">Мекенжай:</span> <span className="font-medium">{app.address || "—"}</span></div>
                      <div><span className="text-muted-foreground">Телефон:</span> <span className="font-medium">{app.phone || "—"}</span></div>
                      <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{app.email || "—"}</span></div>
                      <div><span className="text-muted-foreground">Директор ЖСН:</span> <span className="font-medium">{app.director_iin || "—"}</span></div>
                      <div><span className="text-muted-foreground">Директор тел:</span> <span className="font-medium">{app.director_phone || "—"}</span></div>
                    </div>

                    {isPending && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Ескертпе (міндетті емес)..."
                          value={reviewNote}
                          onChange={e => setReviewNote(e.target.value)}
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            className="gap-1"
                            disabled={processing === app.id}
                            onClick={() => handleApprove(app)}
                          >
                            {processing === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Мақұлдау
                          </Button>
                          <Button
                            variant="destructive"
                            className="gap-1"
                            disabled={processing === app.id}
                            onClick={() => handleReject(app)}
                          >
                            <X className="h-3.5 w-3.5" /> Қабылдамау
                          </Button>
                        </div>
                      </div>
                    )}

                    {app.review_note && !isPending && (
                      <div className="rounded-lg bg-muted p-3 text-sm">
                        <span className="text-muted-foreground">Ескертпе: </span>{app.review_note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
