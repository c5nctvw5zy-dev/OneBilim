import AIAssistant from "@/components/AIAssistant";
import { useAuth } from "@/hooks/useAuth";

export default function AdminAIAssistantPage() {
  const { profile, role } = useAuth();
  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">🤖 ЖИ көмекші</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Талдау, бұйрық/хат жобасы, әдістемелік кеңес, жоспарлау — барлығы бір орында.
        </p>
      </div>
      <AIAssistant
        context={{
          school_id: profile?.school_id,
          role,
          full_name: profile?.full_name,
        }}
      />
    </div>
  );
}
