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
import Copyright from "./pages/Copyright";
import ForgotPassword from "./pages/ForgotPassword";
import OAuthConsent from "./pages/OAuthConsent";

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
import SuperAdminNews from "./pages/superadmin/SuperAdminNews";

// Director
import DirectorHome from "./pages/director/DirectorHome";
import DirectorStudents from "./pages/director/DirectorClasses";
import DirectorTeachers from "./pages/director/DirectorTeachers";
import DirectorDocuments from "./pages/director/DirectorDocuments";
import DirectorSettings from "./pages/director/DirectorSettings";

// Zavuch
import ZavuchHome from "./pages/zavuch/ZavuchHome";

// Teacher
import TeacherHome from "./pages/teacher/TeacherHome";
import MyClassPage from "./pages/teacher/MyClassPage";
import KtpEditorPage from "./pages/teacher/KtpEditorPage";

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
import AdminAIAssistantPage from "./pages/shared/AdminAIAssistantPage";
import CurriculumAIPage from "./pages/shared/CurriculumAIPage";
import SubjectsCatalogPage from "./pages/shared/SubjectsCatalogPage";

// Librarian
import BookRegistrationPage from "./pages/librarian/BookRegistrationPage";
import BookBorrowerPage from "./pages/librarian/BookBorrowerPage";
import OnlineLibraryPage from "./pages/librarian/OnlineLibraryPage";

// Жаңа рөлдер (Психолог, Әлеуметтік педагог, Логопед, Медбике, Кадр, Хатшы)
import {
  PsychologistConsult, PsychologistTests, PsychologistWork,
  SocialMonitoring, SocialFamily,
  SpeechIndividual, SpeechInclusive,
  NurseHealth, NurseFirstAid, NurseCards,
  HrStaff, HrHiring,
  SecretaryOrders, SecretaryWriteLetter, SecretaryRegisterDocs, SecretaryDocsWork,
} from "./pages/staff/StaffPages";

import {
  AlphabetBookPage, OrdersBookPage, StaffPage, TimesheetsPage, JournalPercentPage,
} from "./pages/admin/AdminPages";

import {
  Home, School, ClipboardList, BookOpen, Users, BarChart3, FileText, Settings, GraduationCap, Calendar,
  FileCheck, BookMarked, CheckCircle, LayoutDashboard, MessageSquare, Sparkles, BookOpenCheck, User, Library,
  Newspaper, Shield, Building2, Brain, HeartPulse, Accessibility, Stethoscope, Briefcase, FileSignature,
} from "lucide-react";

const superAdminNav: NavEntry[] = [
  {
    title: "Жүйені басқару",
    icon: Settings,
    children: [
      { title: "Басты бет", path: "/super-admin", icon: Home },
      { title: "Жүйе баптаулары", path: "/super-admin/settings", icon: Settings },
      { title: "Өтінімдер", path: "/super-admin/applications", icon: ClipboardList },
      { title: "Пәндер", path: "/super-admin/subjects", icon: BookOpen },
    ],
  },
  {
    title: "Ұйымдар",
    icon: Building2,
    children: [
      { title: "Мектептер", path: "/super-admin/schools", icon: School },
    ],
  },
  { title: "Профиль", path: "/super-admin/profile", icon: User },
  { title: "Пайдаланушылар", path: "/super-admin/users", icon: Users },
  { title: "Аналитика", path: "/super-admin/analytics", icon: BarChart3 },
  { title: "Жаңалықтар", path: "/super-admin/news", icon: Newspaper },
  {
    title: "Қауіпсіздік",
    icon: Shield,
    children: [
      { title: "Логтар", path: "/super-admin/logs", icon: FileText },
    ],
  },
];

