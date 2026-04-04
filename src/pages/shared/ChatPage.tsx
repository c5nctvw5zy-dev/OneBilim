import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Circle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const classes = ["9А", "9Б", "10А", "10Б", "11А", "11Б"];
const studentsByClass: Record<string, { name: string; online: boolean }[]> = {
  "9А": [
    { name: "Назарбекова Айым", online: true },
    { name: "Сейітов Арман", online: false },
    { name: "Қасымова Дана", online: true },
  ],
  "9Б": [{ name: "Мұхтаров Елдос", online: true }],
  "10А": [{ name: "Байжанова Мадина", online: false }],
  "10Б": [{ name: "Тұрсынов Асқар", online: true }],
  "11А": [{ name: "Ахметова Сара", online: true }],
  "11Б": [{ name: "Жұмабеков Ерлан", online: false }],
};

const demoMessages = [
  { from: "me", text: "Сәлем! Үй тапсырмасын тапсырдың ба?", time: "14:30" },
  { from: "student", text: "Сәлеметсіз бе! Иә, тапсырдым.", time: "14:32" },
  { from: "me", text: "Жарайсың! Келесі тапсырманы ұмытпа.", time: "14:33" },
];

export default function ChatPage() {
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const students = studentsByClass[selectedClass] || [];

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr] h-[calc(100vh-200px)]">
      {/* Sidebar */}
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Сынып таңдау</CardTitle>
          <div className="flex flex-wrap gap-1 mt-2">
            {classes.map((c) => (
              <Button key={c} size="sm" variant={selectedClass === c ? "default" : "outline"} onClick={() => { setSelectedClass(c); setSelectedStudent(null); }}>
                {c}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <p className="text-xs text-muted-foreground mb-2">Оқушылар</p>
          <div className="space-y-1">
            {students.map((s) => (
              <button key={s.name} className={`w-full flex items-center gap-2 rounded-lg p-2 text-left text-sm transition-colors ${selectedStudent === s.name ? "bg-primary/10 text-primary" : "hover:bg-muted"}`} onClick={() => setSelectedStudent(s.name)}>
                <Circle className={`h-2.5 w-2.5 fill-current ${s.online ? "text-success" : "text-muted-foreground"}`} />
                <span className="text-foreground">{s.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat area */}
      <Card className="flex flex-col">
        {selectedStudent ? (
          <>
            <CardHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{selectedStudent}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {students.find((s) => s.name === selectedStudent)?.online ? "🟢 Онлайн" : "⚪ Оффлайн"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {demoMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        <p>{m.text}</p>
                        <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <div className="border-t border-border p-3 flex gap-2">
              <Button variant="outline" size="icon"><Paperclip className="h-4 w-4" /></Button>
              <Input placeholder="Хабарлама жазыңыз..." value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1" />
              <Button size="icon"><Send className="h-4 w-4" /></Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
            Оқушыны таңдаңыз
          </div>
        )}
      </Card>
    </div>
  );
}
