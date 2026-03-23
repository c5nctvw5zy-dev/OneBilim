const demoSchedule = [
  { time: "08:30 - 09:15", mon: "Математика (9А)", tue: "Физика (10Б)", wed: "Қазақ тілі (9А)", thu: "Математика (11А)", fri: "Биология (9А)" },
  { time: "09:25 - 10:10", mon: "Ағылшын (10А)", tue: "Математика (9Б)", wed: "Тарих (10Б)", thu: "Физика (9А)", fri: "Химия (11А)" },
  { time: "10:20 - 11:05", mon: "Физика (11А)", tue: "Қазақ тілі (11Б)", wed: "Математика (10А)", thu: "Ағылшын (9Б)", fri: "Математика (10Б)" },
  { time: "11:15 - 12:00", mon: "Тарих (9Б)", tue: "Биология (10А)", wed: "Физика (9Б)", thu: "Қазақ тілі (10А)", fri: "Тарих (11Б)" },
  { time: "12:20 - 13:05", mon: "Қазақ тілі (10Б)", tue: "Химия (9А)", wed: "Ағылшын (11А)", thu: "Биология (11Б)", fri: "Физика (10А)" },
  { time: "13:15 - 14:00", mon: "Химия (11Б)", tue: "Тарих (9А)", wed: "Биология (10Б)", thu: "Химия (10Б)", fri: "Ағылшын (9А)" },
];

const days = ["mon", "tue", "wed", "thu", "fri"] as const;
const dayLabels = { mon: "Дүйсенбі", tue: "Сейсенбі", wed: "Сәрсенбі", thu: "Бейсенбі", fri: "Жұма" };

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Сабақ кестесі</h2>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-32">Уақыт</th>
              {days.map(d => (
                <th key={d} className="px-4 py-3 text-left font-medium text-muted-foreground">{dayLabels[d]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {demoSchedule.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium text-primary tabular-nums">{row.time}</td>
                {days.map(d => (
                  <td key={d} className="px-4 py-3 text-foreground text-xs">{row[d]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
