import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, textResult, jsonResult } from "../supabase";

export default defineTool({
  name: "school_stats",
  title: "Мектеп статистикасы",
  description: "Пайдаланушы мектебінің жалпы статистикасын: оқушы, мұғалім, сынып санын қайтарады.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Аутентификация қажет.", true);
    const sb = supabaseForUser(ctx);
    const [students, teachers, classes, announcements] = await Promise.all([
      sb.from("alphabet_book").select("*", { count: "exact", head: true }),
      sb.from("profiles").select("*", { count: "exact", head: true }),
      sb.from("classes").select("*", { count: "exact", head: true }),
      sb.from("announcements").select("*", { count: "exact", head: true }),
    ]);
    return jsonResult({
      students: students.count ?? 0,
      profiles: teachers.count ?? 0,
      classes: classes.count ?? 0,
      announcements: announcements.count ?? 0,
    });
  },
});
