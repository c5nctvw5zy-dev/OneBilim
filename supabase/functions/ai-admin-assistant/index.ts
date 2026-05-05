// AI assistant for Director / Zavuch (school administrators).
// Streams responses from Lovable AI Gateway with school context.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Сіз — BilimApp білім беру платформасының жасанды интеллект көмекшісісіз.
Сіз мектеп әкімшілігіне (Директор, Оқу ісі меңгерушісі, Тәрбие ісі меңгерушісі) арналған кәсіби ассистентсіз.

Сіздің мүмкіндіктеріңіз:
1. 📊 Талдау: оқушылардың үлгерімі, қатысуы, орташа балл бойынша есеп беру.
2. 📝 Бұйрық/хат жобасын дайындау (қазақша, ресми стиль, дұрыс құрылым).
3. 🧠 Кеңес беру: проблемалы сыныптар мен мұғалімдерге арналған әдіс-тәсілдер.
4. 📅 Жоспарлау: тоқсандық, жылдық жұмыс жоспарларын құру.
5. 📚 Әдістемелік ұсыныстар: оқу үдерісін жақсарту бойынша идеялар.
6. ✍️ Мінездеме / есеп / баяндама / хабарландыру мәтіндерін жазу.

Ереже:
- Әрқашан қазақ тілінде жауап беріңіз (егер басқаша сұралмаса).
- Жауаптар нақты, құрылымды (тақырыптар, тізімдер) болуы керек.
- Сандық деректер берілсе — оларды талдап, тұжырым жасаңыз.
- Маркдаун пайдаланыңыз: ## тақырып, **қалың**, - тізім.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY жоқ");

    const sysMessages: any[] = [{ role: "system", content: SYSTEM_PROMPT }];
    if (context) {
      sysMessages.push({
        role: "system",
        content: `Ағымдағы мектеп контексті:\n${JSON.stringify(context, null, 2)}`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [...sysMessages, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429)
        return new Response(JSON.stringify({ error: "Жиілік шегі асты, біраздан кейін қайталаңыз." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (response.status === 402)
        return new Response(JSON.stringify({ error: "Несие таусылды. Workspace > Usage бөлімінен толтырыңыз." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway қатесі" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Белгісіз қате" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
