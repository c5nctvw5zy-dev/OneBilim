import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, jsonResult } from "../supabase";

export default defineTool({
  name: "list_homework",
  title: "Үй тапсырмалары",
  description: "Класс/пән бойынша үй тапсырмаларының тізімін қайтарады.",
  inputSchema: {
    class_name: z.string().optional(),
    subject: z.string().optional(),
    limit: z.number().int().min(1).max(200).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ class_name, subject, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Аутентификация қажет.", true);
    let q = supabaseForUser(ctx)
      .from("homework")
      .select("id, class_name, subject, title, description, due_date, created_at")
      .order("due_date", { ascending: false })
      .limit(limit ?? 50);
    if (class_name) q = q.eq("class_name", class_name);
    if (subject) q = q.eq("subject", subject);
    const { data, error } = await q;
    if (error) return textResult(error.message, true);
    return jsonResult(data ?? []);
  },
});
