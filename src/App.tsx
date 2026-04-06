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
import ProfilePage from "./pages/ProfilePage";

import DashboardLayout from "@/components/DashboardLayout";
import type { NavEntry } from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

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
import DirectorStudents from "./pages/director/DirectorStudents";
import DirectorTeachers from "./pages/director/DirectorTeachers";
import DirectorDocuments from "./pages/director/DirectorDocuments";
import DirectorSettings from "./pages/director/DirectorSettings";

// Zavuch
import ZavuchHome from "./pages/zavuch/ZavuchHome";

// Teacher
import TeacherHome from "./pages/teacher/TeacherHome";
import ClassLeadershipPage from "./pages/teacher/ClassLeadershipPage";

// Student
import StudentHome from "./pages/student/StudentHome";

// Parent
import ParentHome from "./pages/parent/ParentHome";

// Shared pages
import SchedulePage from "./pages/shared/SchedulePage";
import GradesPage from "./pages/shared/GradesPage";
import HomeworkPage from "./pages/shared/HomeworkPage";
import AttendancePage from "./pages/shared/AttendancePage";
import MessagesPage from "./pages/shared/MessagesPage";
import JournalPage from "./pages/shared/JournalPage";
import DocumentsPage from "./pages/shared/DocumentsPage";
import MonitoringBoardPage from "./pages/shared/MonitoringBoardPage";
import ChatPage from "./pages/shared/ChatPage";
import AssessmentGeneratorPage from "./pages/shared/AssessmentGeneratorPage";
import SubjectsManagementPage from "./pages/shared/SubjectsManagementPage";
import CurriculumPage from "./pages/shared/CurriculumPage";
import PerformanceMonitoringPage from "./pages/shared/PerformanceMonitoringPage";
import AnalyticsDetailPage from "./pages/shared/AnalyticsDetailPage";

// Librarian
import BookRegistrationPage from "./pages/librarian/BookRegistrationPage";
import BookBorrowerPage from "./pages/librarian/BookBorrowerPage";
import OnlineLibraryPage from "./pages/librarian/OnlineLibraryPage";

import {
  Home, School, ClipboardList, BookOpen, Users, BarChart3, FileText, Settings, GraduationCap, Calendar,
  FileCheck, BookMarked, CheckCircle, LayoutDashboard, MessageSquare, Sparkles, BookOpenCheck, User, Library,
} from "lucide-react";

const superAdminNav: NavEntry[] = [
  { title: "Басты бет", path: "/super-admin", icon: Home },
  { title: "Мектептер", path: "/super-admin/schools", icon: School },
  { title: "Өтінімдер", path: "/super-admin/applications", icon: ClipboardList },
  { title: "Пәндер", path: "/super-admin/subjects", icon: BookOpen },
  { title: "Пайдаланушылар", path: "/super-admin/users", icon: Users },
  { title: "Аналитика", path: "/super-admin/analytics", icon: BarChart3 },
  { title: "Логтар", path: "/super-admin/logs", icon: FileText },
  { title: "Баптаулар", path: "/super-admin/settings", icon: Settings },
];

