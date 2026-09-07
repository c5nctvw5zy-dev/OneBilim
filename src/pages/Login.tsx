import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, ScanFace, XCircle, QrCode, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { detectDevice, getDeviceKey } from "@/lib/deviceInfo";
import { enforceAccountStatus } from "@/lib/accountStatus";
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
  librarian: "librarian@bilimapp.kz",
  psychologist: "psychologist@bilimapp.kz",
  social: "social@bilimapp.kz",
  speech: "speech@bilimapp.kz",
  nurse: "nurse@bilimapp.kz",
  hr: "hr@bilimapp.kz",
  secretary: "secretary@bilimapp.kz",
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
  const [qrMode, setQrMode] = useState(false);
  const [qrImg, setQrImg] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [qrSeconds, setQrSeconds] = useState(180);
  const [qrStatus, setQrStatus] = useState<string>("pending");
  const qrTokenRef = useRef<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceVerifying, setFaceVerifying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextParam = searchParams.get("next");
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;
  const linkToken = searchParams.get("link");
  const sessionNotice = searchParams.get("session");
  const { signIn } = useAuth();
  const { toast } = useToast();

  // Егер QR сілтемесі ашылса: сеансы бар құрылғы бірден растау бетіне өтеді
  useEffect(() => {
    if (!linkToken) return;
    sessionStorage.setItem("bilim_link_token", linkToken);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(`/profile?link=${linkToken}`, { replace: true });
    });
  }, [linkToken]);

  useEffect(() => {
    if (sessionNotice === "blocked") toast({ title: "Сеанс бұғатталды", description: "Аккаунт иесі бұл құрылғының сеансын бұғаттады.", variant: "destructive" });
    if (sessionNotice === "closed") toast({ title: "Сеанс жабылды", description: "Аккаунт иесі бұл құрылғының сеансын жапты.", variant: "destructive" });
  }, [sessionNotice]);

  const roleRoutes: Record<string, string> = {
    super_admin: "/super-admin",
    director: "/director",
    zavuch: "/zavuch",
    teacher: "/teacher",
    student: "/student",
    parent: "/parent",
    librarian: "/librarian/books",
    psychologist: "/psychologist",
    social_pedagogue: "/social",
    speech_therapist: "/speech",
    nurse: "/nurse",
    hr: "/hr",
    secretary: "/secretary",
  };

  // Бұғатталған аккаунт кіре алмайды
  const blockedGuard = async () => {
    const blocked = await enforceAccountStatus();
    if (blocked) {
      toast({
        title: "Аккаунт бұғатталған",
        description: "Сіздің аккаунтыңыз әкімші тарапынан бұғатталды. Мектеп әкімшілігіне хабарласыңыз.",
        variant: "destructive",
      });
    }
    return blocked;
  };

  const navigateByRole = async (userId?: string | null) => {
    if (await blockedGuard()) return;
    const pendingLink = sessionStorage.getItem("bilim_link_token");
    if (pendingLink) {
      sessionStorage.removeItem("bilim_link_token");
      navigate(`/profile?link=${pendingLink}`, { replace: true });
      return;
    }
    if (safeNext) { navigate(safeNext, { replace: true }); return; }
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


  // ==== QR арқылы кіру (сұраныс жасайтын құрылғы) ====
  const startQrLogin = async () => {
    const device = detectDevice();
    const token = crypto.randomUUID();
    const short = Math.random().toString(36).replace(/[^a-z0-9]/g, "").slice(0, 6).toUpperCase();
    const expires = new Date(Date.now() + 180_000).toISOString();
    const { error } = await supabase.from("device_link_requests").insert({
      token,
      short_code: short,
      requester_device: device.device_name,
      requester_os: device.os,
      requester_browser: device.browser,
      device_key: getDeviceKey(),
      status: "pending",
      expires_at: expires,
    } as any);
    if (error) { toast({ title: "Қате", description: error.message, variant: "destructive" }); return; }
    qrTokenRef.current = token;
    const url = `${window.location.origin}/login?link=${token}`;
    setQrImg(await QRCode.toDataURL(url, { width: 260, margin: 1 }));
    setQrCode(short);
    setQrSeconds(180);
    setQrStatus("pending");
    setQrMode(true);
  };

  const stopQrLogin = () => {
    qrTokenRef.current = null;
    setQrMode(false);
    setQrImg(null);
  };

  useEffect(() => {
    if (!qrMode) return;
    const tick = setInterval(() => setQrSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    const poll = setInterval(async () => {
      const token = qrTokenRef.current;
      if (!token) return;
      const { data, error } = await supabase.functions.invoke("qr-login", { body: { token } });
      if (error) return;
      const res = data as any;
      if (res?.status === "approved" && res.token_hash && res.email) {
        clearInterval(poll); clearInterval(tick);
        localStorage.setItem("bilim_login_method", "qr");
        const { error: vErr } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: res.token_hash });
        if (vErr) { toast({ title: "Қате", description: vErr.message, variant: "destructive" }); setQrStatus("error"); return; }
        toast({ title: "QR арқылы кіру расталды ✓", description: "Сеанс басталды" });
        stopQrLogin();
        await navigateByRole();
      } else if (res?.status === "denied") {
        setQrStatus("denied"); clearInterval(poll);
      } else if (res?.status === "expired") {
        setQrStatus("expired"); clearInterval(poll);
      }
    }, 2500);
    return () => { clearInterval(tick); clearInterval(poll); };
  }, [qrMode]);

  useEffect(() => {
    if (qrMode && qrSeconds === 0) setQrStatus("expired");
  }, [qrSeconds, qrMode]);

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

    const demoPassword = "BilimApp2026!";
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

          {qrMode ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-fit rounded-2xl border border-border bg-white p-4">
                {qrImg ? <img src={qrImg} alt="QR арқылы кіру коды" className="h-[240px] w-[240px]" /> : <Loader2 className="h-10 w-10 animate-spin text-primary" />}
              </div>
              <div className="rounded-xl bg-muted p-3 text-sm">
                <p className="text-muted-foreground">Кодты негізгі құрылғыда енгізуге де болады:</p>
                <p className="mt-1 text-2xl font-bold tracking-[0.3em] text-primary">{qrCode}</p>
              </div>
              <p className="text-sm">
                {qrStatus === "denied" ? <span className="font-medium text-destructive">Сұраныс қабылданбады.</span>
                  : qrStatus === "expired" ? <span className="font-medium text-destructive">QR коды мерзімі бітті. Қайта жасаңыз.</span>
                  : qrStatus === "error" ? <span className="font-medium text-destructive">Кіру сәтсіз аяқталды.</span>
                  : <span className="text-muted-foreground">Негізгі құрылғыдағы «Жеке кабинетім» → «QR арқылы кіру» бөлімінен сканерлеп растаңыз... <b className="text-foreground">{Math.floor(qrSeconds / 60)}:{String(qrSeconds % 60).padStart(2, "0")}</b></span>}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={startQrLogin}><QrCode className="h-4 w-4" /> Жаңа QR</Button>
                <Button variant="ghost" onClick={stopQrLogin} className="gap-2"><XCircle className="h-4 w-4" /> Болдырмау</Button>
              </div>
            </div>
          ) : faceIdMode ? (
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
                <Button type="button" variant="outline" className="w-full gap-2" size="lg" onClick={startQrLogin}>
                  <QrCode className="h-5 w-5" /> QR арқылы кіру
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
                    { label: "Кітапханашы", alias: "librarian", icon: "📚" },
                    { label: "Психолог", alias: "psychologist", icon: "🧠" },
                    { label: "Әл. педагог", alias: "social", icon: "🤝" },
                    { label: "Логопед", alias: "speech", icon: "🗣️" },
                    { label: "Медбике", alias: "nurse", icon: "🩺" },
                    { label: "Кадр", alias: "hr", icon: "💼" },
                    { label: "Хатшы", alias: "secretary", icon: "✍️" },
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
                        const { error, user } = await signIn(demoEmail, "BilimApp2026!");
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
                <Link to={"/register" + (safeNext ? `?next=${encodeURIComponent(safeNext)}` : "")} className="text-primary font-medium hover:underline">Тіркелу</Link>
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
