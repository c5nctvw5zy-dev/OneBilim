import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import DashboardLayout from "@/components/DashboardLayout";
import PlaceholderPage from "@/components/PlaceholderPage";

// Super Admin
import SuperAdminHome from "./pages/superadmin/SuperAdminHome";
import SuperAdminSchools from "./pages/superadmin/SuperAdminSchools";
import SuperAdminApplications from "./pages/superadmin/SuperAdminApplications";
import SuperAdminSubjects from "./pages/superadmin/SuperAdminSubjects";
import SuperAdminUsers from "./pages/superadmin/SuperAdminUsers";
import SuperAdminAnalytics from "./pages/superadmin/SuperAdminAnalytics";
import SuperAdminLogs from "./pages/superadmin/SuperAdminLogs";
import SuperAdminSettings from "./pages/superadmin/SuperAdminSettings";

// Director
import DirectorHome from "./pages/director/DirectorHome";

import {
  Home, School, ClipboardList, BookOpen, Users, BarChart3, FileText, Settings, GraduationCap, Calendar, Upload, FileCheck,
  BookMarked, CheckCircle, UserCheck,
} from "lucide-react";

const superAdminNav = [
  { title: "Басты бет", path: "/super-admin", icon: Home },
  { title: "Мектептер", path: "/super-admin/schools", icon: School },
  { title: "Өтінімдер", path: "/super-admin/applications", icon: ClipboardList },
  { title: "Пәндер", path: "/super-admin/subjects", icon: BookOpen },
  { title: "Пайдаланушылар", path: "/super-admin/users", icon: Users },
  { title: "Аналитика", path: "/super-admin/analytics", icon: BarChart3 },
  { title: "Логтар", path: "/super-admin/logs", icon: FileText },
  { title: "Баптаулар", path: "/super-admin/settings", icon: Settings },
];

const directorNav = [
  { title: "Басты бет", path: "/director", icon: Home },
  { title: "Сыныптар", path: "/director/classes", icon: BookMarked },
  { title: "Мұғалімдер", path: "/director/teachers", icon: Users },
  { title: "Оқушылар", path: "/director/students", icon: GraduationCap },
  { title: "Сабақ кесте", path: "/director/schedule", icon: Calendar },
  { title: "Excel импорт", path: "/director/import", icon: Upload },
  { title: "Құжаттар", path: "/director/documents", icon: FileCheck },
  { title: "Аналитика", path: "/director/analytics", icon: BarChart3 },
  { title: "Баптаулар", path: "/director/settings", icon: Settings },
];

const zavuchNav = [
  { title: "Басты бет", path: "/zavuch", icon: Home },
  { title: "Сынып", path: "/zavuch/class", icon: BookMarked },
  { title: "Журнал мониторинг", path: "/zavuch/journal", icon: BookOpen },
  { title: "Құжаттар", path: "/zavuch/documents", icon: FileCheck },
  { title: "Сабақ кесте", path: "/zavuch/schedule", icon: Calendar },
  { title: "Үлгерім", path: "/zavuch/performance", icon: BarChart3 },
  { title: "Қатысулар", path: "/zavuch/attendance", icon: CheckCircle },
  { title: "Мұғалімдер", path: "/zavuch/teachers", icon: Users },
];

const teacherNav = [
  { title: "Басты бет", path: "/teacher", icon: Home },
  { title: "Электронды журнал", path: "/teacher/journal", icon: BookOpen },
  { title: "Сынып", path: "/teacher/class", icon: BookMarked },
  { title: "Үй тапсырма", path: "/teacher/homework", icon: ClipboardList },
  { title: "Сабақ кесте", path: "/teacher/schedule", icon: Calendar },
  { title: "Тесттер", path: "/teacher/tests", icon: FileText },
  { title: "Материалдар", path: "/teacher/materials", icon: Upload },
  { title: "Құжаттар", path: "/teacher/documents", icon: FileCheck },
  { title: "Статистика", path: "/teacher/stats", icon: BarChart3 },
];

const studentNav = [
  { title: "Басты бет", path: "/student", icon: Home },
  { title: "Бағалар", path: "/student/grades", icon: BarChart3 },
  { title: "Үй тапсырма", path: "/student/homework", icon: ClipboardList },
  { title: "Тесттер", path: "/student/tests", icon: FileText },
  { title: "Сабақ кесте", path: "/student/schedule", icon: Calendar },
  { title: "Материалдар", path: "/student/materials", icon: BookOpen },
  { title: "Жетістіктер", path: "/student/achievements", icon: GraduationCap },
];

