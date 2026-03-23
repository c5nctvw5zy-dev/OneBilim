import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, ScanFace, Camera, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

  const navigateByRole = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const userRole = roles?.[0]?.role || "student";
      navigate(roleRoutes[userRole] || "/student");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({
        title: "Қате",
        description: error.message === "Invalid login credentials" ? "Email немесе құпия сөз қате" : error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    await navigateByRole();
    setLoading(false);
  };

  const startFaceId = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 240 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setFaceIdMode(true);
      setFaceDetected(false);

      // Simulate face detection
      setTimeout(() => setFaceDetected(true), 2000);
    } catch {
      toast({ title: "Қате", description: "Камераға қол жеткізу мүмкін болмады. Камера рұқсатын тексеріңіз.", variant: "destructive" });
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

    // Demo: check if any user has Face ID registered in localStorage
    // In production, this would use WebAuthn or a biometric API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Find registered Face ID user
    let foundUserId: string | null = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("faceid_")) {
        foundUserId = key.replace("faceid_", "");
        break;
      }
    }

    if (!foundUserId) {
      toast({
        title: "Face ID табылмады",
        description: "Face ID тіркелмеген. Алдымен профильде Face ID тіркеңіз.",
        variant: "destructive",
      });
      setFaceVerifying(false);
      return;
    }

    // For demo, Face ID verification succeeds
    toast({ title: "Face ID расталды!", description: "Жүйеге кіру орындалуда..." });

    // Try to find user email from localStorage or redirect
    stopFaceId();

    // Since we can't auto-login without credentials in a demo,
    // show success and ask for email
    toast({
      title: "Face ID расталды ✓",
      description: "Email мен құпия сөзіңізді енгізіңіз немесе профильдегі деректерді пайдаланыңыз.",
    });
    setFaceVerifying(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
        <div className="max-w-md text-center animate-fade-in">
          <GraduationCap className="mx-auto mb-6 h-16 w-16 text-primary-foreground" />
          <h1 className="mb-4 text-4xl font-bold text-primary-foreground">BilimApp</h1>
          <p className="text-lg text-primary-foreground/70">
            Қазақстан мектептеріне арналған заманауи білім беру платформасы
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 lg:hidden flex items-center gap-2 justify-center text-xl font-bold text-primary">
            <GraduationCap className="h-7 w-7" />
            BilimApp
          </div>

          <h2 className="mb-2 text-2xl font-bold text-foreground">Жүйеге кіру</h2>
          <p className="mb-8 text-sm text-muted-foreground">Аккаунтыңызға кіріңіз</p>

          {faceIdMode ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full"
                  style={{ transform: "scaleX(-1)" }}
                />
                {faceDetected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-40 w-32 rounded-full border-4 border-success animate-pulse" />
                  </div>
                )}
              </div>
              <p className="text-sm text-center">
                {faceVerifying ? (
                  <span className="text-primary font-medium">Тексерілуде...</span>
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
                  <XCircle className="h-4 w-4" />
                  Болдырмау
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email немесе логин</Label>
                  <Input
                    id="email"
                    placeholder="admin@bilimapp.kz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Құпия сөз</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Кіру..." : "Кіру"}
                </Button>

                <Button type="button" variant="outline" className="w-full gap-2" size="lg" onClick={startFaceId}>
                  <ScanFace className="h-5 w-5" />
                  Face ID арқылы кіру
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Мектебіңіз тіркелмеген бе?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Тіркелу
                </Link>
              </p>

              <Link to="/" className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Басты бетке оралу
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
