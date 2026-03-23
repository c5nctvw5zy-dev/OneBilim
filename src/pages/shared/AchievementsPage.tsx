import { Trophy, Medal, Star } from "lucide-react";

const achievements = [
  { title: "Үздік оқушы", desc: "1-тоқсанда орташа балл 4.8+", icon: Trophy, color: "text-warning" },
  { title: "Белсенді қатысушы", desc: "100% қатысу (қазан айы)", icon: Star, color: "text-primary" },
  { title: "Математика чемпионы", desc: "Олимпиадада 2-орын", icon: Medal, color: "text-success" },
  { title: "Кітапқұрт", desc: "Ай ішінде 5 кітап оқыды", icon: Star, color: "text-warning" },
];

const rankings = [
  { rank: 1, name: "Назарбекова Айым", class: "11А", points: 950 },
  { rank: 2, name: "Сейітов Арман", class: "10Б", points: 920 },
  { rank: 3, name: "Қасымова Дана", class: "9А", points: 890 },
  { rank: 4, name: "Мұхтаров Елдос", class: "11Б", points: 870 },
  { rank: 5, name: "Байжанова Мадина", class: "10А", points: 850 },
];

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Жетістіктер</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {achievements.map(a => (
          <div key={a.title} className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted shrink-0">
              <a.icon className={`h-6 w-6 ${a.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-card-foreground">Мектеп рейтингі</h3>
        <div className="space-y-2">
          {rankings.map(r => (
            <div key={r.rank} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  r.rank <= 3 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                }`}>{r.rank}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.class}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">{r.points} ұпай</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