const parentNav = [
  { title: "Басты бет", path: "/parent", icon: Home },
  { title: "Бағалар", path: "/parent/grades", icon: BarChart3 },
  { title: "Қатысулар", path: "/parent/attendance", icon: CheckCircle },
  { title: "Үй тапсырмалар", path: "/parent/homework", icon: ClipboardList },
  { title: "Хабарламалар", path: "/parent/messages", icon: FileText },
  { title: "Сабақ кесте", path: "/parent/schedule", icon: Calendar },
];

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Super Admin */}
          <Route element={<DashboardLayout roleName="Super Admin" navItems={superAdminNav} userName="Admin" />}>
            <Route path="/super-admin" element={<SuperAdminHome />} />
            <Route path="/super-admin/schools" element={<SuperAdminSchools />} />
            <Route path="/super-admin/applications" element={<SuperAdminApplications />} />
            <Route path="/super-admin/subjects" element={<SuperAdminSubjects />} />
            <Route path="/super-admin/users" element={<SuperAdminUsers />} />
            <Route path="/super-admin/analytics" element={<SuperAdminAnalytics />} />
            <Route path="/super-admin/logs" element={<SuperAdminLogs />} />
            <Route path="/super-admin/settings" element={<SuperAdminSettings />} />
          </Route>

          {/* Director */}
          <Route element={<DashboardLayout roleName="Директор" navItems={directorNav} userName="Ахметова А." />}>
            <Route path="/director" element={<DirectorHome />} />
            <Route path="/director/classes" element={<PlaceholderPage title="Сыныптар" />} />
            <Route path="/director/teachers" element={<PlaceholderPage title="Мұғалімдер" />} />
            <Route path="/director/students" element={<PlaceholderPage title="Оқушылар" />} />
            <Route path="/director/schedule" element={<PlaceholderPage title="Сабақ кесте" />} />
            <Route path="/director/import" element={<PlaceholderPage title="Excel импорт" />} />
            <Route path="/director/documents" element={<PlaceholderPage title="Құжаттар" />} />
            <Route path="/director/analytics" element={<PlaceholderPage title="Аналитика" />} />
            <Route path="/director/settings" element={<PlaceholderPage title="Баптаулар" />} />
          </Route>

          {/* Zavuch */}
          <Route element={<DashboardLayout roleName="Завуч" navItems={zavuchNav} userName="Мұхтарова Д." />}>
            <Route path="/zavuch" element={<PlaceholderPage title="Завуч панелі" />} />
            <Route path="/zavuch/class" element={<PlaceholderPage title="Сынып" />} />
            <Route path="/zavuch/journal" element={<PlaceholderPage title="Журнал мониторинг" />} />
            <Route path="/zavuch/documents" element={<PlaceholderPage title="Құжаттар" />} />
            <Route path="/zavuch/schedule" element={<PlaceholderPage title="Сабақ кесте" />} />
            <Route path="/zavuch/performance" element={<PlaceholderPage title="Үлгерім аналитика" />} />
            <Route path="/zavuch/attendance" element={<PlaceholderPage title="Қатысулар" />} />
            <Route path="/zavuch/teachers" element={<PlaceholderPage title="Мұғалімдер" />} />
          </Route>

          {/* Teacher */}
          <Route element={<DashboardLayout roleName="Мұғалім" navItems={teacherNav} userName="Сейітов Қ." />}>
            <Route path="/teacher" element={<PlaceholderPage title="Мұғалім панелі" />} />
            <Route path="/teacher/journal" element={<PlaceholderPage title="Электронды журнал" />} />
            <Route path="/teacher/class" element={<PlaceholderPage title="Сынып" />} />
            <Route path="/teacher/homework" element={<PlaceholderPage title="Үй тапсырма" />} />
            <Route path="/teacher/schedule" element={<PlaceholderPage title="Сабақ кесте" />} />
            <Route path="/teacher/tests" element={<PlaceholderPage title="Тесттер" />} />
            <Route path="/teacher/materials" element={<PlaceholderPage title="Материалдар" />} />
            <Route path="/teacher/documents" element={<PlaceholderPage title="Құжаттар" />} />
            <Route path="/teacher/stats" element={<PlaceholderPage title="Статистика" />} />
          </Route>

          {/* Student */}
          <Route element={<DashboardLayout roleName="Оқушы" navItems={studentNav} userName="Назарбекова А." />}>
            <Route path="/student" element={<PlaceholderPage title="Оқушы панелі" />} />
            <Route path="/student/grades" element={<PlaceholderPage title="Бағалар" />} />
            <Route path="/student/homework" element={<PlaceholderPage title="Үй тапсырма" />} />
            <Route path="/student/tests" element={<PlaceholderPage title="Тесттер" />} />
            <Route path="/student/schedule" element={<PlaceholderPage title="Сабақ кесте" />} />
            <Route path="/student/materials" element={<PlaceholderPage title="Материалдар" />} />
            <Route path="/student/achievements" element={<PlaceholderPage title="Жетістіктер" />} />
          </Route>

          {/* Parent */}
          <Route element={<DashboardLayout roleName="Ата-ана" navItems={parentNav} userName="Назарбеков Б." />}>
            <Route path="/parent" element={<PlaceholderPage title="Ата-ана панелі" />} />
            <Route path="/parent/grades" element={<PlaceholderPage title="Бағалар" />} />
            <Route path="/parent/attendance" element={<PlaceholderPage title="Қатысулар" />} />
            <Route path="/parent/homework" element={<PlaceholderPage title="Үй тапсырмалар" />} />
            <Route path="/parent/messages" element={<PlaceholderPage title="Хабарламалар" />} />
            <Route path="/parent/schedule" element={<PlaceholderPage title="Сабақ кесте" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
