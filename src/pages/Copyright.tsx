import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function Copyright() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-lg">
            <GraduationCap className="h-6 w-6" /> BilimApp
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Басты бетке
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Авторлық құқық</h1>
        <p className="mb-8 text-sm text-muted-foreground">© 2026 BilimApp. Барлық құқықтар қорғалған.</p>

        <article className="space-y-5 text-foreground leading-relaxed">
          <p>
            <strong>BilimApp</strong> — Қазақстан Республикасының білім беру ұйымдарына арналған
            заманауи цифрлық SaaS-платформа болып табылады. Аталған платформа{" "}
            <strong>Сарсембек Әлихан Ринатұлы</strong> тарапынан әзірленген және оның зияткерлік
            меншігі болып есептеледі.
          </p>

          <p>BilimApp құрамына кіретін барлық материалдар, соның ішінде (бірақ онымен шектелмей):</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>бағдарламалық код (frontend, backend, API)</li>
            <li>интерфейс және дизайн шешімдері (UI/UX)</li>
            <li>деректер құрылымы және архитектура</li>
            <li>функционал мүмкіндіктер мен логикалық модельдер</li>
            <li>мәтіндік контент, кестелер, модульдер</li>
            <li>атаулар, терминдер, құрылымдық шешімдер</li>
          </ul>
          <p>
            Қазақстан Республикасының авторлық құқық және сабақтас құқықтар туралы заңнамасына
            сәйкес толық қорғалады.
          </p>

          <p>Осы платформаны немесе оның кез келген бөлігін:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>көшіруге</li>
            <li>өзгертуге</li>
            <li>қайта таратуға</li>
            <li>коммерциялық мақсатта пайдалануға</li>
            <li>үшінші тұлғаларға беруге</li>
            <li>басқа жүйелерге интеграциялауға</li>
          </ul>
          <p>тек автордың алдын ала жазбаша рұқсатымен ғана жол беріледі.</p>

          <p>
            <strong>BilimApp</strong> атауы, логотипі, визуалдық стилі және бренд элементтері
            зияткерлік меншік объектісі болып табылады және заңмен қорғалады. Оларды рұқсатсыз
            пайдалану Қазақстан Республикасының қолданыстағы заңнамасына сәйкес жауапкершілікке
            әкеледі.
          </p>

          <p>
            Платформаны заңсыз көшіру, бұзу, өзгерту немесе рұқсатсыз пайдалану жағдайында автор
            тиісті құқық қорғау органдарына жүгіну және келтірілген зиянды өндіріп алу құқығын
            өзіне қалдырады.
          </p>

          <p>
            BilimApp жүйесі үнемі жаңартылып және жетілдіріліп отырады. Автор платформа
            функционалын өзгертуге, толықтыруға немесе шектеуге құқылы.
          </p>

          <p>
            Платформаны пайдалану арқылы пайдаланушы осы авторлық құқық шарттарымен толық
            келіседі.
          </p>

          <div className="mt-8 rounded-xl border border-border bg-card p-5">
            <p><strong>Автор:</strong> Сарсембек Әлихан Ринатұлы</p>
            <p><strong>Орналасқан жері:</strong> Қазақстан Республикасы, Алматы қаласы</p>
          </div>
        </article>
      </main>
      <footer className="border-t border-border bg-card py-6 text-center text-sm text-muted-foreground">
        © 2026 BilimApp. Барлық құқықтар қорғалған.
      </footer>
    </div>
  );
}
