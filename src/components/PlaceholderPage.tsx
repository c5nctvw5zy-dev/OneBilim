export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center">
        <p className="text-muted-foreground">Бұл бет әзірленуде. Backend қосылғаннан кейін қолжетімді болады.</p>
      </div>
    </div>
  );
}
