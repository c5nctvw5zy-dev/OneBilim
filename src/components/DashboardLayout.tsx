import { useState, useEffect, useRef } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu, X, Bell, Search, ChevronDown, ChevronRight, LogOut, GraduationCap, User, Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AnnouncementCenter from "@/components/AnnouncementCenter";
import WelcomeAnimation from "@/components/WelcomeAnimation";

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  children: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

interface DashboardLayoutProps {
  roleName: string;
  navItems: NavEntry[];
  userName?: string;
}

export default function DashboardLayout({ roleName, navItems, userName = "Пайдаланушы" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
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

  // Auto-open group that contains active route
  useEffect(() => {
    navItems.forEach((entry) => {
      if (isGroup(entry)) {
        const hasActive = entry.children.some((c) => location.pathname === c.path);
        if (hasActive) {
          setOpenGroups((prev) => new Set(prev).add(entry.title));
        }
      }
    });
  }, [location.pathname, navItems]);

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
  const basePath = (() => {
    for (const entry of navItems) {
      if (!isGroup(entry) && entry.path) return entry.path.split("/").slice(0, 2).join("/");
      if (isGroup(entry) && entry.children[0]) return entry.children[0].path.split("/").slice(0, 2).join("/");
    }
    return "/";
  })();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const renderNavEntry = (entry: NavEntry, idx: number) => {
    if (isGroup(entry)) {
      const isOpen = openGroups.has(entry.title);
      const hasActiveChild = entry.children.some((c) => isActive(c.path));
      return (
        <div key={entry.title + idx}>
          <button
            onClick={() => toggleGroup(entry.title)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              hasActiveChild
                ? "bg-sidebar-accent/30 text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <entry.icon className="h-5 w-5 shrink-0" />
            {sidebarOpen && (
              <>
                <span className="flex-1 text-left">{entry.title}</span>
                <ChevronRight className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
              </>
            )}
          </button>
          {sidebarOpen && isOpen && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
              {entry.children.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                    isActive(child.path)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <child.icon className="h-4 w-4 shrink-0" />
                  <span>{child.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={entry.path}
        to={entry.path}
        onClick={() => setMobileSidebarOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive(entry.path)
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        }`}
      >
        <entry.icon className="h-5 w-5 shrink-0" />
        {sidebarOpen && <span>{entry.title}</span>}
      </Link>
    );
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
        {navItems.map((entry, idx) => renderNavEntry(entry, idx))}
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
      <aside className={`hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
        <SidebarContent />
      </aside>
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative z-10 h-full w-64 bg-sidebar shadow-xl animate-slide-in-left">
            <SidebarContent />
          </aside>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
                  <Link to={`${basePath}/profile`} onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                    <User className="h-4 w-4" /> Профиль
                  </Link>
                  <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="h-4 w-4" /> Шығу
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
        <AnnouncementCenter />
      </div>
    </div>
  );
}
