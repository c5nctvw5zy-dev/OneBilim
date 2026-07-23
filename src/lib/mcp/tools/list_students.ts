import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, textResult, jsonResult } from "../supabase";

export default defineTool({
  name: "list_students",
  title: "Оқушыларды тізу",
  description: "Мектептегі оқушыларды тізеді. Қосымша: класс атауы бойынша сүзу (мысалы, '7 Г').",
  inputSchema: {
    class_name: z.string().optional().describe("Класс атауы бойынша сүзгі, мысалы '7 Г'"),
    limit: z.number().int().min(1).max(500).optional().describe("Жазба саны (әдепкі 100)"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ class_name, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return textResult("Аутентификация қажет.", true);
    let q = supabaseForUser(ctx)
      .from("alphabet_book")
      .select("id, order_no, last_name, first_name, class_name, gender, birth_date, program_type, status")
      .order("class_name", { ascending: true })
      .limit(limit ?? 100);
    if (class_name) q = q.eq("class_name", class_name);
    const { data, error } = await q;
    if (error) return textResult(error.message, true);
    return jsonResult(data ?? []);
  },
});
