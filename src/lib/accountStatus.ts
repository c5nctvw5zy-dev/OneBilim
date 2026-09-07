import { supabase } from "@/integrations/supabase/client";

/**
 * Аккаунт бұғатталған ба — тексереді. Бұғатталған болса сеансты жабады.
 * true қайтарса — кіруге болмайды.
 */
export async function enforceAccountStatus(): Promise<boolean> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return false;
    const { data } = await supabase
      .from("user_status")
      .select("status")
      .eq("user_id", uid)
      .maybeSingle();
    const status = (data as any)?.status;
    if (status && status !== "active") {
      await supabase.auth.signOut();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
