import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") return json({ error: "token required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { data: reqRow, error } = await admin
      .from("device_link_requests")
      .select("id, user_id, status, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (error || !reqRow) return json({ status: "not_found" }, 404);
    if (new Date(reqRow.expires_at).getTime() < Date.now()) return json({ status: "expired" });
    if (reqRow.status === "denied") return json({ status: "denied" });
    if (reqRow.status === "used") return json({ status: "used" });
    if (reqRow.status !== "approved" || !reqRow.user_id) return json({ status: "pending" });

    const { data: userRes, error: uErr } = await admin.auth.admin.getUserById(reqRow.user_id);
    if (uErr || !userRes?.user?.email) return json({ status: "error", message: "user not found" }, 400);

    const { data: link, error: lErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: userRes.user.email,
    });
    if (lErr || !link?.properties?.hashed_token) {
      return json({ status: "error", message: lErr?.message ?? "link failed" }, 400);
    }

    // Бір реттік пайдалану: сұранысты жабамыз
    await admin.from("device_link_requests").update({ status: "used" }).eq("id", reqRow.id);

    return json({
      status: "approved",
      email: userRes.user.email,
      token_hash: link.properties.hashed_token,
    });
  } catch (e) {
    return json({ status: "error", message: e instanceof Error ? e.message : "unknown" }, 500);
  }
});
