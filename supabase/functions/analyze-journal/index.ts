import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, entries } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "sentiment":
        systemPrompt = `You are an expert trading psychologist analyzing journal entries. Analyze the emotional sentiment of the given trading journal entry and respond with ONLY valid JSON in this exact format:
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "confidence": number between 0 and 1,
  "emotions": ["array of detected emotions"],
  "summary": "Brief 1-2 sentence summary of emotional state"
}`;
        userPrompt = `Analyze this trading journal entry:\n\n${content}`;
        break;

      case "summary":
        systemPrompt = `You are an expert trading psychologist. Generate a personalized, insightful summary of the trader's psychological patterns based on their journal entries. Focus on:
1. Recurring emotional patterns
2. Correlation between emotions and outcomes
3. Behavioral triggers
4. Areas for improvement
5. Strengths to leverage

Respond with ONLY valid JSON in this exact format:
{
  "narrative": "A 3-4 paragraph personalized narrative about the trader's psychological patterns",
  "keyInsights": ["Array of 3-5 key insights"],
  "emotionPerformanceLink": "Description of how emotions correlate with trading performance",
  "recommendations": ["Array of 2-3 actionable recommendations"]
}`;
        userPrompt = `Based on these journal entries, generate a psychological summary:\n\n${JSON.stringify(entries, null, 2)}`;
        break;

      case "reflection-prompts":
        systemPrompt = `You are an expert trading psychologist. Based on the trader's recent journal entries, generate personalized reflection prompts that will help them develop deeper self-awareness and improve their trading psychology. The prompts should be specific to patterns you observe in their entries.

Respond with ONLY valid JSON in this exact format:
{
  "prompts": [
    {
      "category": "Category name",
      "prompt": "The reflection question",
      "context": "Brief explanation of why this prompt is relevant based on their patterns"
    }
  ]
}
Generate 3-5 prompts.`;
        userPrompt = `Generate personalized reflection prompts based on these journal entries:\n\n${JSON.stringify(entries, null, 2)}`;
        break;

      default:
        throw new Error("Invalid analysis type");
    }

    console.log(`Processing ${type} analysis request`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let result;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith("```")) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      result = JSON.parse(cleanedResponse.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Failed to parse AI response");
    }

    console.log(`${type} analysis completed successfully`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-journal function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
