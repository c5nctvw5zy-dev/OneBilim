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

  const demoUsers = [
    { email: "superadmin@bilimapp.kz", password: "Demo123!", fullName: "Админ Суперов", role: "super_admin" },
    { email: "director@bilimapp.kz", password: "Demo123!", fullName: "Директор Мектепов", role: "director" },
    { email: "zavuch@bilimapp.kz", password: "Demo123!", fullName: "Завуч Оқуова", role: "zavuch" },
    { email: "teacher@bilimapp.kz", password: "Demo123!", fullName: "Мұғалім Сабақов", role: "teacher" },
    { email: "student@bilimapp.kz", password: "Demo123!", fullName: "Оқушы Білімов", role: "student" },
    { email: "parent@bilimapp.kz", password: "Demo123!", fullName: "Ата-ана Балаев", role: "parent" },
  ] as const;

  const results = [];
  const { data: existing, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (listError) {
    return new Response(JSON.stringify({ success: false, error: listError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  for (const u of demoUsers) {
    const found = existing.users.find((x) => x.email === u.email);

    let userId: string;
    if (found) {
      const { data: updatedUser, error: updateUserError } = await admin.auth.admin.updateUserById(found.id, {
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.fullName },
      });

      if (updateUserError) {
        results.push({ email: u.email, status: "error", error: updateUserError.message });
        continue;
      }

      userId = updatedUser.user.id;
      results.push({ email: u.email, status: "updated", role: u.role });
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.fullName },
      });

      if (error) {
        results.push({ email: u.email, status: "error", error: error.message });
        continue;
      }

      userId = data.user.id;
      results.push({ email: u.email, status: "created", role: u.role });
    }

    const { data: roleExists } = await admin.from("user_roles").select("id").eq("user_id", userId).eq("role", u.role);
    if (!roleExists || roleExists.length === 0) {
      await admin.from("user_roles").insert({ user_id: userId, role: u.role });
    }
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
