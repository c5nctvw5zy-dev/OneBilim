import SimpleCrud from "@/components/SimpleCrud";
import { useAuth } from "@/hooks/useAuth";

export default function SubjectsManagementPage() {
  const { profile } = useAuth();
  return (
    <SimpleCrud
      title="📚 Пәндер"
      table="subjects"
      defaults={{ school_id: profile?.school_id }}
      fields={[
        { key: "name", label: "Пән атауы", required: true },
        { key: "level", label: "Деңгейі", type: "select", options: [
          { value: "Бастауыш", label: "Бастауыш" },
          { value: "Орта", label: "Орта" },
          { value: "Барлық", label: "Барлық" },
        ]},
        { key: "hours_per_week", label: "Аптадағы сағаты", type: "number" },
        { key: "description", label: "Сипаттамасы", type: "textarea" },
      ]}
      listColumns={["name", "level", "hours_per_week", "description"]}
      filter={profile?.school_id ? undefined : undefined}
    />
  );
}
