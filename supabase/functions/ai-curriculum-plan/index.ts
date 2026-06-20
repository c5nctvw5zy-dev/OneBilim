// AI generator for ҚМЖ (Қысқа мерзімді жоспар) and КТЖ (Күнтізбелік-тақырыптық жоспар)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { planType, className, subject, textbook, program, academicYear, teacher, additionalInstructions, previousContent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY жоқ");

    const isKTP = planType === "КТЖ";
    const system = `Сіз — Қазақстан Республикасының білім беру стандарттары бойынша мамандандырылған әдіскер-ЖИ-сіз.
BilimApp платформасын Сарсембек Алихан Ринатұлы жасап шықты.
Сіз мұғалімдерге ${isKTP ? "Күнтізбелік-тақырыптық жоспар (КТЖ)" : "Қысқа мерзімді жоспар (ҚМЖ)"} құруға көмектесесіз.
Жауап тек қазақ тілінде, ресми әдістемелік стильде, Markdown форматында болуы керек.
Құрылымды нақты және толық беріңіз.`;

    const userPrompt = isKTP
      ? `КТЖ құрыңыз. Сынып: ${className}. Пән: ${subject}. Оқулық: ${textbook}. Бағдарлама: ${program}. Оқу жылы: ${academicYear}. Педагог: ${teacher}.

Құрылымы:
## Күнтізбелік-тақырыптық жоспар
**Сынып:** ${className} | **Пән:** ${subject} | **Оқу жылы:** ${academicYear}

### I тоқсан
| № | Бөлім | Тақырып | Сағат саны | Күні | Оқу мақсаты |
|---|-------|---------|-----------|------|-------------|
... (барлығы 4 тоқсан бойынша толық кесте, әр тоқсанда 8-15 сабақ)

### Бағалау түрлері
- БЖБ саны: ...
- ТЖБ саны: ...

${additionalInstructions ? `\n\nҚосымша нұсқаулар: ${additionalInstructions}` : ""}`
      : `ҚМЖ құрыңыз. Сынып: ${className}. Пән: ${subject}. Оқулық: ${textbook}. Бағдарлама: ${program}. Педагог: ${teacher}.

Құрылымы:
## Қысқа мерзімді жоспар
**Бөлім:** ...
**Сабақтың тақырыбы:** ...
**Мектеп:** ... | **Күні:** ... | **Мұғалімнің аты-жөні:** ${teacher}
**Сынып:** ${className} | **Қатысқандар саны:** ... | **Қатыспағандар:** ...

### Сабақтың мақсаттары
- ...

### Бағалау критерийлері
- ...

### Тілдік мақсаттар
- ...

### Құндылықтарға баулу
- ...

### Пәнаралық байланыс
- ...

### Сабақтың барысы
| Сабақ кезеңі | Уақыт | Мұғалімнің әрекеті | Оқушының әрекеті | Ресурстар |
|--------------|-------|--------------------|-------------------|-----------|
| Басталуы | 5 мин | ... | ... | ... |
| Ортасы | 30 мин | ... | ... | ... |
| Соңы | 5 мин | ... | ... | ... |

### Саралау
...

### Рефлексия
...

${additionalInstructions ? `\n\nҚосымша нұсқаулар: ${additionalInstructions}` : ""}
${previousContent ? `\n\nАлдыңғы нұсқаны жақсартыңыз:\n${previousContent.slice(0, 2000)}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      if (response.status === 429) return new Response(JSON.stringify({ error: "Лимит асып кетті. Кейінірек көріңіз." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Кредит таусылды." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI Gateway ${response.status}: ${txt}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
