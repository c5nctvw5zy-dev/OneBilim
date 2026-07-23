import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, jsonResult } from "../supabase";

export default defineTool({
  name: "list_announcements",
  title: "Хабарландыруларды тізу",
  description: "Мектептегі соңғы хабарландыруларды қайтарады.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Жазба саны (әдепкі 20)"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Аутентификация қажет.", true);
    const { data, error } = await supabaseForUser(ctx)
      .from("announcements")
      .select("id, title, body, target_role, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return textResult(error.message, true);
    return jsonResult(data ?? []);
  },
});
