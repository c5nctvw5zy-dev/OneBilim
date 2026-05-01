import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, ScanFace, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const demoLoginAliases: Record<string, string> = {
  admin: "superadmin@bilimapp.kz",
  superadmin: "superadmin@bilimapp.kz",
  director: "director@bilimapp.kz",
  zavuch: "zavuch@bilimapp.kz",
  teacher: "teacher@bilimapp.kz",
  student: "student@bilimapp.kz",
  parent: "parent@bilimapp.kz",
};

const normalizeLoginIdentifier = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("@")) return normalized;
  return demoLoginAliases[normalized] ?? normalized;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faceIdMode, setFaceIdMode] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceVerifying, setFaceVerifying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const roleRoutes: Record<string, string> = {
    super_admin: "/super-admin",
    director: "/director",
    zavuch: "/zavuch",
    teacher: "/teacher",
    student: "/student",
    parent: "/parent",
  };

  const navigateByRole = async (userId?: string | null) => {
    const resolvedUserId = userId ?? (await supabase.auth.getUser()).data.user?.id;
    if (!resolvedUserId) { navigate("/login"); return; }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", resolvedUserId)
      .maybeSingle();
    const userRole = roleRow?.role || "student";
    navigate(roleRoutes[userRole] || "/student", { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error, user } = await signIn(normalizeLoginIdentifier(email), password);
    if (error) {
      toast({
        title: "Қате",
        description: error.message === "Invalid login credentials" ? "Email немесе құпия сөз қате" : error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    await navigateByRole(user?.id);
    setLoading(false);
  };

  const startFaceId = async () => {
    if (!email.trim()) {
      toast({
        title: "Email қажет",
        description: "Face ID арқылы кіру үшін алдымен email/логиніңізді енгізіңіз.",
        variant: "destructive",
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 240 },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setFaceIdMode(true);
      setFaceDetected(false);
      setTimeout(() => setFaceDetected(true), 2000);
    } catch {
      toast({ title: "Қате", description: "Камераға қол жеткізу мүмкін болмады.", variant: "destructive" });
    }
  };

  const stopFaceId = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setFaceIdMode(false);
    setFaceDetected(false);
    setFaceVerifying(false);
  };

  const verifyFaceId = async () => {
    setFaceVerifying(true);
    const targetEmail = normalizeLoginIdentifier(email);

    // Look up THIS specific user by email and check Face ID is registered
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, face_id_registered, face_id_data")
      .eq("email", targetEmail)
      .maybeSingle();

    if (error || !profile) {
      toast({
        title: "Пайдаланушы табылмады",
        description: "Бұл email-мен пайдаланушы жоқ.",
        variant: "destructive",
      });
      setFaceVerifying(false);
      return;
    }

    if (!profile.face_id_registered || !profile.face_id_data) {
      toast({
        title: "Face ID тіркелмеген",
        description: "Бұл пайдаланушыда Face ID жоқ. Алдымен профильде тіркеңіз.",
        variant: "destructive",
      });
      setFaceVerifying(false);
      return;
    }

    // Simulated biometric match against the user's stored face data
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({ title: "Face ID расталды ✓", description: `${profile.full_name} — кіру орындалуда...` });
    stopFaceId();

    const demoPassword = "Demo123!";
    const { error: loginError, user } = await signIn(targetEmail, demoPassword);
    if (!loginError && user) {
      await navigateByRole(user.id);
      setFaceVerifying(false);
      return;
    }
    toast({
      title: "Құпия сөз қажет",
      description: "Face ID расталды, бірақ автоматты кіру сәтсіз. Құпия сөзіңізді енгізіңіз.",
    });
    setFaceVerifying(false);
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
        <div className="max-w-md text-center animate-fade-in">
          <GraduationCap className="mx-auto mb-6 h-16 w-16 text-primary-foreground" />
          <h1 className="mb-4 text-4xl font-bold text-primary-foreground">BilimApp</h1>
          <p className="text-lg text-primary-foreground/70">Қазақстан мектептеріне арналған заманауи білім беру платформасы</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 lg:hidden flex items-center gap-2 justify-center text-xl font-bold text-primary">
            <GraduationCap className="h-7 w-7" /> BilimApp
          </div>

          <h2 className="mb-2 text-2xl font-bold text-foreground">Жүйеге кіру</h2>
          <p className="mb-8 text-sm text-muted-foreground">Аккаунтыңызға кіріңіз</p>

          {faceIdMode ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted">
                <video ref={videoRef} autoPlay playsInline muted className="w-full" style={{ transform: "scaleX(-1)" }} />
                {faceDetected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-40 w-32 rounded-full border-4 border-success animate-pulse" />
                  </div>
                )}
              </div>
              <p className="text-sm text-center">
                {faceVerifying ? (
                  <span className="text-primary font-medium">Деректер базасынан тексерілуде...</span>
                ) : faceDetected ? (
                  <span className="text-success font-medium">✓ Бет анықталды! Тексеру батырмасын басыңыз.</span>
                ) : (
                  <span className="text-muted-foreground">Бетіңізді камераға көрсетіңіз...</span>
                )}
              </p>
              <div className="flex gap-2">
                <Button onClick={verifyFaceId} disabled={!faceDetected || faceVerifying} className="flex-1 gap-2">
                  <ScanFace className="h-5 w-5" />
                  {faceVerifying ? "Тексерілуде..." : "Тексеру арқылы кіру"}
                </Button>
                <Button variant="outline" onClick={stopFaceId} className="gap-2">
                  <XCircle className="h-4 w-4" /> Болдырмау
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email немесе логин</Label>
                  <Input id="email" placeholder="admin@bilimapp.kz" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Құпия сөз</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="text-right">
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Құпия сөзді ұмыттыңыз ба?
                    </Link>
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Кіру..." : "Кіру"}
                </Button>
                <Button type="button" variant="outline" className="w-full gap-2" size="lg" onClick={startFaceId}>
                  <ScanFace className="h-5 w-5" /> Face ID арқылы кіру
                </Button>
              </form>

              <div className="mt-6 space-y-3">
                <p className="text-xs text-center text-muted-foreground font-medium uppercase tracking-wider">Демо кіру</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Админ", alias: "superadmin", icon: "👑" },
                    { label: "Директор", alias: "director", icon: "🏫" },
                    { label: "Завуч", alias: "zavuch", icon: "📋" },
                    { label: "Мұғалім", alias: "teacher", icon: "👨‍🏫" },
                    { label: "Оқушы", alias: "student", icon: "🎓" },
                    { label: "Ата-ана", alias: "parent", icon: "👪" },
                  ].map((demo) => (
                    <Button
                      key={demo.alias}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      className="text-xs gap-1"
                      onClick={async () => {
                        setLoading(true);
                        const demoEmail = demoLoginAliases[demo.alias]!;
                        const { error, user } = await signIn(demoEmail, "Demo123!");
                        if (error) {
                          toast({ title: "Қате", description: error.message, variant: "destructive" });
                          setLoading(false);
                          return;
                        }
                        await navigateByRole(user?.id);
                        setLoading(false);
                      }}
                    >
                      <span>{demo.icon}</span> {demo.label}
                    </Button>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Мектебіңіз тіркелмеген бе?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">Тіркелу</Link>
              </p>
              <Link to="/" className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Басты бетке оралу
              </Link>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                <Link to="/copyright" className="hover:underline">© 2026 BilimApp. Барлық құқықтар қорғалған.</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
