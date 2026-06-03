import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  type DemoUser = {
    email: string; password: string; fullName: string; role: string;
    subject?: string; ownClass?: { name: string; grade_level: number; section?: string };
  };

  const demoUsers: DemoUser[] = [
    { email: "superadmin@bilimapp.kz", password: "BilimApp2026!", fullName: "Админ Суперов", role: "super_admin" },
    { email: "director@bilimapp.kz", password: "BilimApp2026!", fullName: "Директор Мектепов", role: "director" },
    { email: "zavuch@bilimapp.kz", password: "BilimApp2026!", fullName: "Завуч Оқуова", role: "zavuch" },
    { email: "teacher@bilimapp.kz", password: "BilimApp2026!", fullName: "Мұғалім Сабақов", role: "teacher" },
    { email: "student@bilimapp.kz", password: "BilimApp2026!", fullName: "Оқушы Білімов", role: "student" },
    { email: "parent@bilimapp.kz", password: "BilimApp2026!", fullName: "Ата-ана Балаев", role: "parent" },
    { email: "librarian@bilimapp.kz", password: "BilimApp2026!", fullName: "Кітапханашы Кітапова", role: "librarian" },
    { email: "psychologist@bilimapp.kz", password: "BilimApp2026!", fullName: "Психолог Көмекова", role: "psychologist" },
    { email: "social@bilimapp.kz", password: "BilimApp2026!", fullName: "Әлеуметтік педагог Жанұзақова", role: "social_pedagogue" },
    { email: "speech@bilimapp.kz", password: "BilimApp2026!", fullName: "Логопед Сөзбекова", role: "speech_therapist" },
    { email: "nurse@bilimapp.kz", password: "BilimApp2026!", fullName: "Медбике Дәрігерова", role: "nurse" },
    { email: "hr@bilimapp.kz", password: "BilimApp2026!", fullName: "Кадр маманы Кадрова", role: "hr" },
    { email: "secretary@bilimapp.kz", password: "BilimApp2026!", fullName: "Хатшы Жазушева", role: "secretary" },
    // Демо завучтар
    { email: "zavuch.uteulieva@bilimapp.kz", password: "BilimApp2026!", fullName: "Утеулиева Раушан Шамшаевна", role: "zavuch" },
    { email: "zavuch.otarbaeva@bilimapp.kz", password: "BilimApp2026!", fullName: "Отарбаева Назгүл Серікқызы", role: "zavuch" },
    { email: "zavuch.bekmedetova@bilimapp.kz", password: "BilimApp2026!", fullName: "Бекмедетова Фарида Картанбайқызы", role: "zavuch" },
    // Демо мұғалімдер
    { email: "teacher.nurakynova@bilimapp.kz", password: "BilimApp2026!", fullName: "Нұрақынова Алмагүл Нұрбосынқызы", role: "teacher", subject: "Информатика", ownClass: { name: "8Н", grade_level: 8, section: "Н" } },
    { email: "teacher.estemisova@bilimapp.kz", password: "BilimApp2026!", fullName: "Естемисова Арайлым Өмірбекқызы", role: "teacher", subject: "Қазақ тілі мен әдебиеті", ownClass: { name: "7Г", grade_level: 7, section: "Г" } },
    { email: "teacher.naimanbai@bilimapp.kz", password: "BilimApp2026!", fullName: "Найманбай Арайлым Ғалымқыза", role: "teacher", subject: "Ағылшын тілі", ownClass: { name: "6Б", grade_level: 6, section: "Б" } },
  ];

  // Ensure a demo school exists
  let demoSchoolId: string;
  const { data: existingSchool } = await admin.from("schools").select("id").eq("status", "approved").limit(1).maybeSingle();
  if (existingSchool?.id) {
    demoSchoolId = existingSchool.id;
  } else {
    const { data: created, error: schoolErr } = await admin.from("schools").insert({
      name: "№26 жалпы білім беретін мектеп",
      status: "approved",
      city: "Алматы",
      school_type: "Жалпы орта",
    }).select("id").single();
    if (schoolErr || !created) {
      return new Response(JSON.stringify({ success: false, error: schoolErr?.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    demoSchoolId = created.id;
  }

  const results: any[] = [];
  const { data: existing, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) {
    return new Response(JSON.stringify({ success: false, error: listError.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userIdByEmail: Record<string, string> = {};

  for (const u of demoUsers) {
    const found = existing.users.find((x) => x.email === u.email);
    let userId: string;
    if (found) {
      const { data: updatedUser, error: updateUserError } = await admin.auth.admin.updateUserById(found.id, {
        password: u.password, email_confirm: true, user_metadata: { full_name: u.fullName },
      });
      if (updateUserError) { results.push({ email: u.email, status: "error", error: updateUserError.message }); continue; }
      userId = updatedUser.user.id;
      results.push({ email: u.email, status: "updated", role: u.role });
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: u.email, password: u.password, email_confirm: true, user_metadata: { full_name: u.fullName },
      });
      if (error) { results.push({ email: u.email, status: "error", error: error.message }); continue; }
      userId = data.user.id;
      results.push({ email: u.email, status: "created", role: u.role });
    }
    userIdByEmail[u.email] = userId;

    const { data: roleExists } = await admin.from("user_roles").select("id").eq("user_id", userId).eq("role", u.role);
    if (!roleExists || roleExists.length === 0) {
      await admin.from("user_roles").insert({ user_id: userId, role: u.role });
    }

    // Update profile: attach school + name (super_admin has no school)
    const profilePatch: any = { full_name: u.fullName };
    if (u.role !== "super_admin") profilePatch.school_id = demoSchoolId;
    await admin.from("profiles").update(profilePatch).eq("user_id", userId);
  }

  // Subjects
  const subjectNames = ["Информатика", "Қазақ тілі мен әдебиеті", "Ағылшын тілі", "Математика", "Дене шынықтыру", "Биология", "География", "Физика", "Химия", "Тарих"];
  for (const name of subjectNames) {
    const { data: ex } = await admin.from("subjects").select("id").eq("name", name).maybeSingle();
    if (!ex) await admin.from("subjects").insert({ name });
  }

  // Classes with homeroom teachers
  for (const u of demoUsers) {
    if (!u.ownClass) continue;
    const uid = userIdByEmail[u.email];
    if (!uid) continue;
    const { data: prof } = await admin.from("profiles").select("id").eq("user_id", uid).maybeSingle();
    const teacherProfileId = prof?.id;
    const { data: existingCls } = await admin.from("classes")
      .select("id").eq("school_id", demoSchoolId).eq("name", u.ownClass.name).maybeSingle();
    if (existingCls?.id) {
      await admin.from("classes").update({ homeroom_teacher_id: teacherProfileId, grade_level: u.ownClass.grade_level, section: u.ownClass.section }).eq("id", existingCls.id);
    } else {
      await admin.from("classes").insert({
        school_id: demoSchoolId, name: u.ownClass.name,
        grade_level: u.ownClass.grade_level, section: u.ownClass.section,
        homeroom_teacher_id: teacherProfileId,
      });
    }
  }

  return new Response(JSON.stringify({ success: true, school_id: demoSchoolId, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
