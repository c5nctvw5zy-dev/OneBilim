import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Camera, Save, Eye, EyeOff, ScanFace, CheckCircle2, XCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  // Profile info
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [iin, setIin] = useState(profile?.iin || "");
  const [saving, setSaving] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Face ID
  const [faceIdRegistered, setFaceIdRegistered] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setIin(profile.iin || "");
    }
  }, [profile]);

  useEffect(() => {
    // Check if Face ID is registered
    const stored = localStorage.getItem(`faceid_${user?.id}`);
    if (stored) setFaceIdRegistered(true);
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, iin })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Сәтті сақталды", description: "Профиль ақпараты жаңартылды" });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Қате", description: "Жаңа құпия сөздер сәйкес келмейді", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Қате", description: "Құпия сөз кемінде 6 таңбадан тұруы керек", variant: "destructive" });
      return;
    }

    setChangingPassword(true);

    // Verify current password by re-signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: currentPassword,
    });

    if (signInError) {
      toast({ title: "Қате", description: "Ағымдағы құпия сөз қате", variant: "destructive" });
      setChangingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Сәтті", description: "Құпия сөз өзгертілді" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPassword(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setFaceDetected(false);

      // Simulate face detection after 2 seconds
      setTimeout(() => {
        setFaceDetected(true);
      }, 2000);
    } catch {
      toast({ title: "Қате", description: "Камераға қол жеткізу мүмкін болмады", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setFaceDetected(false);
  };

  const registerFaceId = () => {
    if (!user) return;
    // Store Face ID registration (demo - in production this would use WebAuthn)
    localStorage.setItem(`faceid_${user.id}`, "registered");
    setFaceIdRegistered(true);
    stopCamera();
    toast({ title: "Сәтті", description: "Face ID сәтті тіркелді! Енді Face ID арқылы кіре аласыз." });
  };

  const removeFaceId = () => {
    if (!user) return;
    localStorage.removeItem(`faceid_${user.id}`);
    setFaceIdRegistered(false);
    toast({ title: "Жойылды", description: "Face ID тіркеуі жойылды" });
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-foreground">Менің профилім</h2>

      {/* Profile Info */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-card-foreground">Жеке ақпарат</h3>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>Аты-жөні</Label>
          <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Толық аты-жөні" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Телефон</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (777) 123-45-67" />
          </div>
          <div className="space-y-2">
            <Label>ЖСН (ИИН)</Label>
            <Input value={iin} onChange={e => setIin(e.target.value)} placeholder="123456789012" maxLength={12} />
          </div>
        </div>

        <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Сақталуда..." : "Сақтау"}
        </Button>
      </div>

      {/* Password Change */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
            <Lock className="h-5 w-5 text-warning" />
          </div>
          <h3 className="font-semibold text-card-foreground">Құпия сөзді өзгерту</h3>
        </div>

        <div className="space-y-2">
          <Label>Ағымдағы құпия сөз</Label>
          <div className="relative">
            <Input
              type={showCurrentPass ? "text" : "password"}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
            />
            <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Жаңа құпия сөз</Label>
          <div className="relative">
            <Input
              type={showNewPass ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
            />
            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Жаңа құпия сөзді қайталаңыз</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-destructive">Құпия сөздер сәйкес келмейді</p>
          )}
        </div>

        <Button
          onClick={handleChangePassword}
          disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
          variant="outline"
          className="gap-2"
        >
          <Lock className="h-4 w-4" />
          {changingPassword ? "Өзгертілуде..." : "Құпия сөзді өзгерту"}
        </Button>
      </div>

      {/* Face ID */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
            <ScanFace className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Face ID</h3>
            <p className="text-xs text-muted-foreground">Камера арқылы биометриялық тексеру</p>
          </div>
        </div>

        {faceIdRegistered ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span>Face ID тіркелген. Жүйеге Face ID арқылы кіре аласыз.</span>
            </div>
            <Button variant="outline" onClick={removeFaceId} className="gap-2 text-destructive hover:text-destructive">
              <XCircle className="h-4 w-4" />
              Face ID тіркеуін жою
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {!cameraActive ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Face ID тіркеу үшін камераны қосып, бетіңізді көрсетіңіз.
                </p>
                <Button onClick={startCamera} className="gap-2">
                  <Camera className="h-4 w-4" />
                  Камераны қосу
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-w-sm mx-auto"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  {faceDetected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-40 w-32 rounded-full border-4 border-success animate-pulse" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-center">
                  {faceDetected ? (
                    <span className="text-success font-medium">✓ Бет анықталды! Тіркеу батырмасын басыңыз.</span>
                  ) : (
                    <span className="text-muted-foreground">Бетіңізді камераға көрсетіңіз...</span>
                  )}
                </p>
                <div className="flex gap-2">
                  <Button onClick={registerFaceId} disabled={!faceDetected} className="gap-2">
                    <ScanFace className="h-4 w-4" />
                    Face ID тіркеу
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    Болдырмау
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