const directorNav: NavEntry[] = [
  {
    title: "BilimApp",
    icon: GraduationCap,
    children: [
      { title: "Басты бет", path: "/director", icon: Home },
      { title: "Бақылау тақтасы", path: "/director/monitoring", icon: LayoutDashboard },
      { title: "Менің кестем", path: "/director/schedule", icon: Calendar },
      { title: "Үй тапсырмасы", path: "/director/homework", icon: ClipboardList },
      { title: "Оқушылармен байланыс", path: "/director/chat", icon: MessageSquare },
      { title: "БЖБ / ТЖБ", path: "/director/assessments", icon: Sparkles },
      { title: "Пәндер", path: "/director/subjects", icon: BookOpen },
    ],
  },
  { title: "Профиль", path: "/director/profile", icon: User },
  {
    title: "Басқарулар",
    icon: Settings,
    children: [
      { title: "Оқушылар мен сыныптар", path: "/director/students", icon: GraduationCap },
      { title: "Мұғалімдер", path: "/director/teachers", icon: Users },
      { title: "Құжаттар", path: "/director/documents", icon: FileCheck },
      { title: "Оқу бағдарламасы", path: "/director/curriculum", icon: BookOpenCheck },
      { title: "Сабақ кестесі", path: "/director/timetable", icon: BookMarked },
      { title: "Баптаулар", path: "/director/settings", icon: Settings },
    ],
  },
  {
    title: "Мониторинг",
    icon: BarChart3,
    children: [
      { title: "Сабақ үлгерімі", path: "/director/performance", icon: BarChart3 },
      { title: "Аналитика", path: "/director/analytics", icon: BarChart3 },
    ],
  },
];

const zavuchNav: NavEntry[] = [
  {
    title: "BilimApp",
    icon: GraduationCap,
    children: [
      { title: "Басты бет", path: "/zavuch", icon: Home },
      { title: "Бақылау тақтасы", path: "/zavuch/monitoring", icon: LayoutDashboard },
      { title: "Менің кестем", path: "/zavuch/schedule", icon: Calendar },
      { title: "Үй тапсырмасы", path: "/zavuch/homework", icon: ClipboardList },
      { title: "Оқушылармен байланыс", path: "/zavuch/chat", icon: MessageSquare },
      { title: "БЖБ / ТЖБ", path: "/zavuch/assessments", icon: Sparkles },
      { title: "Пәндер", path: "/zavuch/subjects", icon: BookOpen },
    ],
  },
  { title: "Профиль", path: "/zavuch/profile", icon: User },
  {
    title: "Басқарулар",
    icon: Settings,
    children: [
      { title: "Оқушылар мен сыныптар", path: "/zavuch/students", icon: GraduationCap },
      { title: "Мұғалімдер", path: "/zavuch/teachers", icon: Users },
      { title: "Құжаттар", path: "/zavuch/documents", icon: FileCheck },
      { title: "Оқу бағдарламасы", path: "/zavuch/curriculum", icon: BookOpenCheck },
      { title: "Сабақ кестесі", path: "/zavuch/timetable", icon: BookMarked },
      { title: "Баптаулар", path: "/zavuch/settings", icon: Settings },
    ],
  },
  {
    title: "Мониторинг",
    icon: BarChart3,
    children: [
      { title: "Сабақ үлгерімі", path: "/zavuch/performance", icon: BarChart3 },
      { title: "Аналитика", path: "/zavuch/analytics", icon: BarChart3 },
    ],
  },
];

const teacherNav: NavEntry[] = [
  {
    title: "BilimApp",
    icon: GraduationCap,
    children: [
      { title: "Басты бет", path: "/teacher", icon: Home },
      { title: "Сынып жетекшілік", path: "/teacher/leadership", icon: BookMarked },
      { title: "Электронды журнал", path: "/teacher/journal", icon: BookOpen },
      { title: "Бақылау тақтасы", path: "/teacher/monitoring", icon: LayoutDashboard },
      { title: "Менің кестем", path: "/teacher/schedule", icon: Calendar },
      { title: "Үй тапсырмасы", path: "/teacher/homework", icon: ClipboardList },
      { title: "Оқушылармен байланыс", path: "/teacher/chat", icon: MessageSquare },
      { title: "Құжаттар", path: "/teacher/documents", icon: FileCheck },
      { title: "БЖБ / ТЖБ", path: "/teacher/assessments", icon: Sparkles },
    ],
  },
  { title: "Профиль", path: "/teacher/profile", icon: User },
];

