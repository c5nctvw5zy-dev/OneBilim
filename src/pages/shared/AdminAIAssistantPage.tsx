import AIAssistant from "@/components/AIAssistant";
import TeacherAIWorkspace from "@/components/TeacherAIWorkspace";
import { useAuth } from "@/hooks/useAuth";

export default function AdminAIAssistantPage() {
  const { profile, role } = useAuth();
  const isTeacher = role === "teacher";

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">🤖 ЖИ көмекші</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isTeacher
            ? "Жоспар · Презентация · Тапсырмалар · Жеке оқыту · Көрнекіліктер · Зертхана · Талдау"
            : "Талдау, бұйрық/хат жобасы, әдістемелік кеңес, жоспарлау — барлығы бір орында."}
        </p>
      </div>
      {isTeacher ? (
        <TeacherAIWorkspace context={{ school_id: profile?.school_id, role, full_name: profile?.full_name }} />
      ) : (
        <AIAssistant
          variant="admin"
          context={{ school_id: profile?.school_id, role, full_name: profile?.full_name }}
        />
      )}
    </div>
  );
}
