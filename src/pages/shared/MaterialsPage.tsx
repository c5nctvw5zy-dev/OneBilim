import { useState, useEffect, useRef } from "react";
import { FileText, Video, Download, Plus, Loader2, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function MaterialsPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isTeacher = role === "teacher";

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    const { data: prof } = await supabase.from("profiles").select("id, school_id").eq("user_id", user!.id).single();
    if (!prof?.school_id) { setLoading(false); return; }
    setProfileId(prof.id);
    setSchoolId(prof.school_id);
    const [{ data: mats }, { data: subs }] = await Promise.all([
      supabase.from("materials").select("*, subjects:subject_id(name), uploader:uploaded_by(full_name)").eq("school_id", prof.school_id).order("created_at", { ascending: false }),
      supabase.from("subjects").select("id, name"),
    ]);
    setMaterials(mats || []);
    setSubjects(subs || []);
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!file || !title || !profileId || !schoolId) { toast({ title: "Толтырыңыз", variant: "destructive" }); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${schoolId}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("materials").upload(path, file);
    if (uploadErr) { toast({ title: "Файл жүктеу қатесі", description: uploadErr.message, variant: "destructive" }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("materials").getPublicUrl(path);

    const { error } = await supabase.from("materials").insert({
      title, subject_id: subjectId || null, file_url: publicUrl, file_name: file.name,
      file_type: ext?.toUpperCase() || "FILE", file_size: `${(file.size / 1024).toFixed(0)} KB`,
      uploaded_by: profileId, school_id: schoolId,
    });
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Материал жүктелді!" }); }
    setShowUpload(false); setTitle(""); setSubjectId(""); setFile(null);
    setUploading(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("materials").delete().eq("id", id);
    setMaterials(p => p.filter(m => m.id !== id));
    toast({ title: "Жойылды" });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const typeColors: Record<string, string> = { PDF: "bg-destructive/10 text-destructive", DOCX: "bg-primary/10 text-primary", PPTX: "bg-warning/10 text-warning", XLSX: "bg-success/10 text-success" };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Материалдар</h2>
        {isTeacher && (
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Материал жүктеу</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Материал жүктеу</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Атауы" value={title} onChange={e => setTitle(e.target.value)} />
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger><SelectValue placeholder="Пән (міндетті емес)" /></SelectTrigger>
                  <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
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
      {materials.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">Материалдар жоқ</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map(m => (
            <div key={m.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[m.file_type] || "bg-muted text-muted-foreground"}`}>{m.file_type || "FILE"}</span>
                    <span className="text-xs text-muted-foreground">{m.file_size}</span>
                  </div>
                  {m.subjects?.name && <p className="text-xs text-muted-foreground mt-1">{m.subjects.name}</p>}
                  {m.uploader?.full_name && <p className="text-xs text-muted-foreground">{m.uploader.full_name}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {m.file_url && (
                  <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                    <a href={m.file_url} target="_blank" rel="noopener"><Download className="h-3.5 w-3.5" /> Жүктеу</a>
                  </Button>
                )}
                {isTeacher && (
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
