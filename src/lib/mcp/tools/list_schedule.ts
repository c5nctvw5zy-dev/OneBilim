import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, jsonResult } from "../supabase";

export default defineTool({
  name: "list_schedule",
  title: "Сабақ кестесі",
  description: "Класс немесе мұғалім бойынша сабақ кестесін қайтарады.",
  inputSchema: {
    class_name: z.string().optional().describe("Класс атауы, мысалы '7 Г'"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ class_name }, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Аутентификация қажет.", true);
    let q = supabaseForUser(ctx)
      .from("schedules")
      .select("id, class_name, day_of_week, lesson_number, subject, teacher_name, room")
      .order("day_of_week", { ascending: true })
      .order("lesson_number", { ascending: true });
    if (class_name) q = q.eq("class_name", class_name);
    const { data, error } = await q.limit(300);
    if (error) return textResult(error.message, true);
    return jsonResult(data ?? []);
  },
});
