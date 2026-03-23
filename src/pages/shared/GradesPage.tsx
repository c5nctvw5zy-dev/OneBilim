export default function GradesPage() {
  const subjects = [
    { name: "Математика", grades: [5, 4, 5, 5, 4, 5, 4, 5], avg: 4.6 },
    { name: "Қазақ тілі", grades: [4, 4, 3, 4, 5, 4, 4], avg: 4.0 },
    { name: "Физика", grades: [5, 5, 4, 5, 5, 5], avg: 4.8 },
    { name: "Биология", grades: [4, 3, 4, 4, 5, 4], avg: 4.0 },
    { name: "Тарих", grades: [5, 5, 5, 4, 5], avg: 4.8 },
    { name: "Ағылшын тілі", grades: [3, 4, 4, 3, 4, 3], avg: 3.5 },
    { name: "Химия", grades: [4, 5, 4, 4, 5], avg: 4.4 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Бағалар</h2>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Пән</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Бағалар</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Орташа</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {s.grades.map((g, i) => (
                      <span key={i} className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${
                        g === 5 ? "bg-success/10 text-success" : g === 4 ? "bg-primary/10 text-primary" : g === 3 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                      }`}>{g}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${
                    s.avg >= 4.5 ? "bg-success/10 text-success" : s.avg >= 3.5 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                  }`}>{s.avg}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
