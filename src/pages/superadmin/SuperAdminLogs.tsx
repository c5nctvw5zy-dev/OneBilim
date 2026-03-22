const logs = [
  { id: 1, user: "Ахметова А.", action: "Жаңа оқушылар қосты (15)", time: "2025-03-20 14:32", type: "create" },
  { id: 2, user: "Жүйе", action: "Жаңарту v2.4.1 орнатылды", time: "2025-03-20 12:00", type: "system" },
  { id: 3, user: "Сейітов Қ.", action: "Рөлді өзгертті: Мұғалім → Завуч", time: "2025-03-19 16:45", type: "update" },
  { id: 4, user: "Мұхтарова Д.", action: "Құжат жүктеді: лицензия.pdf", time: "2025-03-19 10:20", type: "upload" },
  { id: 5, user: "Жұмабаев Е.", action: "Мектеп тіркеу өтінімін жіберді", time: "2025-03-18 09:15", type: "create" },
];

const typeColors: Record<string, string> = {
  create: "bg-success/10 text-success",
  system: "bg-primary/10 text-primary",
  update: "bg-warning/10 text-warning",
  upload: "bg-muted text-muted-foreground",
};

export default function SuperAdminLogs() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Логтар</h2>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Пайдаланушы</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Әрекет</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Уақыт</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{l.user}</td>
                <td className="px-4 py-3 text-foreground">{l.action}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">{l.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