const directorNav: NavEntry[] = [
  {
    title: "BilimApp",
    icon: GraduationCap,
    children: [
      { title: "Басты бет", path: "/director", icon: Home },
      { title: "🤖 ЖИ көмекші", path: "/director/ai", icon: Sparkles },
      { title: "Бақылау тақтасы", path: "/director/monitoring", icon: LayoutDashboard },
      { title: "Менің кестем", path: "/director/schedule", icon: Calendar },
      { title: "Үй тапсырмасы", path: "/director/homework", icon: ClipboardList },
      { title: "Оқушылармен байланыс", path: "/director/chat", icon: MessageSquare },
      { title: "БЖБ / ТЖБ", path: "/director/assessments", icon: Sparkles },
      { title: "Пәндер", path: "/director/subjects", icon: BookOpen },
      { title: "🤖 ҚМЖ/КТЖ генератор", path: "/director/curriculum-ai", icon: Sparkles },
    ],
  },
  { title: "Профиль", path: "/director/profile", icon: User },
  {
    title: "Басқарулар",
    icon: Settings,
    children: [
      { title: "Оқушылар мен сыныптар", path: "/director/students", icon: GraduationCap },
      { title: "Мұғалімдер", path: "/director/teachers", icon: Users },
      { title: "Қызметкерлер", path: "/director/staff", icon: Briefcase },
      { title: "Алфавиттік кітап", path: "/director/alphabet", icon: BookMarked },
      { title: "Бұйрықтар кітабы", path: "/director/orders", icon: FileSignature },
      { title: "Табельдер", path: "/director/timesheets", icon: FileText },
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
      { title: "Журнал пайыздары", path: "/director/journal-percent", icon: BarChart3 },
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
      { title: "🤖 ЖИ көмекші", path: "/zavuch/ai", icon: Sparkles },
      { title: "Бақылау тақтасы", path: "/zavuch/monitoring", icon: LayoutDashboard },
      { title: "Менің кестем", path: "/zavuch/schedule", icon: Calendar },
      { title: "Үй тапсырмасы", path: "/zavuch/homework", icon: ClipboardList },
      { title: "Оқушылармен байланыс", path: "/zavuch/chat", icon: MessageSquare },
      { title: "БЖБ / ТЖБ", path: "/zavuch/assessments", icon: Sparkles },
      { title: "Пәндер", path: "/zavuch/subjects", icon: BookOpen },
      { title: "🤖 ҚМЖ/КТЖ генератор", path: "/zavuch/curriculum-ai", icon: Sparkles },
    ],
  },
  { title: "Профиль", path: "/zavuch/profile", icon: User },
  {
    title: "Басқарулар",
    icon: Settings,
    children: [
      { title: "Оқушылар мен сыныптар", path: "/zavuch/students", icon: GraduationCap },
      { title: "Мұғалімдер", path: "/zavuch/teachers", icon: Users },
      { title: "Қызметкерлер", path: "/zavuch/staff", icon: Briefcase },
      { title: "Алфавиттік кітап", path: "/zavuch/alphabet", icon: BookMarked },
      { title: "Бұйрықтар кітабы", path: "/zavuch/orders", icon: FileSignature },
      { title: "Табельдер", path: "/zavuch/timesheets", icon: FileText },
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
      { title: "Журнал пайыздары", path: "/zavuch/journal-percent", icon: BarChart3 },
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
      { title: "Менің сыныбым", path: "/teacher/leadership", icon: BookMarked },
      { title: "КТЖ басқару", path: "/teacher/ktp", icon: ClipboardList },
      { title: "🤖 ЖИ көмекші", path: "/teacher/ai", icon: Sparkles },
      { title: "Электронды журнал", path: "/teacher/journal", icon: BookOpen },
      { title: "Менің кестем", path: "/teacher/schedule", icon: Calendar },
      { title: "🤖 ҚМЖ/КТЖ генератор", path: "/teacher/curriculum-ai", icon: Sparkles },
      { title: "Пәндер каталогы", path: "/teacher/subjects", icon: BookOpen },
    ],
  },
  { title: "Бақылау тақтасы", path: "/teacher/monitoring", icon: LayoutDashboard },
  { title: "Үй тапсырмасы", path: "/teacher/homework", icon: ClipboardList },
  { title: "Оқушылармен байланыс", path: "/teacher/chat", icon: MessageSquare },
  { title: "Құжаттар", path: "/teacher/documents", icon: FileCheck },
  { title: "БЖБ / ТЖБ", path: "/teacher/assessments", icon: Sparkles },
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

const psychologistNav: NavEntry[] = [
  { title: "🧑‍⚕️ Кеңес беру", path: "/psychologist/consult", icon: Brain },
  { title: "🧪 Тест жүргізу", path: "/psychologist/tests", icon: ClipboardList },
  { title: "📁 Оқушылармен жұмыс", path: "/psychologist/work", icon: FileText },
  { title: "💬 Чат", path: "/psychologist/chat", icon: MessageSquare },
  { title: "Профиль", path: "/psychologist/profile", icon: User },
];

const socialNav: NavEntry[] = [
  { title: "📊 Әлеуметтік бақылау", path: "/social/monitoring", icon: BarChart3 },
  { title: "👨‍👩‍👧 Отбасымен байланыс", path: "/social/family", icon: Users },
  { title: "💬 Чат", path: "/social/chat", icon: MessageSquare },
  { title: "Профиль", path: "/social/profile", icon: User },
];

const speechNav: NavEntry[] = [
  { title: "🧑‍🏫 Жеке сабақ", path: "/speech/individual", icon: BookOpen },
  { title: "♿ Инклюзивті білім", path: "/speech/inclusive", icon: Accessibility },
  { title: "💬 Чат", path: "/speech/chat", icon: MessageSquare },
  { title: "Профиль", path: "/speech/profile", icon: User },
];

const nurseNav: NavEntry[] = [
  { title: "🩺 Денсаулық тексеру", path: "/nurse/health", icon: Stethoscope },
  { title: "📕 Алғашқы көмек", path: "/nurse/first-aid", icon: HeartPulse },
  { title: "📁 Медициналық карталар", path: "/nurse/cards", icon: FileText },
  { title: "💬 Чат", path: "/nurse/chat", icon: MessageSquare },
  { title: "Профиль", path: "/nurse/profile", icon: User },
];

const hrNav: NavEntry[] = [
  { title: "👥 Қызметкерлер", path: "/hr/staff", icon: Users },
  { title: "📄 Жұмысқа қабылдау", path: "/hr/hiring", icon: Briefcase },
  { title: "💬 Чат", path: "/hr/chat", icon: MessageSquare },
  { title: "Профиль", path: "/hr/profile", icon: User },
];

const secretaryNav: NavEntry[] = [
  { title: "📜 Бұйрық кітабы", path: "/secretary/orders", icon: FileSignature },
  { title: "✉️ Хат жазу", path: "/secretary/letter", icon: MessageSquare },
  { title: "📂 Құжаттарды тіркеу", path: "/secretary/register-docs", icon: FileCheck },
  { title: "📁 Құжаттармен жұмыс", path: "/secretary/docs-work", icon: FileText },
  { title: "💬 Чат", path: "/secretary/chat", icon: MessageSquare },
  { title: "Профиль", path: "/secretary/profile", icon: User },
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
          <Route path="/copyright" element={<Copyright />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

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
            <Route path="/super-admin/news" element={<SuperAdminNews />} />
            <Route path="/super-admin/profile" element={<ProfilePage />} />
          </Route>

          {/* Director */}
          <Route element={<ProtectedRoute allowedRoles={["director"]}><DashboardLayout roleName="Директор" navItems={directorNav} userName="Ахметова А." /></ProtectedRoute>}>
            <Route path="/director" element={<DirectorHome />} />
            <Route path="/director/ai" element={<AdminAIAssistantPage />} />
            <Route path="/director/monitoring" element={<MonitoringBoardPage />} />
            <Route path="/director/schedule" element={<SchedulePage />} />
            <Route path="/director/homework" element={<HomeworkPage />} />
            <Route path="/director/chat" element={<ChatPage />} />
            <Route path="/director/assessments" element={<AssessmentGeneratorPage />} />
            <Route path="/director/subjects" element={<SubjectsCatalogPage />} />
            <Route path="/director/subjects/:subject" element={<SubjectsCatalogPage />} />
            <Route path="/director/subjects/:subject/:grade" element={<SubjectsCatalogPage />} />
            <Route path="/director/curriculum-ai" element={<CurriculumAIPage />} />
            <Route path="/director/students" element={<DirectorStudents />} />
            <Route path="/director/teachers" element={<DirectorTeachers />} />
            <Route path="/director/documents" element={<DirectorDocuments />} />
            <Route path="/director/curriculum" element={<CurriculumPage />} />
            <Route path="/director/timetable" element={<SchedulePage />} />
            <Route path="/director/performance" element={<PerformanceMonitoringPage />} />
            <Route path="/director/analytics" element={<AnalyticsDetailPage />} />
            <Route path="/director/staff" element={<StaffPage />} />
            <Route path="/director/alphabet" element={<AlphabetBookPage />} />
            <Route path="/director/orders" element={<OrdersBookPage />} />
            <Route path="/director/timesheets" element={<TimesheetsPage />} />
            <Route path="/director/journal-percent" element={<JournalPercentPage />} />
            <Route path="/director/settings" element={<DirectorSettings />} />
            <Route path="/director/profile" element={<ProfilePage />} />
          </Route>

          {/* Zavuch */}
          <Route element={<ProtectedRoute allowedRoles={["zavuch"]}><DashboardLayout roleName="Завуч" navItems={zavuchNav} userName="Мұхтарова Д." /></ProtectedRoute>}>
            <Route path="/zavuch" element={<ZavuchHome />} />
            <Route path="/zavuch/ai" element={<AdminAIAssistantPage />} />
            <Route path="/zavuch/monitoring" element={<MonitoringBoardPage />} />
            <Route path="/zavuch/schedule" element={<SchedulePage />} />
            <Route path="/zavuch/homework" element={<HomeworkPage />} />
            <Route path="/zavuch/chat" element={<ChatPage />} />
            <Route path="/zavuch/assessments" element={<AssessmentGeneratorPage />} />
            <Route path="/zavuch/subjects" element={<SubjectsCatalogPage />} />
            <Route path="/zavuch/subjects/:subject" element={<SubjectsCatalogPage />} />
            <Route path="/zavuch/subjects/:subject/:grade" element={<SubjectsCatalogPage />} />
            <Route path="/zavuch/curriculum-ai" element={<CurriculumAIPage />} />
            <Route path="/zavuch/students" element={<DirectorStudents />} />
            <Route path="/zavuch/teachers" element={<DirectorTeachers />} />
            <Route path="/zavuch/documents" element={<DocumentsPage />} />
            <Route path="/zavuch/curriculum" element={<CurriculumPage />} />
            <Route path="/zavuch/timetable" element={<SchedulePage />} />
            <Route path="/zavuch/performance" element={<PerformanceMonitoringPage />} />
            <Route path="/zavuch/analytics" element={<AnalyticsDetailPage />} />
            <Route path="/zavuch/staff" element={<StaffPage />} />
            <Route path="/zavuch/alphabet" element={<AlphabetBookPage />} />
            <Route path="/zavuch/orders" element={<OrdersBookPage />} />
            <Route path="/zavuch/timesheets" element={<TimesheetsPage />} />
            <Route path="/zavuch/journal-percent" element={<JournalPercentPage />} />
            <Route path="/zavuch/settings" element={<DirectorSettings />} />
            <Route path="/zavuch/profile" element={<ProfilePage />} />
          </Route>

          {/* Teacher */}
          <Route element={<ProtectedRoute allowedRoles={["teacher"]}><DashboardLayout roleName="Мұғалім" navItems={teacherNav} userName="Сейітов Қ." /></ProtectedRoute>}>
            <Route path="/teacher" element={<TeacherHome />} />
            <Route path="/teacher/ai" element={<AdminAIAssistantPage />} />
            <Route path="/teacher/monitoring" element={<MonitoringBoardPage />} />
            <Route path="/teacher/schedule" element={<SchedulePage />} />
            <Route path="/teacher/leadership" element={<MyClassPage />} />
            <Route path="/teacher/ktp" element={<KtpEditorPage />} />
            <Route path="/teacher/homework" element={<HomeworkPage />} />
            <Route path="/teacher/chat" element={<ChatPage />} />
            <Route path="/teacher/assessments" element={<AssessmentGeneratorPage />} />
            <Route path="/teacher/journal" element={<JournalPage />} />
            <Route path="/teacher/curriculum-ai" element={<CurriculumAIPage />} />
            <Route path="/teacher/subjects" element={<SubjectsCatalogPage />} />
            <Route path="/teacher/subjects/:subject" element={<SubjectsCatalogPage />} />
            <Route path="/teacher/subjects/:subject/:grade" element={<SubjectsCatalogPage />} />
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

          {/* Психолог */}
          <Route element={<ProtectedRoute allowedRoles={["psychologist"]}><DashboardLayout roleName="Психолог" navItems={psychologistNav} userName="Психолог" /></ProtectedRoute>}>
            <Route path="/psychologist" element={<PsychologistConsult />} />
            <Route path="/psychologist/consult" element={<PsychologistConsult />} />
            <Route path="/psychologist/tests" element={<PsychologistTests />} />
            <Route path="/psychologist/work" element={<PsychologistWork />} />
            <Route path="/psychologist/chat" element={<ChatPage />} />
            <Route path="/psychologist/profile" element={<ProfilePage />} />
          </Route>

          {/* Әлеуметтік педагог */}
          <Route element={<ProtectedRoute allowedRoles={["social_pedagogue"]}><DashboardLayout roleName="Әлеуметтік педагог" navItems={socialNav} userName="Әлеуметтік педагог" /></ProtectedRoute>}>
            <Route path="/social" element={<SocialMonitoring />} />
            <Route path="/social/monitoring" element={<SocialMonitoring />} />
            <Route path="/social/family" element={<SocialFamily />} />
            <Route path="/social/chat" element={<ChatPage />} />
            <Route path="/social/profile" element={<ProfilePage />} />
          </Route>

          {/* Логопед */}
          <Route element={<ProtectedRoute allowedRoles={["speech_therapist"]}><DashboardLayout roleName="Логопед" navItems={speechNav} userName="Логопед" /></ProtectedRoute>}>
            <Route path="/speech" element={<SpeechIndividual />} />
            <Route path="/speech/individual" element={<SpeechIndividual />} />
            <Route path="/speech/inclusive" element={<SpeechInclusive />} />
            <Route path="/speech/chat" element={<ChatPage />} />
            <Route path="/speech/profile" element={<ProfilePage />} />
          </Route>

          {/* Медбике */}
          <Route element={<ProtectedRoute allowedRoles={["nurse"]}><DashboardLayout roleName="Медбике" navItems={nurseNav} userName="Медбике" /></ProtectedRoute>}>
            <Route path="/nurse" element={<NurseHealth />} />
            <Route path="/nurse/health" element={<NurseHealth />} />
            <Route path="/nurse/first-aid" element={<NurseFirstAid />} />
            <Route path="/nurse/cards" element={<NurseCards />} />
            <Route path="/nurse/chat" element={<ChatPage />} />
            <Route path="/nurse/profile" element={<ProfilePage />} />
          </Route>

          {/* Кадр маманы */}
          <Route element={<ProtectedRoute allowedRoles={["hr"]}><DashboardLayout roleName="Кадр маманы" navItems={hrNav} userName="Кадр маманы" /></ProtectedRoute>}>
            <Route path="/hr" element={<HrStaff />} />
            <Route path="/hr/staff" element={<HrStaff />} />
            <Route path="/hr/hiring" element={<HrHiring />} />
            <Route path="/hr/chat" element={<ChatPage />} />
            <Route path="/hr/profile" element={<ProfilePage />} />
          </Route>

          {/* Хатшы */}
          <Route element={<ProtectedRoute allowedRoles={["secretary"]}><DashboardLayout roleName="Хатшы" navItems={secretaryNav} userName="Хатшы" /></ProtectedRoute>}>
            <Route path="/secretary" element={<SecretaryOrders />} />
            <Route path="/secretary/orders" element={<SecretaryOrders />} />
            <Route path="/secretary/letter" element={<SecretaryWriteLetter />} />
            <Route path="/secretary/register-docs" element={<SecretaryRegisterDocs />} />
            <Route path="/secretary/docs-work" element={<SecretaryDocsWork />} />
            <Route path="/secretary/chat" element={<ChatPage />} />
            <Route path="/secretary/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
