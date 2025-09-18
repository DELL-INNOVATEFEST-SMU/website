import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import type { JournalImageRequest, JournalImageResponse, GeminiImageResponse } from "./types.ts"

/**
 * Journal Image Generator Edge Function
 * Generates images from journal entries using Gemini 2.5 Flash Image Preview
 * Enforces 1 image per user per day limit
 */
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Get authorization header for user authentication
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Initialize Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const supabaseClient = createClient(
      supabaseUrl, 
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } }
      }
    )
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Parse request body
    const { journalEntry, thinkingTraps }: JournalImageRequest = await req.json()

    // Validate required fields
    if (!journalEntry || typeof journalEntry !== "string" || !journalEntry.trim()) {
      return new Response(
        JSON.stringify({ error: "Journal entry is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Check daily generation limit
    const todayStr = new Date().toISOString().split("T")[0] // YYYY-MM-DD format
    
    const { data: existingGeneration, error: checkError } = await supabase
      .from("has_generated_image")
      .select("has_generated")
      .eq("user_id", user.id)
      .eq("created_at", todayStr)
      .single()

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 = no rows found
      console.error("Error checking generation limit:", checkError)
      return new Response(
        JSON.stringify({ error: "Database error checking generation limit" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // If user has already generated an image today, deny request
    if (existingGeneration && existingGeneration.has_generated) {
      return new Response(
        JSON.stringify({ 
          error: "Daily image generation limit reached. You can generate one image per day.",
          canGenerate: false
        }),
        { 
          status: 429, // Too Many Requests
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Generate image using Gemini 2.5 Flash Image Preview
    const geminiApiKey = Deno.env.get("GOOGLE_API_KEY")
    if (!geminiApiKey) {
      console.error("GOOGLE_API_KEY environment variable not set")
      return new Response(
        JSON.stringify({ error: "Image generation service unavailable" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Create enhanced prompt based on journal entry and thinking traps
    const prompt = createImagePrompt(journalEntry, thinkingTraps)
    
    console.log(`Making request to Gemini API with prompt: "${prompt.substring(0, 100)}..."`)

    // Use REST API format that matches the Python SDK behavior
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    }

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": geminiApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error("Gemini API Error:", geminiResponse.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to generate image: ${geminiResponse.status} ${geminiResponse.statusText}`,
          details: errorText
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    console.log("Gemini API response received, parsing...")
    const geminiData: GeminiImageResponse = await geminiResponse.json()
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      console.error("No candidates in response:", geminiData)
      return new Response(
        JSON.stringify({ error: "No image generated", response: geminiData }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Extract image data matching Python implementation logic
    const candidate = geminiData.candidates[0]
    console.log("Searching for image data in response parts...")
    
    // Look for inlineData in the response parts (matching Python: part.inline_data.data)
    const imageParts = candidate.content.parts.filter(part => part.inlineData)
    
    if (!imageParts || imageParts.length === 0) {
      console.error("No image parts found. Candidate structure:", JSON.stringify(candidate, null, 2))
      return new Response(
        JSON.stringify({ 
          error: "No image data in response", 
          candidateStructure: candidate 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Get the first image part (matching Python: image_parts[0])
    const imageBase64 = imageParts[0].inlineData!.data
    console.log(`Image generated successfully, base64 length: ${imageBase64.length}`)

    // Record that user has generated an image today
    const { error: recordError } = await supabase
      .from("has_generated_image")
      .upsert(
        {
          user_id: user.id,
          created_at: todayStr,
          has_generated: true,
        },
        { onConflict: "user_id, created_at" }
      )

    if (recordError) {
      console.error("Error recording generation:", recordError)
      // Don't fail the request, just log the error
    }

    const response: JournalImageResponse = {
      success: true,
      imageBase64: imageBase64,
      canGenerate: false, // User has now used their daily generation
      timestamp: new Date().toISOString(),
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )

  } catch (error) {
    console.error("Journal Image Generator Error:", error)

    const errorResponse: JournalImageResponse = {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      canGenerate: true, // Don't penalize user for server errors
      timestamp: new Date().toISOString(),
    }

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})

/**
 * Creates an enhanced image generation prompt based on journal entry and thinking traps
 * Matches the Python implementation style while keeping safety guidelines
 */
function createImagePrompt(journalEntry: string, thinkingTraps?: string[]): string {
  // Base prompt similar to Python version
  let prompt = `Convert the following journal entry into a vibrant, uplifting image that symbolizes hope and positivity: ${journalEntry}`
  
  // Add thinking traps context if provided
  if (thinkingTraps && thinkingTraps.length > 0) {
    prompt += `\n\nThe person is working on overcoming these thinking patterns: ${thinkingTraps.join(", ")}.`
    prompt += ` Please create an image that represents growth, positivity, and emotional balance.`
  }
  
  // Style guidelines
  prompt += `\n\nStyle: Create a beautiful, vibrant, and inspiring image with uplifting colors, natural elements, and peaceful compositions. The image should feel uplifting and therapeutic, suitable for someone working on their mental wellness journey.`
  
  // Safety guidelines (keeping the "Avoid" part as requested)
  prompt += `\n\nAvoid: Dark, disturbing, or negative imagery. Keep it appropriate for all ages and focused on healing, growth, and positivity.`

  return prompt
}