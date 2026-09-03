import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { setLanguage } from "@/i18n";
import ProfileSecurity from "@/components/ProfileSecurity";
import { User, Lock, Camera, Save, Eye, EyeOff, ScanFace, CheckCircle2, XCircle, Globe, ArrowRight } from "lucide-react";

const ROLE_HOME: Record<string, string> = {
  super_admin: "/superadmin", director: "/director", zavuch: "/zavuch",
  teacher: "/teacher", student: "/student", parent: "/parent",
  librarian: "/librarian", psychologist: "/psychologist",
  social_pedagogue: "/social", speech_therapist: "/speech",
  nurse: "/nurse", hr: "/hr", secretary: "/secretary",
};

export default function ProfilePage() {
  const { user, profile, role } = useAuth();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [iin, setIin] = useState(profile?.iin || "");
  const [birthDate, setBirthDate] = useState<string>((profile as any)?.birth_date || "");
  const [gender, setGender] = useState<string>((profile as any)?.gender || "");
  const [lang, setLang] = useState<string>((profile as any)?.preferred_language || i18n.language || "kk");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [faceIdRegistered, setFaceIdRegistered] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [registeringFace, setRegisteringFace] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setIin(profile.iin || "");
      setBirthDate((profile as any).birth_date || "");
      setGender((profile as any).gender || "");
      setFaceIdRegistered(!!profile.face_id_registered);
      const pl = (profile as any).preferred_language;
      if (pl && pl !== i18n.language) { setLang(pl); setLanguage(pl); }
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, iin, birth_date: birthDate || null, gender: gender || null, preferred_language: lang } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setLanguage(lang);
      toast({ title: t("profile.savedTitle"), description: t("profile.savedDesc") });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: t("profile.passwordsDontMatch"), variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Min 6 characters", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || "", password: currentPassword,
    });
    if (signInError) {
      toast({ title: "Error", description: "Current password is wrong", variant: "destructive" });
      setChangingPassword(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "OK", description: "Password updated" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    }
    setChangingPassword(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      setCameraReady(false);
      setFaceDetected(false);
      // Wait next tick so <video> mounts
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); } catch {}
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
            // simulate face detection after 1.5s of stable video
            setTimeout(() => setFaceDetected(true), 1500);
          };
        }
      }, 50);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Camera access denied", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraReady(false);
    setFaceDetected(false);
  };

  const captureFrame = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  };

  const registerFaceId = async () => {
    if (!user) return;
    setRegisteringFace(true);
    const faceData = captureFrame();
    if (!faceData) {
      toast({ title: "Error", description: "Capture failed", variant: "destructive" });
      setRegisteringFace(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ face_id_registered: true, face_id_data: faceData } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setFaceIdRegistered(true);
      setJustRegistered(true);
      stopCamera();
      toast({ title: "Face ID", description: "Тіркелді / Registered" });
    }
    setRegisteringFace(false);
  };

  const removeFaceId = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ face_id_registered: false, face_id_data: null } as any)
      .eq("user_id", user.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setFaceIdRegistered(false); setJustRegistered(false); toast({ title: "Removed" }); }
  };

  const goToPanel = () => {
    const home = ROLE_HOME[role || ""] || "/";
    navigate(home);
  };

  useEffect(() => () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-foreground">{t("profile.title")}</h2>
      <canvas ref={canvasRef} className="hidden" />

      {/* Personal */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-card-foreground">{t("profile.personal")}</h3>
        </div>
        <div className="space-y-2">
          <Label>{t("profile.email")}</Label>
          <Input value={user?.email || ""} disabled className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>{t("profile.fullName")}</Label>
          <Input value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>{t("profile.phone")}</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (777) 123-45-67" /></div>
          <div className="space-y-2"><Label>{t("profile.iin")}</Label><Input value={iin} onChange={e => setIin(e.target.value.replace(/\D/g, ""))} maxLength={12} /></div>
          <div className="space-y-2"><Label>{t("profile.birthDate")}</Label><Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></div>
          <div className="space-y-2">
            <Label>{t("profile.gender")}</Label>
            <select value={gender} onChange={e => setGender(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">{t("profile.select")}</option>
              <option value="Ер">{t("profile.male")}</option>
              <option value="Әйел">{t("profile.female")}</option>
            </select>
          </div>
        </div>
        <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />{saving ? t("profile.saving") : t("profile.save")}
        </Button>
      </div>

      {/* Language */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{t("profile.languageSection")}</h3>
            <p className="text-xs text-muted-foreground">{t("profile.languageDesc")}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { code: "kk", label: "Қазақша" },
            { code: "ru", label: "Русский" },
            { code: "en", label: "English" },
          ].map(l => (
            <button key={l.code} type="button" onClick={() => { setLang(l.code); setLanguage(l.code); }}
              className={`rounded-lg border p-3 text-sm font-medium transition-all ${lang === l.code ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"}`}>
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t("profile.save")} → {t("profile.savedDesc").toLowerCase()}</p>
      </div>

      {/* Password */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
            <Lock className="h-5 w-5 text-warning" />
          </div>
          <h3 className="font-semibold text-card-foreground">{t("profile.changePassword")}</h3>
        </div>
        <div className="space-y-2">
          <Label>{t("profile.currentPassword")}</Label>
          <div className="relative">
            <Input type={showCurrentPass ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="pr-10" />
            <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("profile.newPassword")}</Label>
          <div className="relative">
            <Input type={showNewPass ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="pr-10" />
            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("profile.confirmPassword")}</Label>
          <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-destructive">{t("profile.passwordsDontMatch")}</p>
          )}
        </div>
        <Button onClick={handleChangePassword} disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword} variant="outline" className="gap-2">
          <Lock className="h-4 w-4" />{changingPassword ? t("profile.changing") : t("profile.changePassword")}
        </Button>
      </div>

      {/* Face ID */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
            <ScanFace className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{t("profile.faceId")}</h3>
            <p className="text-xs text-muted-foreground">{t("profile.faceIdDesc")}</p>
          </div>
        </div>

        {faceIdRegistered ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span>{t("profile.faceIdRegistered")}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {justRegistered && (
                <Button onClick={goToPanel} className="gap-2">
                  <ArrowRight className="h-4 w-4" />{t("profile.goToPanel")}
                </Button>
              )}
              <Button variant="outline" onClick={removeFaceId} className="gap-2 text-destructive hover:text-destructive">
                <XCircle className="h-4 w-4" />{t("profile.removeFaceId")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!cameraActive ? (
              <Button onClick={startCamera} className="gap-2">
                <Camera className="h-4 w-4" />{t("profile.startCamera")}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted aspect-[4/3] max-w-sm mx-auto">
                  <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
                  {cameraReady && faceDetected && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-48 w-36 rounded-[50%] border-4 border-success animate-pulse" />
                    </div>
                  )}
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-background/60">
                      Loading camera...
                    </div>
                  )}
                </div>
                <p className="text-sm text-center">
                  {faceDetected
                    ? <span className="text-success font-medium">{t("profile.faceDetected")}</span>
                    : <span className="text-muted-foreground">{t("profile.showFace")}</span>}
                </p>
                <div className="flex gap-2">
                  <Button onClick={registerFaceId} disabled={!faceDetected || registeringFace} className="gap-2">
                    <ScanFace className="h-4 w-4" />{registeringFace ? t("profile.registering") : t("profile.registerFaceId")}
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>{t("profile.cancel")}</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ProfileSecurity />
    </div>
  );
}
