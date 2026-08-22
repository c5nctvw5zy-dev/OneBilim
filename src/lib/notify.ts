import { supabase } from "@/integrations/supabase/client";

export interface NotifyInput {
  userIds: string[];
  title: string;
  body?: string;
  type?: "info" | "grade" | "homework" | "announcement" | "permission" | "document" | "chat";
  link?: string;
  schoolId?: string | null;
}

/**
 * notifications кестесіне нақты жазба қосады (realtime арқылы қоңырауға түседі).
 */
export async function notifyUsers({ userIds, title, body, type = "info", link, schoolId }: NotifyInput) {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (unique.length === 0) return;
  try {
    await supabase.from("notifications").insert(
      unique.map((uid) => ({
        user_id: uid,
        title,
        body: body ?? null,
        type,
        link: link ?? null,
        school_id: schoolId ?? null,
      })) as any
    );
  } catch {
    /* хабарландыру негізгі әрекетті бұзбауы керек */
  }
}

/**
 * Оқушының user_id-і арқылы ата-аналарының user_id тізімін қайтарады.
 */
export async function parentUserIdsOfStudent(studentProfileId: string): Promise<string[]> {
  const { data } = await supabase
    .from("parent_students")
    .select("parent:parent_id(user_id)")
    .eq("student_id", studentProfileId);
  return ((data as any[]) || []).map((r) => r.parent?.user_id).filter(Boolean);
}
