import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, jsonResult } from "../supabase";

export default defineTool({
  name: "create_announcement",
  title: "Хабарландыру құру",
  description: "Пайдаланушы мектебіне арналған жаңа хабарландыру құрады. Тек рұқсаты бар рөлдер үшін (RLS тексереді).",
  inputSchema: {
    title: z.string().min(1).describe("Хабарландыру тақырыбы"),
    body: z.string().min(1).describe("Хабарландыру мәтіні"),
    target_role: z.string().optional().describe("Мақсатты рөл (all, teacher, student, parent...)"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, body, target_role }, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Аутентификация қажет.", true);
    const sb = supabaseForUser(ctx);
    const { data: prof } = await sb.from("profiles").select("school_id").eq("user_id", ctx.getUserId()).maybeSingle();
    if (!prof?.school_id) return textResult("Пайдаланушы мектепке тіркелмеген.", true);
    const { data, error } = await sb
      .from("announcements")
      .insert({
        title,
        body,
        target_role: target_role ?? "all",
        school_id: prof.school_id,
        created_by: ctx.getUserId(),
      })
      .select()
      .maybeSingle();
    if (error) return textResult(error.message, true);
    return jsonResult(data);
  },
});
