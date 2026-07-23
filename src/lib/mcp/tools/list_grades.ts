import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, jsonResult } from "../supabase";

export default defineTool({
  name: "list_grades",
  title: "Бағаларды қарау",
  description: "Ағымдағы пайдаланушы үшін көрінетін бағаларды қайтарады (RLS шектеулері).",
  inputSchema: {
    student_id: z.string().uuid().optional().describe("Нақты оқушының user_id-і"),
    limit: z.number().int().min(1).max(200).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ student_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Аутентификация қажет.", true);
    let q = supabaseForUser(ctx)
      .from("grades")
      .select("id, student_id, subject, grade, date, comment")
      .order("date", { ascending: false })
      .limit(limit ?? 50);
    if (student_id) q = q.eq("student_id", student_id);
    const { data, error } = await q;
    if (error) return textResult(error.message, true);
    return jsonResult(data ?? []);
  },
});
