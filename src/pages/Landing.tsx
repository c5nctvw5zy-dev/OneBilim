import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  GraduationCap, BookOpen, Users, BarChart3, Shield, Smartphone,
  ChevronRight, Globe, CheckCircle2, Newspaper, Calendar, ChevronLeft,
} from "lucide-react";

interface DBNews { id: string; title: string; excerpt: string | null; content: string | null; image_url: string | null; created_at: string; }

const languages = { kk: "Қазақша", ru: "Русский", en: "English" } as const;
type Lang = keyof typeof languages;

const newsImages = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=300&fit=crop",
];

const content = {
  kk: {
    nav: { login: "Кіру", register: "Мектепті тіркеу" },
    hero: {
      badge: "Қазақстан мектептеріне арналған",
      title: "Заманауи білім беру платформасы",
      subtitle: "Мектепті басқару, электронды журнал, аналитика — бәрі бір жерде. BilimApp арқылы оқу процесін жеңілдетіңіз.",
      cta: "Бастау",
      ctaSecondary: "Толығырақ",
    },
    stats: [
      { value: "500+", label: "Мектептер" },
      { value: "15 000+", label: "Мұғалімдер" },
      { value: "200 000+", label: "Оқушылар" },
    ],
    features: {
      title: "Платформа мүмкіндіктері",
      subtitle: "Мектептің барлық процестерін бір жүйеде біріктіріңіз",
      items: [
        { icon: BookOpen, title: "Электронды журнал", desc: "Бағаларды қою, қатысуды бақылау, тоқсандық есептер" },
        { icon: Users, title: "Оқушылар мен мұғалімдер", desc: "Толық профильдер, рөлдер жүйесі, Excel импорт" },
        { icon: BarChart3, title: "Аналитика", desc: "Үлгерім динамикасы, пәндер бойынша графиктер" },
        { icon: Shield, title: "Қауіпсіздік", desc: "Face ID кіру, деректерді қорғау, рөлдер бойынша қол жетімділік" },
        { icon: GraduationCap, title: "Тесттер мен тапсырмалар", desc: "Онлайн тесттер, автоматты тексеру, материалдар" },
        { icon: Smartphone, title: "Мобильді нұсқа", desc: "Кез келген құрылғыдан ыңғайлы пайдалану" },
      ],
    },
    roles: {
      title: "Әр рөлге арналған панель",
      items: [
        "Super Admin — бүкіл платформаны басқару",
        "Директор — мектепті толық басқару",
        "Завуч — оқу процесін бақылау",
        "Мұғалім — журнал жүргізу, тесттер жасау",
        "Оқушы — бағалар, тапсырмалар, материалдар",
        "Ата-ана — баланың үлгерімін бақылау",
        "Кітапханашы — кітаптарды басқару",
      ],
    },
    cta: { title: "Мектебіңізді қазір тіркеңіз", subtitle: "1–2 жұмыс күні ішінде өтінім қаралады", button: "Тіркелу" },
    news: {
      title: "Білім жаңалықтары",
      items: [
        { date: "2026-04-03", title: "ҰБТ-2026: жаңа форматтағы тестілеу басталды", desc: "Биыл Ұлттық бірыңғай тестілеу алғаш рет адаптивті формат бойынша өткізіледі." },
        { date: "2026-04-01", title: "Қазақстанда 200-ден астам жаңа мектеп салынады", desc: "Білім министрлігі 2026 жылы елдің барлық аймақтарында 200+ жаңа мектеп салу жоспарын мақұлдады." },
        { date: "2026-03-28", title: "Цифрлық сауаттылық пәні міндетті болды", desc: "1-сыныптан бастап «Цифрлық сауаттылық» пәні міндетті оқу бағдарламасына енгізілді." },
        { date: "2026-03-25", title: "Мұғалімдер жалақысы 25%-ға артты", desc: "Үкімет педагогтар жалақысын 2026 жылдың сәуір айынан бастап 25%-ға арттыру туралы қаулы қабылдады." },
        { date: "2026-03-20", title: "BilimApp — жыл сайынғы EdTech марапатын жеңіп алды", desc: "BilimApp платформасы Central Asia EdTech Awards 2026 байқауында жеңімпаз атанды." },
      ],
    },
    footer: "© 2026 BilimApp. Барлық құқықтар қорғалған.",
  },
  ru: {
    nav: { login: "Войти", register: "Регистрация школы" },
    hero: { badge: "Для школ Казахстана", title: "Современная образовательная платформа", subtitle: "Управление школой, электронный журнал, аналитика — всё в одном месте.", cta: "Начать", ctaSecondary: "Подробнее" },
    stats: [{ value: "500+", label: "Школ" }, { value: "15 000+", label: "Учителей" }, { value: "200 000+", label: "Учеников" }],
    features: {
      title: "Возможности платформы", subtitle: "Объедините все процессы школы в одной системе",
      items: [
        { icon: BookOpen, title: "Электронный журнал", desc: "Оценки, посещаемость, четвертные отчёты" },
        { icon: Users, title: "Ученики и учителя", desc: "Полные профили, система ролей, импорт Excel" },
        { icon: BarChart3, title: "Аналитика", desc: "Динамика успеваемости, графики по предметам" },
        { icon: Shield, title: "Безопасность", desc: "Face ID, защита данных, доступ по ролям" },
        { icon: GraduationCap, title: "Тесты и задания", desc: "Онлайн тесты, автопроверка, материалы" },
        { icon: Smartphone, title: "Мобильная версия", desc: "Удобно с любого устройства" },
      ],
    },
    roles: { title: "Панель для каждой роли", items: ["Super Admin — управление платформой", "Директор — полное управление школой", "Завуч — контроль учебного процесса", "Учитель — журнал, тесты", "Ученик — оценки, задания, материалы", "Родитель — отслеживание успеваемости", "Библиотекарь — управление книгами"] },
    cta: { title: "Зарегистрируйте вашу школу", subtitle: "Заявка рассматривается в течение 1–2 рабочих дней", button: "Регистрация" },
    news: {
      title: "Новости образования",
      items: [
        { date: "2026-04-03", title: "ЕНТ-2026: начинается тестирование в новом формате", desc: "В этом году ЕНТ впервые проводится в адаптивном формате." },
        { date: "2026-04-01", title: "В Казахстане построят более 200 новых школ", desc: "Министерство образования утвердило план строительства 200+ новых школ." },
        { date: "2026-03-28", title: "Цифровая грамотность стала обязательным предметом", desc: "С 1-го класса предмет «Цифровая грамотность» включён в обязательную программу." },
        { date: "2026-03-25", title: "Зарплата учителей выросла на 25%", desc: "Правительство приняло постановление о повышении зарплаты педагогов на 25%." },
        { date: "2026-03-20", title: "BilimApp — победитель ежегодной премии EdTech", desc: "Платформа BilimApp стала победителем Central Asia EdTech Awards 2026." },
      ],
    },
    footer: "© 2026 BilimApp. Все права защищены.",
  },
  en: {
    nav: { login: "Log in", register: "Register School" },
    hero: { badge: "For Kazakhstan Schools", title: "Modern Education Platform", subtitle: "School management, digital gradebook, analytics — all in one place.", cta: "Get Started", ctaSecondary: "Learn More" },
    stats: [{ value: "500+", label: "Schools" }, { value: "15,000+", label: "Teachers" }, { value: "200,000+", label: "Students" }],
    features: {
      title: "Platform Features", subtitle: "Unite all school processes in one system",
      items: [
        { icon: BookOpen, title: "Digital Gradebook", desc: "Grades, attendance, quarterly reports" },
        { icon: Users, title: "Students & Teachers", desc: "Full profiles, role system, Excel import" },
        { icon: BarChart3, title: "Analytics", desc: "Performance dynamics, subject-based charts" },
        { icon: Shield, title: "Security", desc: "Face ID login, data protection, role-based access" },
        { icon: GraduationCap, title: "Tests & Assignments", desc: "Online tests, auto-check, materials" },
        { icon: Smartphone, title: "Mobile Ready", desc: "Convenient on any device" },
      ],
    },
    roles: { title: "Panel for Every Role", items: ["Super Admin — full platform management", "Director — complete school management", "Vice Principal — education monitoring", "Teacher — gradebook, tests", "Student — grades, assignments, materials", "Parent — track child's progress", "Librarian — book management"] },
    cta: { title: "Register Your School Now", subtitle: "Application reviewed within 1–2 business days", button: "Register" },
    news: {
      title: "Education News",
      items: [
        { date: "2026-04-03", title: "UNT-2026: new adaptive testing format launched", desc: "This year, the Unified National Test is conducted in an adaptive format for the first time." },
        { date: "2026-04-01", title: "Over 200 new schools to be built in Kazakhstan", desc: "The Ministry of Education approved a plan to build 200+ new schools." },
        { date: "2026-03-28", title: "Digital literacy becomes a mandatory subject", desc: "From 1st grade, 'Digital Literacy' is now part of the mandatory curriculum." },
        { date: "2026-03-25", title: "Teacher salaries increased by 25%", desc: "The government adopted a decree to raise teacher salaries by 25%." },
        { date: "2026-03-20", title: "BilimApp wins annual EdTech award", desc: "BilimApp platform won the Central Asia EdTech Awards 2026." },
      ],
    },
    footer: "© 2026 BilimApp. All rights reserved.",
  },
};

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${className}`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", filter: visible ? "blur(0)" : "blur(4px)", transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function Landing() {
  const [lang, setLang] = useState<Lang>("kk");
  const [currentNews, setCurrentNews] = useState(0);
  const [dbNews, setDbNews] = useState<DBNews[]>([]);
  const t = content[lang];

  useEffect(() => {
    supabase.from("news").select("id, title, excerpt, content, image_url, created_at")
      .eq("published", true).order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => setDbNews((data as DBNews[]) || []));
  }, []);

  // Use DB news if any published, otherwise fallback static items.
  const newsItems = dbNews.length > 0
    ? dbNews.map((n, i) => ({ date: n.created_at.slice(0, 10), title: n.title, desc: n.excerpt || n.content?.slice(0, 200) || "", image: n.image_url || newsImages[i % newsImages.length] }))
    : t.news.items.map((it, i) => ({ ...it, image: newsImages[i % newsImages.length] }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNews(prev => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [newsItems.length]);

  const prevNews = () => setCurrentNews(prev => (prev - 1 + newsItems.length) % newsItems.length);
  const nextNews = () => setCurrentNews(prev => (prev + 1) % newsItems.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <GraduationCap className="h-7 w-7" /> BilimApp
          </Link>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
              onClick={() => { const keys = Object.keys(languages) as Lang[]; setLang(keys[(keys.indexOf(lang) + 1) % keys.length]); }}>
              <Globe className="h-4 w-4" /> {languages[lang]}
            </button>
            <Link to="/login"><Button variant="ghost" size="sm">{t.nav.login}</Button></Link>
            <Link to="/register"><Button size="sm">{t.nav.register}</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(0_0%_100%/0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-medium text-primary-foreground/90 animate-fade-in">{t.hero.badge}</span>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-primary-foreground md:text-6xl text-balance animate-fade-in" style={{ animationDelay: "100ms" }}>{t.hero.title}</h1>
            <p className="mb-8 text-lg text-primary-foreground/80 text-balance animate-fade-in" style={{ animationDelay: "200ms" }}>{t.hero.subtitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <Link to="/register"><Button variant="hero-outline" size="xl">{t.hero.cta} <ChevronRight className="h-5 w-5" /></Button></Link>
              <a href="#features"><Button variant="ghost" size="xl" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">{t.hero.ctaSecondary}</Button></a>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "450ms" }}>
            {t.stats.map(s => (
              <div key={s.label} className="rounded-xl bg-primary-foreground/10 p-5 text-center backdrop-blur-sm">
                <div className="text-3xl font-bold text-primary-foreground tabular-nums">{s.value}</div>
                <div className="mt-1 text-sm text-primary-foreground/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-24">
        <Section>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground text-balance">{t.features.title}</h2>
            <p className="mt-3 text-muted-foreground">{t.features.subtitle}</p>
          </div>
        </Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((f, i) => (
            <Section key={f.title} delay={i * 80}>
              <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Section>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="bg-card border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <Section><h2 className="mb-10 text-center text-3xl font-bold text-foreground text-balance">{t.roles.title}</h2></Section>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {t.roles.items.map((r, i) => (
              <Section key={r} delay={i * 70}>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span className="text-sm text-foreground">{r}</span>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* News Carousel */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <Section>
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Newspaper className="h-4 w-4" /> {t.news.title}
            </div>
            <h2 className="text-3xl font-bold text-foreground text-balance">{t.news.title}</h2>
          </div>
        </Section>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="relative h-48 md:h-64 overflow-hidden">
              <img src={newsItems[currentNews].image} alt={newsItems[currentNews].title}
                className="h-full w-full object-cover transition-all duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
            <div className="p-6">
              <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground tabular-nums mb-2">{newsItems[currentNews].date}</span>
              <h3 className="text-lg font-semibold text-card-foreground mb-2 leading-snug">{newsItems[currentNews].title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{newsItems[currentNews].desc}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button onClick={prevNews} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card hover:bg-accent transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {newsItems.map((_, i) => (
                <button key={i} onClick={() => setCurrentNews(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === currentNews ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/30"}`} />
              ))}
            </div>
            <button onClick={nextNews} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card hover:bg-accent transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <Section>
          <div className="hero-gradient rounded-2xl p-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-primary-foreground text-balance">{t.cta.title}</h2>
            <p className="mb-8 text-primary-foreground/70">{t.cta.subtitle}</p>
            <Link to="/register"><Button variant="hero-outline" size="xl">{t.cta.button} <ChevronRight className="h-5 w-5" /></Button></Link>
          </div>
        </Section>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <a href="/copyright" className="hover:text-foreground hover:underline transition-colors">{t.footer}</a>
      </footer>
    </div>
  );
}
