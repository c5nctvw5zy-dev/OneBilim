import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, textResult, jsonResult } from "../supabase";

export default defineTool({
  name: "get_my_profile",
  title: "Менің профилім",
  description: "Ағымдағы қосылған пайдаланушының BilimApp профилін (аты-жөні, рөлі, мектебі, сыныбы) қайтарады.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Аутентификация қажет.", true);
    const sb = supabaseForUser(ctx);
    const uid = ctx.getUserId();
    const { data: profile, error: pErr } = await sb.from("profiles").select("*").eq("user_id", uid).maybeSingle();
    if (pErr) return textResult(pErr.message, true);
    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", uid);
    return jsonResult({ profile, roles: roles?.map((r) => r.role) ?? [] });
  },
});
