import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRANSLIT: Record<string, string> = {
  а: "a", ә: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "i", к: "k", қ: "q", л: "l", м: "m", н: "n", ң: "n", о: "o", ө: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ұ: "u", ү: "u", ф: "f", х: "h", һ: "h", ц: "c", ч: "ch",
  ш: "sh", щ: "sh", ъ: "", ы: "y", і: "i", ь: "", э: "e", ю: "yu", я: "ya",
};

const slug = (s: string) =>
  (s || "")
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: userRes } = await admin.auth.getUser(token);
    const caller = userRes?.user;
    if (!caller) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", caller.id);
    const allowed = (roles || []).some((r: any) => ["director", "zavuch", "super_admin", "secretary"].includes(r.role));
    if (!allowed) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: callerProfile } = await admin.from("profiles").select("school_id").eq("user_id", caller.id).maybeSingle();
    const { grade_level, section } = await req.json();
    const schoolId = callerProfile?.school_id;
    if (!schoolId) {
      return new Response(JSON.stringify({ error: "no_school" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const className = `${grade_level ?? ""}${section ?? ""}`.trim();

    // 1. Сынып бар ма — жоқ болса жасаймыз
    let { data: cls } = await admin.from("classes").select("id").eq("school_id", schoolId).eq("name", className).maybeSingle();
    if (!cls) {
      const { data: created, error: clsErr } = await admin.from("classes")
        .insert({ school_id: schoolId, name: className, grade_level: Number(grade_level) || 1, section: section || null })
        .select("id").single();
      if (clsErr) throw clsErr;
      cls = created;
    }

    // 2. Алфавиттік кітаптағы белсенді оқушылар
    let q = admin.from("alphabet_book").select("*").eq("school_id", schoolId).eq("status", "active").eq("grade_level", Number(grade_level));
    q = section ? q.eq("section", section) : q;
    const { data: students, error: stErr } = await q;
    if (stErr) throw stErr;

    const created: { name: string; login: string; password: string }[] = [];
    let linked = 0;
    const password = "BilimApp2026!";

    for (const s of students || []) {
      const base = `${slug(s.last_name)}.${slug(s.first_name)}`.slice(0, 24) || `oqushy${s.alphabet_number ?? ""}`;
      const login = `${base}${String(s.id).slice(0, 4)}`;
      const email = `${login}@bilimapp.kz`;
      const fullName = `${s.last_name} ${s.first_name}`.trim();

      // Профиль бар ма?
      let { data: prof } = await admin.from("profiles").select("id").eq("school_id", schoolId).eq("login", login).maybeSingle();

      if (!prof) {
        const { data: newUser, error: authErr } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });
        if (authErr || !newUser?.user) continue;

        // handle_new_user триггері профиль жасайды — оны толықтырамыз
        const { data: p } = await admin.from("profiles").select("id").eq("user_id", newUser.user.id).maybeSingle();
        const profileId = p?.id;
        if (!profileId) continue;
        await admin.from("profiles").update({
          school_id: schoolId,
          full_name: fullName,
          login,
          birth_date: s.birth_date ?? null,
          gender: s.gender ?? null,
          phone: s.phone ?? null,
          iin: s.iin ?? null,
        }).eq("id", profileId);
        await admin.from("user_roles").upsert({ user_id: newUser.user.id, role: "student" }, { onConflict: "user_id,role" });
        prof = { id: profileId };
        created.push({ name: fullName, login, password });
      }

      // 3. student_classes байланысы
      const { data: sc } = await admin.from("student_classes").select("id").eq("student_id", prof.id).eq("class_id", cls.id).maybeSingle();
      if (!sc) {
        await admin.from("student_classes").insert({ student_id: prof.id, class_id: cls.id });
        linked++;
      }
    }

    return new Response(JSON.stringify({ class_name: className, total: (students || []).length, created, linked }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
