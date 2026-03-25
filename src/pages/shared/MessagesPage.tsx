import { Button } from "@/components/ui/button";
import { Send, User } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const initialMessages = [
  { id: 1, from: "Сейітов Қ. (Математика)", text: "Баланыздың математикадан үлгерімі жақсы. Алайда, үй тапсырмаларын уақытында тапсырса, орташа балл жоғарылайды.", time: "2 сағат бұрын", isTeacher: true },
  { id: 2, from: "Сіз", text: "Рахмет, мұғалім! Бақылаймыз.", time: "1 сағат бұрын", isTeacher: false },
  { id: 3, from: "Ахметова Г. (Биология)", text: "Ертеңгі зертханалық жұмысқа дайындалу қажет. Тақырып: 'Жасуша құрылымы'.", time: "Кеше", isTeacher: true },
  { id: 4, from: "Мектеп әкімшілігі", text: "Ата-аналар жиналысы 28 наурыз, сағат 18:00-де өтеді.", time: "3 күн бұрын", isTeacher: true },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), from: "Сіз", text: newMessage, time: "Қазір", isTeacher: false }]);
    setNewMessage("");
    toast({ title: "Хабарлама жіберілді!" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Хабарламалар</h2>
      <div className="space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`rounded-xl border border-border p-4 shadow-sm ${m.isTeacher ? "bg-card" : "bg-primary/5 ml-8"}`}>
            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${m.isTeacher ? "bg-primary/10" : "bg-muted"}`}>
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{m.from}</p>
                  <span className="text-xs text-muted-foreground">{m.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{m.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Хабарлама жазу..."
          className="flex-1"
        />
        <Button className="gap-2" disabled={!newMessage.trim()} onClick={handleSend}>
          <Send className="h-4 w-4" />
          Жіберу
        </Button>
      </div>
    </div>
  );
}
