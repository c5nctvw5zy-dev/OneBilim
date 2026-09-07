import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, Trash2, Plus, Loader2, PenTool, Check, RotateCcw, Archive } from "lucide-react";
import { logAction } from "@/lib/activity";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

function SignatureImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase.storage.from("signatures").createSignedUrl(path, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl);
    });
  }, [path]);
  if (!url) return null;
  return <img src={url} alt="Қол" className="h-8 mt-1" />;
}

export default function DocumentsPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [docs, setDocs] = useState<any[]>([]);
  const [tab, setTab] = useState<"active" | "trash">("active");
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showSign, setShowSign] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ҚМЖ");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const canManage = role === "zavuch" || role === "director";
  const canUpload = role === "teacher" || canManage;

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user!.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    setProfileId(prof.id);
    setSchoolId(prof.school_id);

    // 30 күннен асқан себет құжаттарын толық жою
    const cutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data: expired } = await (supabase as any)
      .from("documents").select("id, file_url").eq("school_id", prof.school_id).lt("deleted_at", cutoff);
    if (expired && expired.length) {
      const paths = expired.map((d: any) => d.file_url).filter(Boolean);
      if (paths.length) await supabase.storage.from("documents").remove(paths);
      await supabase.from("documents").delete().in("id", expired.map((d: any) => d.id));
    }

    const { data } = await supabase.from("documents").select("*, uploader:uploaded_by(full_name), signer:signed_by(full_name)").eq("school_id", prof.school_id).order("created_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!file || !title || !profileId || !schoolId) { toast({ title: "Толтырыңыз", variant: "destructive" }); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${schoolId}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("documents").upload(path, file);
    if (uploadErr) { toast({ title: "Қате", description: uploadErr.message, variant: "destructive" }); setUploading(false); return; }

    const { error } = await supabase.from("documents").insert({
      title, category, file_url: path, file_name: file.name,
      file_size: `${(file.size / 1024).toFixed(0)} KB`,
      uploaded_by: profileId, school_id: schoolId, status: "pending",
    });
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Құжат жүктелді!" }); }
    setShowUpload(false); setTitle(""); setFile(null);
    setUploading(false);
    loadData();
  };

  // Себетке жіберу (30 күн сақталады)
  const handleDelete = async (id: string) => {
    const deletedAt = new Date().toISOString();
    const { error } = await (supabase as any).from("documents").update({ deleted_at: deletedAt }).eq("id", id);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    setDocs(p => p.map(d => (d.id === id ? { ...d, deleted_at: deletedAt } : d)));
    await logAction("document_trashed", { targetType: "document", targetId: id });
    toast({ title: "Себетке жіберілді", description: "30 күн ішінде қайтаруға болады." });
  };

  const handleRestore = async (id: string) => {
    const { error } = await (supabase as any).from("documents").update({ deleted_at: null }).eq("id", id);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    setDocs(p => p.map(d => (d.id === id ? { ...d, deleted_at: null } : d)));
    await logAction("document_restored", { targetType: "document", targetId: id });
    toast({ title: "Қайтарылды" });
  };

  const handlePurge = async (doc: any) => {
    if (!confirm("Құжат толық жойылады. Растайсыз ба?")) return;
    if (doc.file_url) await supabase.storage.from("documents").remove([doc.file_url]);
    await supabase.from("documents").delete().eq("id", doc.id);
    setDocs(p => p.filter(d => d.id !== doc.id));
    await logAction("document_deleted", { targetType: "document", targetId: doc.id });
    toast({ title: "Толық жойылды" });
  };

  const daysLeft = (deletedAt: string) =>
    Math.max(0, 30 - Math.floor((Date.now() - new Date(deletedAt).getTime()) / 86400000));

  // Canvas signature
  const startDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [isDrawing]);

  const stopDraw = useCallback(() => setIsDrawing(false), []);

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
  };

  const handleSign = async (docId: string) => {
    if (!canvasRef.current || !profileId || !schoolId) return;
    const blob = await new Promise<Blob | null>(r => canvasRef.current!.toBlob(r, "image/png"));
    if (!blob) return;
    const path = `${schoolId}/sign_${Date.now()}.png`;
    const { error: upErr } = await supabase.storage.from("signatures").upload(path, blob);
    if (upErr) { toast({ title: "Қате", description: upErr.message, variant: "destructive" }); return; }

    await supabase.from("documents").update({ status: "signed", signed_by: profileId, signature_url: path, signed_at: new Date().toISOString() }).eq("id", docId);
    toast({ title: "Қол қойылды!" });
    setShowSign(null);
    loadData();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const categoryColors: Record<string, string> = { "ҚМЖ": "bg-primary/10 text-primary", "КТЖ": "bg-warning/10 text-warning", "Жоспар": "bg-success/10 text-success", "Тізім": "bg-muted text-muted-foreground" };
  const statusLabels: Record<string, { label: string; cls: string }> = {
    pending: { label: "Тексерілмеген", cls: "bg-warning/10 text-warning" },
    signed: { label: "Қол қойылған", cls: "bg-success/10 text-success" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Құжаттар</h2>
        {canUpload && (
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Құжат жүктеу</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Құжат жүктеу</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Атауы" value={title} onChange={e => setTitle(e.target.value)} />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["ҚМЖ", "КТЖ", "Жоспар", "Тізім", "Жалпы"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div>
                  <input ref={fileRef} type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                  <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
                    {file ? file.name : "Файл таңдау"}
                  </Button>
                </div>
                <Button className="w-full" onClick={handleUpload} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Жүктеу
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "active" ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setTab("active")}>
          <FileText className="h-4 w-4" /> Құжаттар ({activeDocs.length})
        </Button>
        <Button variant={tab === "trash" ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setTab("trash")}>
          <Archive className="h-4 w-4" /> Себет ({trashDocs.length})
        </Button>
      </div>

      {visibleDocs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          {tab === "trash" ? "Себет бос" : "Құжаттар жоқ"}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleDocs.map(d => {
            const st = statusLabels[d.status] || statusLabels.pending;
            return (
              <div key={d.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[d.category] || "bg-muted text-muted-foreground"}`}>{d.category}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
                        <span className="text-xs text-muted-foreground">{d.file_size}</span>
                        {d.uploader?.full_name && <span className="text-xs text-muted-foreground">{d.uploader.full_name}</span>}
                      </div>
                      {d.status === "signed" && d.signer?.full_name && (
                        <p className="text-xs text-success mt-1">✓ {d.signer.full_name} қол қойды</p>
                      )}
                      {d.signature_url && (
                        <SignatureImage path={d.signature_url} />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {d.file_url && (
                      <Button variant="ghost" size="icon" onClick={async () => {
                        const { data } = await supabase.storage.from("documents").createSignedUrl(d.file_url, 3600);
                        if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                      }}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {canManage && d.status === "pending" && (
                      <Dialog open={showSign === d.id} onOpenChange={v => { setShowSign(v ? d.id : null); if (!v) clearCanvas(); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1"><PenTool className="h-3.5 w-3.5" /> Қол қою</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Онлайн қол қою</DialogTitle></DialogHeader>
                          <p className="text-sm text-muted-foreground">Мышкамен қол қойыңыз:</p>
                          <canvas
                            ref={canvasRef}
                            width={400}
                            height={150}
                            className="border border-border rounded-lg w-full cursor-crosshair bg-white"
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={stopDraw}
                            onMouseLeave={stopDraw}
                          />
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={clearCanvas}>Тазалау</Button>
                            <Button className="flex-1 gap-2" onClick={() => handleSign(d.id)}><Check className="h-4 w-4" /> Қол қою</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {canManage && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
