import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Phone, CheckCircle, FileText, UserPlus, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const allStudents = [
  { id: 1, name: "Назарбекова Айым", gender: "Қыз", phone: "+7 701 123 4567", parent: "Назарбеков Б.", parentPhone: "+7 702 234 5678", attendance: 96, parentRegistered: true },
  { id: 2, name: "Сейітов Арман", gender: "Ұл", phone: "+7 705 345 6789", parent: "Сейітова Г.", parentPhone: "+7 700 456 7890", attendance: 92, parentRegistered: true },
  { id: 3, name: "Қасымова Дана", gender: "Қыз", phone: "+7 707 567 8901", parent: "Қасымов А.", parentPhone: "+7 701 678 9012", attendance: 98, parentRegistered: false },
  { id: 4, name: "Мұхтаров Елдос", gender: "Ұл", phone: "+7 708 789 0123", parent: "Мұхтарова Д.", parentPhone: "+7 702 890 1234", attendance: 88, parentRegistered: true },
  { id: 5, name: "Байжанова Мадина", gender: "Қыз", phone: "+7 700 901 2345", parent: "Байжанов К.", parentPhone: "+7 705 012 3456", attendance: 95, parentRegistered: false },
  { id: 6, name: "Тұрсынов Асқар", gender: "Ұл", phone: "+7 701 234 5678", parent: "Тұрсынова Л.", parentPhone: "+7 707 345 6789", attendance: 90, parentRegistered: true },
  { id: 7, name: "Ахметова Сара", gender: "Қыз", phone: "+7 702 111 2222", parent: "", parentPhone: "", attendance: 94, parentRegistered: false },
  { id: 8, name: "Жұмабеков Ерлан", gender: "Ұл", phone: "+7 705 333 4444", parent: "", parentPhone: "", attendance: 91, parentRegistered: false },
];

type GroupMethod = "alphabet" | "count" | "gender";

