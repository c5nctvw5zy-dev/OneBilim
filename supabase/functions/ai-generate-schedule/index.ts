// AI-driven schedule generator for Director / Zavuch.
// Receives a class name + free-form requirements (in Kazakh) and asks
// Lovable AI to produce a structured weekly schedule (JSON).
// The generated lessons are inserted into the `schedules` table on behalf
// of the authenticated user (RLS enforces director/zavuch + school_id).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAY_TIMES = [
  { start: "08:30", end: "09:15" },
  { start: "09:25", end: "10:10" },
  { start: "10:20", end: "11:05" },
  { start: "11:15", end: "12:00" },
  { start: "12:20", end: "13:05" },
  { start: "13:15", end: "14:00" },
  { start: "14:10", end: "14:55" },
];

const SYSTEM = `Сіз — мектеп кестесін автоматты түрде құратын ассистентсіз.
Қазақстан мектебінің ережесіне сәйкес, дүйсенбі–жұма (1–5) күндері, әр күні 5–7 сабақтан құрыңыз.
Сабақтарды біркелкі бөліңіз, бір күнде бір пәнді қайталамауға тырысыңыз (қажет болса ғана қайталаңыз).
Дене шынықтыруды әртүрлі күндерге бөліңіз. Қиын пәндерді таңертең, жеңіл пәндерді кешке қойыңыз.
Тек JSON қайтарыңыз, басқа мәтін жоқ.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Авторизация қажет" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = userData.user.id;

    const { class_name, requirements } = await req.json();
    if (!class_name) {
      return new Response(JSON.stringify({ error: "Сынып аты қажет" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: prof } = await userClient.from("profiles").select("id, school_id").eq("user_id", userId).single();
    if (!prof?.school_id) {
      return new Response(JSON.stringify({ error: "Мектеп табылмады" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get teachers and subjects context
    const [{ data: teachersRoles }, { data: schoolProfiles }, { data: subjects }, { data: classes }] = await Promise.all([
      userClient.from("user_roles").select("user_id").eq("role", "teacher"),
      userClient.from("profiles").select("id, full_name, user_id").eq("school_id", prof.school_id),
      userClient.from("subjects").select("id, name"),
      userClient.from("classes").select("id, name").eq("school_id", prof.school_id),
    ]);
    const teacherIds = new Set((teachersRoles || []).map((r: any) => r.user_id));
    const teachers = (schoolProfiles || []).filter((p: any) => teacherIds.has(p.user_id));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY жоқ");

    const userPrompt = `Сынып: ${class_name}
Қолда бар мұғалімдер (full_name): ${teachers.map((t: any) => t.full_name).join(", ") || "(жоқ)"}
Қолда бар пәндер: ${(subjects || []).map((s: any) => s.name).join(", ") || "(жоқ)"}
Қосымша талаптар: ${requirements || "(жоқ)"}

JSON форматында толық апталық кестені жасаңыз.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt }],
        tools: [{
          type: "function",
          function: {
            name: "set_schedule",
            description: "Аптаға арналған толық кестені орнату",
            parameters: {
              type: "object",
              properties: {
                entries: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day_of_week: { type: "integer", minimum: 1, maximum: 6 },
                      lesson_order: { type: "integer", minimum: 1, maximum: 7 },
                      subject_name: { type: "string" },
                      teacher_name: { type: "string" },
                    },
                    required: ["day_of_week", "lesson_order", "subject_name"],
                  },
                },
              },
              required: ["entries"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "set_schedule" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Жиілік шегі асты" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "Несие таусылды" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiResp.text();
      console.error("AI error:", t);
      return new Response(JSON.stringify({ error: "AI қатесі" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ai = await aiResp.json();
    const toolCall = ai.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI кесте қайтармады" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const args = JSON.parse(toolCall.function.arguments);
    const entries: any[] = args.entries || [];

    // Resolve / create class
    let classId: string | null = (classes || []).find((c: any) => c.name.toLowerCase() === class_name.toLowerCase())?.id || null;
    if (!classId) {
      const gradeMatch = class_name.match(/\d+/);
      const grade = gradeMatch ? parseInt(gradeMatch[0]) : 1;
      const section = class_name.replace(/\d+/g, "").trim() || null;
      const { data: newCls } = await userClient.from("classes").insert({
        school_id: prof.school_id, name: class_name, grade_level: grade, section,
      }).select("id").single();
      classId = newCls?.id || null;
    }
    if (!classId) {
      return new Response(JSON.stringify({ error: "Сыныпты құру мүмкін болмады" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const subjectsMap = new Map<string, string>((subjects || []).map((s: any) => [s.name.toLowerCase(), s.id]));
    const teachersMap = new Map<string, string>(teachers.map((t: any) => [t.full_name.toLowerCase(), t.id]));

    // Remove existing schedule for this class to replace
    await userClient.from("schedules").delete().eq("class_id", classId).eq("school_id", prof.school_id);

    let inserted = 0;
    for (const e of entries) {
      const subjectName = String(e.subject_name || "").trim();
      if (!subjectName) continue;
      let subjectId = subjectsMap.get(subjectName.toLowerCase());
      if (!subjectId) {
        const { data: ns } = await userClient.from("subjects").insert({ name: subjectName }).select("id").single();
        if (ns?.id) { subjectId = ns.id; subjectsMap.set(subjectName.toLowerCase(), ns.id); }
      }
      let teacherId: string | null = null;
      if (e.teacher_name) teacherId = teachersMap.get(String(e.teacher_name).toLowerCase()) || null;

      const order = Math.max(1, Math.min(7, parseInt(e.lesson_order) || 1));
      const day = Math.max(1, Math.min(6, parseInt(e.day_of_week) || 1));
      const time = DAY_TIMES[order - 1];

      const { error: insErr } = await userClient.from("schedules").insert({
        school_id: prof.school_id, class_id: classId, subject_id: subjectId,
        teacher_id: teacherId, day_of_week: day, lesson_order: order,
        start_time: time.start, end_time: time.end,
      });
      if (!insErr) inserted++;
    }

    return new Response(JSON.stringify({ success: true, inserted, total: entries.length, class_name }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Белгісіз қате" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
