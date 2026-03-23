import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, ScanFace } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Қате",
        description: error.message === "Invalid login credentials"
          ? "Email немесе құпия сөз қате"
          : error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch role after login to redirect
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

    setLoading(false);
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

            <Button type="button" variant="outline" className="w-full gap-2" size="lg">
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
        </div>
      </div>
    </div>
  );
}
