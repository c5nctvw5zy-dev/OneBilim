import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, textResult, jsonResult } from "../supabase";

export default defineTool({
  name: "list_classes",
  title: "Сыныптарды тізу",
  description: "Пайдаланушының мектебіндегі сыныптардың тізімін қайтарады (RLS автоматты қолданылады).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Аутентификация қажет.", true);
    const { data, error } = await supabaseForUser(ctx)
      .from("classes")
      .select("id, name, grade, letter, teacher_id")
      .order("grade", { ascending: true });
    if (error) return textResult(error.message, true);
    return jsonResult(data ?? []);
  },
});
