import { useState, useEffect, useRef } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu, X, Bell, Search, ChevronDown, LogOut, GraduationCap, User, Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  roleName: string;
  navItems: NavItem[];
  userName?: string;
}

export default function DashboardLayout({ roleName, navItems, userName = "Пайдаланушы" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || userName;

  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDateStr(now.toLocaleDateString("kk-KZ", { year: "numeric", month: "long", day: "numeric", weekday: "long" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // Determine base path for profile
  const basePath = navItems[0]?.path?.split("/").slice(0, 2).join("/") || "/";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <GraduationCap className="h-6 w-6 text-sidebar-primary shrink-0" />
        {sidebarOpen && <span className="text-lg font-bold text-sidebar-foreground">BilimApp</span>}
      </div>
      {sidebarOpen && (
        <div className="border-b border-sidebar-border px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{roleName}</span>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive(item.path)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>{item.title}</span>}
          </Link>
        ))}
        {/* Profile link */}
        <Link
          to={`${basePath}/profile`}
          onClick={() => setMobileSidebarOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            isActive(`${basePath}/profile`)
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          }`}
        >
          <User className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>Профиль</span>}
        </Link>
      </nav>
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>Шығу</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative z-10 h-full w-64 bg-sidebar shadow-xl animate-slide-in-left">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-foreground">Қайырлы күн! 👋</div>
              <div className="text-xs text-muted-foreground">{dateStr} · {timeStr}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Іздеу..." className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {displayName.charAt(0)}
                </div>
                <span className="hidden text-sm font-medium text-foreground sm:inline">{displayName}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-card p-1.5 shadow-lg z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email || ""}</p>
                  </div>
                  <Link
                    to={`${basePath}/profile`}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Профиль
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Шығу
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
