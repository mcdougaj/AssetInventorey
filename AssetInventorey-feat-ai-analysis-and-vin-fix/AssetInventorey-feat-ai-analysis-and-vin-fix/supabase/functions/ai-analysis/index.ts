import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageUrl, photoType } = await req.json();
    console.log("DEBUG: Received imageUrl:", imageUrl?.substring(0, 100) + "...");
    console.log("DEBUG: Photo type:", photoType);

    // Create a Supabase client with the user's access token
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the OpenAI API key from the settings table
    const { data: settings, error: settingsError } = await supabaseClient
      .from("settings")
      .select("value")
      .eq("key", "openai_api_key")
      .single();

    console.log("DEBUG: Settings query result:", { settings: !!settings, error: settingsError });

    if (settingsError || !settings) {
      console.error("Settings error:", settingsError);
      throw new Error("Failed to retrieve OpenAI API key from settings.");
    }

    const openaiApiKey = settings.value;
    console.log("DEBUG: API key retrieved, length:", openaiApiKey?.length, "starts with sk-:", openaiApiKey?.startsWith?.('sk-'));

    // Determine the appropriate prompt based on photo type
    const isNameplatePhoto = photoType === 'nameplate';
    
    const assetPhotoPrompt = `You are a professional asset appraiser and equipment inspector. Analyze this asset image and provide a detailed assessment.

INSPECTION CRITERIA:
1. PHYSICAL CONDITION: Look for rust, dents, scratches, wear patterns, missing parts, fluid leaks
2. OPERATIONAL STATUS: Assess if equipment appears functional, well-maintained, or needs repair
3. SAFETY CONCERNS: Identify any visible safety hazards or compliance issues
4. MARKET VALUE: Consider age indicators, brand recognition, model type, and condition impact on value

ANALYSIS REQUIREMENTS:
- Be specific about what you observe (e.g., "minor surface rust on left side panel" not just "some wear")
- Categorize condition as: Excellent, Good, Fair, Poor, or Salvage
- Provide value range if uncertain (e.g., "$15,000-$20,000")
- Note any maintenance recommendations
- Identify the asset type and key features you can see

RESPONSE FORMAT:
Return a JSON object with these exact properties:
{
  "condition": "condition category with brief explanation",
  "estimatedValue": "USD value or range with reasoning",
  "assetType": "identified equipment type",
  "keyFindings": "specific observations about condition",
  "recommendations": "maintenance or action items if any"
}

If image quality is poor or asset type unclear, be honest about limitations but provide best assessment possible.`;

    const nameplatePhotoPrompt = `You are a technical data specialist and equipment identifier. Analyze this nameplate/data plate image to extract key equipment information.

EXTRACTION CRITERIA:
1. MANUFACTURER: Brand name, company logo, manufacturer details
2. MODEL INFORMATION: Model number, part number, serial number
3. SPECIFICATIONS: Power ratings, capacity, dimensions, weight
4. MANUFACTURING DATA: Year, date codes, country of origin
5. TECHNICAL RATINGS: Voltage, amperage, pressure, flow rates, etc.
6. COMPLIANCE MARKINGS: Safety certifications, standards compliance

ANALYSIS REQUIREMENTS:
- Read all visible text accurately, including small print
- Identify partially obscured or worn text where possible
- Note any missing or illegible information
- Provide context for technical specifications
- Flag any safety or compliance certifications visible

RESPONSE FORMAT:
Return a JSON object with these exact properties:
{
  "manufacturer": "brand/company name if visible",
  "modelNumber": "model/part number if visible", 
  "serialNumber": "serial number if visible",
  "specifications": "key technical specs and ratings",
  "keyFindings": "all readable text and important markings",
  "dataQuality": "assessment of nameplate readability and condition"
}

If text is unclear or partially obscured, indicate uncertainty but provide best reading possible.`;

    const selectedPrompt = isNameplatePhoto ? nameplatePhotoPrompt : assetPhotoPrompt;

    const gptPayload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: selectedPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 800,
    };

    const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify(gptPayload),
    });

    if (!gptResponse.ok) {
        const errorBody = await gptResponse.text();
        console.error("OpenAI API error:", errorBody);
        throw new Error(`OpenAI API request failed with status ${gptResponse.status}`);
    }

    const gptData = await gptResponse.json();
    const analysisResult = gptData.choices[0].message.content;

    return new Response(JSON.stringify({ analysis: analysisResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
