import { supabase } from "@/integrations/supabase/client";
import { detectDevice, detectIp, getDeviceKey } from "@/lib/deviceInfo";

/**
 * audit_logs кестесіне нақты әрекетті жазады (login, logout, баға қою, құжат жою, т.б.)
 */
export async function logAction(
  action: string,
  opts: { targetType?: string; targetId?: string; metadata?: Record<string, unknown> } = {}
) {
  try {
    const { data } = await supabase.auth.getUser();
    const actorId = data.user?.id;
    if (!actorId) return;
    const device = detectDevice();
    await supabase.from("audit_logs").insert({
      actor_id: actorId,
      action,
      target_type: opts.targetType ?? null,
      target_id: opts.targetId ?? null,
      metadata: {
        ...(opts.metadata ?? {}),
        device: device.device_name,
        browser: device.browser,
      } as any,
    } as any);
  } catch {
    /* логтау негізгі әрекетті бұзбауы керек */
  }
}

/**
 * Жүйеге кіру тарихын жазады + құрылғыны user_devices ішінде тіркейді/жаңартады.
 */
export async function recordLogin(userId: string, status: "success" | "failed" = "success", method = "password") {
  try {
    const device = detectDevice();
    const ip = await detectIp();
    await supabase.from("login_history").insert({
      user_id: userId,
      device_name: device.device_name,
      os: device.os,
      browser: device.browser,
      ip_address: ip,
      status,
    } as any);

    if (status !== "success") return;

    const deviceKey = getDeviceKey();
    const { data: existing } = await supabase
      .from("user_devices")
      .select("id")
      .eq("user_id", userId)
      .eq("device_key", deviceKey)
      .maybeSingle();

    const { count } = await supabase
      .from("user_devices")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (existing?.id) {
      await supabase
        .from("user_devices")
        .update({ last_active_at: new Date().toISOString(), blocked: false, login_method: method, ip_address: ip } as any)
        .eq("id", existing.id);
    } else {
      await supabase.from("user_devices").insert({
        user_id: userId,
        device_name: device.device_name,
        os: device.os,
        browser: device.browser,
        ip_address: ip,
        device_key: deviceKey,
        login_method: method,
        is_primary: (count ?? 0) === 0,
        last_active_at: new Date().toISOString(),
      } as any);
    }

    await logAction("login", { targetType: "auth", targetId: userId, metadata: { method } });
  } catch {
    /* silent */
  }
}

/**
 * Осы құрылғының сеансы бұғатталған/жабылған ба — тексереді.
 */
export async function isCurrentDeviceBlocked(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("user_devices")
      .select("id, blocked")
      .eq("user_id", userId)
      .eq("device_key", getDeviceKey())
      .maybeSingle();
    if (!data) return false;
    return Boolean((data as any).blocked);
  } catch {
    return false;
  }
}