const studentNav: NavEntry[] = [
  { title: "Басты бет", path: "/student", icon: Home },
  { title: "Менің кестем", path: "/student/schedule", icon: Calendar },
  { title: "Менің бағаларым", path: "/student/grades", icon: BarChart3 },
  { title: "Мұғаліммен байланыс", path: "/student/chat", icon: MessageSquare },
  { title: "Үй тапсырмасы", path: "/student/homework", icon: ClipboardList },
  { title: "Профиль", path: "/student/profile", icon: User },
];

const parentNav: NavEntry[] = [
  { title: "Басты бет", path: "/parent", icon: Home },
  { title: "Сабақ кестесі", path: "/parent/schedule", icon: Calendar },
  { title: "Мұғаліммен байланыс", path: "/parent/chat", icon: MessageSquare },
  { title: "Бағалар", path: "/parent/grades", icon: BarChart3 },
  { title: "Үй тапсырмасы", path: "/parent/homework", icon: ClipboardList },
  { title: "Профиль", path: "/parent/profile", icon: User },
];

const librarianNav: NavEntry[] = [
  {
    title: "BilimApp",
    icon: Library,
    children: [
      { title: "Кітапті тіркеу", path: "/librarian/books", icon: BookOpen },
      { title: "Кітап алушыны тіркеу", path: "/librarian/borrowers", icon: Users },
      { title: "Онлайн кітапхана", path: "/librarian/library", icon: Library },
    ],
  },
  { title: "Профиль", path: "/librarian/profile", icon: User },
];

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Super Admin */}
          <Route element={<ProtectedRoute allowedRoles={["super_admin"]}><DashboardLayout roleName="Super Admin" navItems={superAdminNav} userName="Admin" /></ProtectedRoute>}>
            <Route path="/super-admin" element={<SuperAdminHome />} />
            <Route path="/super-admin/schools" element={<SuperAdminSchools />} />
            <Route path="/super-admin/applications" element={<SuperAdminApplications />} />
            <Route path="/super-admin/subjects" element={<SuperAdminSubjects />} />
            <Route path="/super-admin/users" element={<SuperAdminUsers />} />
            <Route path="/super-admin/analytics" element={<SuperAdminAnalytics />} />
            <Route path="/super-admin/logs" element={<SuperAdminLogs />} />
            <Route path="/super-admin/settings" element={<SuperAdminSettings />} />
            <Route path="/super-admin/profile" element={<ProfilePage />} />
          </Route>

          {/* Director */}
          <Route element={<ProtectedRoute allowedRoles={["director"]}><DashboardLayout roleName="Директор" navItems={directorNav} userName="Ахметова А." /></ProtectedRoute>}>
            <Route path="/director" element={<DirectorHome />} />
            <Route path="/director/monitoring" element={<MonitoringBoardPage />} />
            <Route path="/director/schedule" element={<SchedulePage />} />
            <Route path="/director/homework" element={<HomeworkPage />} />
            <Route path="/director/chat" element={<ChatPage />} />
            <Route path="/director/assessments" element={<AssessmentGeneratorPage />} />
            <Route path="/director/subjects" element={<SubjectsManagementPage />} />
            <Route path="/director/students" element={<DirectorStudents />} />
            <Route path="/director/teachers" element={<DirectorTeachers />} />
            <Route path="/director/documents" element={<DirectorDocuments />} />
            <Route path="/director/curriculum" element={<CurriculumPage />} />
            <Route path="/director/timetable" element={<SchedulePage />} />
            <Route path="/director/performance" element={<PerformanceMonitoringPage />} />
            <Route path="/director/analytics" element={<AnalyticsDetailPage />} />
            <Route path="/director/settings" element={<DirectorSettings />} />
            <Route path="/director/profile" element={<ProfilePage />} />
          </Route>

          {/* Zavuch */}
          <Route element={<ProtectedRoute allowedRoles={["zavuch"]}><DashboardLayout roleName="Завуч" navItems={zavuchNav} userName="Мұхтарова Д." /></ProtectedRoute>}>
            <Route path="/zavuch" element={<ZavuchHome />} />
            <Route path="/zavuch/monitoring" element={<MonitoringBoardPage />} />
            <Route path="/zavuch/schedule" element={<SchedulePage />} />
            <Route path="/zavuch/homework" element={<HomeworkPage />} />
            <Route path="/zavuch/chat" element={<ChatPage />} />
            <Route path="/zavuch/assessments" element={<AssessmentGeneratorPage />} />
            <Route path="/zavuch/subjects" element={<SubjectsManagementPage />} />
            <Route path="/zavuch/students" element={<DirectorStudents />} />
            <Route path="/zavuch/teachers" element={<DirectorTeachers />} />
            <Route path="/zavuch/documents" element={<DocumentsPage />} />
            <Route path="/zavuch/curriculum" element={<CurriculumPage />} />
            <Route path="/zavuch/timetable" element={<SchedulePage />} />
            <Route path="/zavuch/performance" element={<PerformanceMonitoringPage />} />
            <Route path="/zavuch/analytics" element={<AnalyticsDetailPage />} />
            <Route path="/zavuch/settings" element={<DirectorSettings />} />
            <Route path="/zavuch/profile" element={<ProfilePage />} />
          </Route>

          {/* Teacher */}
          <Route element={<ProtectedRoute allowedRoles={["teacher"]}><DashboardLayout roleName="Мұғалім" navItems={teacherNav} userName="Сейітов Қ." /></ProtectedRoute>}>
            <Route path="/teacher" element={<TeacherHome />} />
            <Route path="/teacher/monitoring" element={<MonitoringBoardPage />} />
            <Route path="/teacher/schedule" element={<SchedulePage />} />
            <Route path="/teacher/leadership" element={<ClassLeadershipPage />} />
            <Route path="/teacher/homework" element={<HomeworkPage />} />
            <Route path="/teacher/chat" element={<ChatPage />} />
            <Route path="/teacher/assessments" element={<AssessmentGeneratorPage />} />
            <Route path="/teacher/journal" element={<JournalPage />} />
            <Route path="/teacher/documents" element={<DocumentsPage />} />
            <Route path="/teacher/profile" element={<ProfilePage />} />
          </Route>

          {/* Student */}
          <Route element={<ProtectedRoute allowedRoles={["student"]}><DashboardLayout roleName="Оқушы" navItems={studentNav} userName="Назарбекова А." /></ProtectedRoute>}>
            <Route path="/student" element={<StudentHome />} />
            <Route path="/student/schedule" element={<SchedulePage />} />
            <Route path="/student/grades" element={<GradesPage />} />
            <Route path="/student/chat" element={<ChatPage />} />
            <Route path="/student/homework" element={<HomeworkPage canUpload />} />
            <Route path="/student/profile" element={<ProfilePage />} />
          </Route>

          {/* Parent */}
          <Route element={<ProtectedRoute allowedRoles={["parent"]}><DashboardLayout roleName="Ата-ана" navItems={parentNav} userName="Назарбеков Б." /></ProtectedRoute>}>
            <Route path="/parent" element={<ParentHome />} />
            <Route path="/parent/schedule" element={<SchedulePage />} />
            <Route path="/parent/chat" element={<ChatPage />} />
            <Route path="/parent/grades" element={<GradesPage />} />
            <Route path="/parent/homework" element={<HomeworkPage />} />
            <Route path="/parent/profile" element={<ProfilePage />} />
          </Route>

          {/* Librarian */}
          <Route element={<ProtectedRoute allowedRoles={["librarian"]}><DashboardLayout roleName="Кітапханашы" navItems={librarianNav} userName="Кітапханашы" /></ProtectedRoute>}>
            <Route path="/librarian/books" element={<BookRegistrationPage />} />
            <Route path="/librarian/borrowers" element={<BookBorrowerPage />} />
            <Route path="/librarian/library" element={<OnlineLibraryPage />} />
            <Route path="/librarian/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