export default function ClassLeadershipPage() {
  const { toast } = useToast();
  const [groupBy, setGroupBy] = useState<GroupMethod>("alphabet");
  const [students, setStudents] = useState(allStudents);
  const [showRegisterParent, setShowRegisterParent] = useState<number | null>(null);
  const [showTransfer, setShowTransfer] = useState<number | null>(null);
  const [showMindezdeme, setShowMindezdeme] = useState<number | null>(null);
  const [parentForm, setParentForm] = useState({ name: "", phone: "", email: "" });
  const [transferGroup, setTransferGroup] = useState("");
  const [mindezdemeText, setMindezdemeText] = useState("");

  const getGroups = (): Record<string, typeof allStudents> => {
    const sorted = [...students];
    if (groupBy === "alphabet") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      const half = Math.ceil(sorted.length / 2);
      return { "1-топ": sorted.slice(0, half), "2-топ": sorted.slice(half) };
    }
    if (groupBy === "count") {
      sorted.sort((a, b) => b.attendance - a.attendance);
      const half = Math.ceil(sorted.length / 2);
      return { "1-топ (Жоғары)": sorted.slice(0, half), "2-топ (Төмен)": sorted.slice(half) };
    }
    return { "Қыз": sorted.filter(s => s.gender === "Қыз"), "Ұл": sorted.filter(s => s.gender === "Ұл") };
  };

  const grouped = getGroups();
  const groupNames = Object.keys(grouped);

  const handleRegisterParent = () => {
    if (!parentForm.name || !parentForm.phone) {
      toast({ title: "Аты мен телефонды толтырыңыз", variant: "destructive" });
      return;
    }
    toast({ title: "Ата-ана тіркелді!", description: `${parentForm.name} платформаға шақырылды` });
    setShowRegisterParent(null);
    setParentForm({ name: "", phone: "", email: "" });
  };

  const handleTransfer = () => {
    if (!transferGroup || showTransfer === null) return;
    toast({ title: "Ауыстырылды!", description: `Оқушы ${transferGroup} тобына ауыстырылды` });
    setShowTransfer(null);
    setTransferGroup("");
  };

  const generateMindezdeme = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const text = `Мінездеме\n\n${student.name} — тәртіпті, жауапкершілігі жоғары оқушы. Сабаққа қатысу деңгейі ${student.attendance}%. Сыныптастарымен жақсы қарым-қатынаста. Оқу үлгерімі жақсы деңгейде.\n\nБерілген күні: ${new Date().toLocaleDateString("kk-KZ")}\nСынып жетекші: ___________`;
    setMindezdemeText(text);
    setShowMindezdeme(studentId);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students"><Users className="h-4 w-4 mr-1" /> Оқушылар</TabsTrigger>
          <TabsTrigger value="parents"><Phone className="h-4 w-4 mr-1" /> Ата-аналар</TabsTrigger>
          <TabsTrigger value="attendance"><CheckCircle className="h-4 w-4 mr-1" /> Қатысу</TabsTrigger>
          <TabsTrigger value="character"><FileText className="h-4 w-4 mr-1" /> Мінездеме</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4 mt-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Label className="text-sm">Топқа бөлу:</Label>
            <div className="flex gap-1">
              {(["alphabet", "count", "gender"] as GroupMethod[]).map(m => (
                <Button key={m} size="sm" variant={groupBy === m ? "default" : "outline"} onClick={() => setGroupBy(m)}>
                  {m === "alphabet" ? "Алфавит" : m === "count" ? "Саны бойынша" : "Қыз / Ұл"}
                </Button>
              ))}
            </div>
          </div>

          {Object.entries(grouped).map(([group, items]) => (
            <Card key={group}>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{group} ({items.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.gender} · {s.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={s.attendance >= 95 ? "default" : s.attendance >= 90 ? "secondary" : "destructive"}>{s.attendance}%</Badge>
                        {!s.parentRegistered && (
                          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowRegisterParent(s.id)}>
                            <UserPlus className="h-3 w-3" /> Ата-ана
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setShowTransfer(s.id)}>
                          <ArrowRightLeft className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="parents" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {students.map(s => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.parent || "Тіркелмеген"}</p>
                      <p className="text-xs text-muted-foreground">Бала: {s.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{s.parentPhone || "—"}</span>
                      {!s.parentRegistered && (
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowRegisterParent(s.id)}>
                          <UserPlus className="h-3 w-3" /> Тіркеу
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {students.map(s => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm text-foreground">{s.name}</span>
                    <Badge variant={s.attendance >= 95 ? "default" : s.attendance >= 90 ? "secondary" : "destructive"}>{s.attendance}% қатысу</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="character" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {students.map(s => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm text-foreground">{s.name}</span>
                    <Button variant="outline" size="sm" onClick={() => generateMindezdeme(s.id)}>
                      <FileText className="h-3.5 w-3.5 mr-1" /> Мінездеме жазу
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Register parent dialog */}
      <Dialog open={showRegisterParent !== null} onOpenChange={v => { if (!v) setShowRegisterParent(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ата-ананы тіркеу</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">
            {students.find(s => s.id === showRegisterParent)?.name} оқушысының ата-анасын тіркеу
          </p>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Аты-жөні</Label><Input value={parentForm.name} onChange={e => setParentForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Телефон</Label><Input value={parentForm.phone} onChange={e => setParentForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Email</Label><Input type="email" value={parentForm.email} onChange={e => setParentForm(p => ({ ...p, email: e.target.value }))} /></div>
            <Button className="w-full" onClick={handleRegisterParent}>Тіркеу және шақыру</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer group dialog */}
      <Dialog open={showTransfer !== null} onOpenChange={v => { if (!v) setShowTransfer(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Басқа топқа ауыстыру</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">
            {students.find(s => s.id === showTransfer)?.name}
          </p>
          <Select value={transferGroup} onValueChange={setTransferGroup}>
            <SelectTrigger><SelectValue placeholder="Топ таңдаңыз" /></SelectTrigger>
            <SelectContent>
              {groupNames.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="w-full mt-3" onClick={handleTransfer}>Ауыстыру</Button>
        </DialogContent>
      </Dialog>

      {/* Мінezdeme dialog */}
      <Dialog open={showMindezdeme !== null} onOpenChange={v => { if (!v) setShowMindezdeme(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Мінездеме</DialogTitle></DialogHeader>
          <Textarea value={mindezdemeText} onChange={e => setMindezdemeText(e.target.value)} rows={10} className="font-mono text-sm" />
          <div className="flex gap-2">
            <Button onClick={() => { navigator.clipboard.writeText(mindezdemeText); toast({ title: "Көшірілді!" }); }}>Көшіру</Button>
            <Button variant="outline" onClick={() => {
              const blob = new Blob([mindezdemeText], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "mindezdeme.txt"; a.click();
            }}>Жүктеу</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
