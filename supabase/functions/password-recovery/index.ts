// Password recovery via IIN: lookup user, return masked info, then issue one-time password
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function genTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s + "!2";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const body = await req.json();
    const action = body?.action as "lookup" | "confirm";
    const iin = String(body?.iin ?? "").trim();

    if (!/^\d{12}$/.test(iin)) {
      return new Response(JSON.stringify({ error: "ЖСН 12 саннан тұруы керек" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select("user_id, full_name, email, birth_date, gender, iin")
      .eq("iin", iin)
      .maybeSingle();

    if (pErr || !profile) {
      return new Response(JSON.stringify({ error: "Бұл ЖСН-мен пайдаланушы табылмады" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "lookup") {
      return new Response(JSON.stringify({
        user_id: profile.user_id,
        full_name: profile.full_name,
        birth_date: profile.birth_date,
        gender: profile.gender,
        iin: profile.iin,
        email_masked: profile.email ? profile.email.replace(/(.{2}).+(@.+)/, "$1***$2") : null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "confirm") {
      const tempPassword = genTempPassword();
      const { error: updErr } = await admin.auth.admin.updateUserById(profile.user_id, {
        password: tempPassword,
      });
      if (updErr) {
        return new Response(JSON.stringify({ error: updErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Log (hash placeholder = first 4 chars)
      await admin.from("password_resets").insert({
        user_id: profile.user_id,
        iin,
        temp_password_hash: tempPassword.slice(0, 2) + "***",
      });
      return new Response(JSON.stringify({
        ok: true,
        email: profile.email,
        temp_password: tempPassword,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Белгісіз әрекет" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
