import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"
import type { JournalEntryRequest, JournalEntryResponse, DatabaseJournalEntry } from "./types.ts"

/**
 * Save Journal Edge Function
 * Saves journal entries for authenticated users only
 * Rejects anonymous users with appropriate message
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const errorResponse: JournalEntryResponse = {
        success: false,
        error: "Authentication required. Please sign in to save journal entries."
      }

      return new Response(
        JSON.stringify(errorResponse),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Extract token and get user
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      const errorResponse: JournalEntryResponse = {
        success: false,
        error: "Invalid authentication token. Please sign in again."
      }

      return new Response(
        JSON.stringify(errorResponse),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Check if user is anonymous - reject if so
    if (user.is_anonymous) {
      const errorResponse: JournalEntryResponse = {
        success: false,
        error: "Journal saving is not available for anonymous users. Please create an account to save your journal entries."
      }

      return new Response(
        JSON.stringify(errorResponse),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Parse request body
    const { journal_entry, thinking_traps }: JournalEntryRequest = await req.json()

    // Validate required fields
    if (!journal_entry || typeof journal_entry !== "string" || !journal_entry.trim()) {
      const errorResponse: JournalEntryResponse = {
        success: false,
        error: "Journal entry is required and must be a non-empty string"
      }

      return new Response(
        JSON.stringify(errorResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Validate optional thinking_traps field
    if (thinking_traps !== undefined && (typeof thinking_traps !== "object" || thinking_traps === null || Array.isArray(thinking_traps))) {
      const errorResponse: JournalEntryResponse = {
        success: false,
        error: "Thinking traps must be a valid JSON object if provided"
      }

      return new Response(
        JSON.stringify(errorResponse),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Prepare journal entry data with local date to avoid UTC timezone issues
    const now = new Date()
    const today = now.getFullYear() + "-" + 
      String(now.getMonth() + 1).padStart(2, "0") + "-" + 
      String(now.getDate()).padStart(2, "0")
    
    const journalData = {
      user_id: user.id,
      journal_entry: journal_entry.trim(),
      thinking_traps: thinking_traps || null,
      created_at: today
    }

    // Save journal entry to database
    const { data: savedEntry, error: saveError } = await supabase
      .from("journals")
      .insert([journalData])
      .select()
      .single()

    if (saveError) {
      console.error("Database save error:", saveError)
      
      const errorResponse: JournalEntryResponse = {
        success: false,
        error: "Failed to save journal entry. Please try again."
      }

      return new Response(
        JSON.stringify(errorResponse),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Transform database entry to response format
    const entry: JournalEntryResponse["entry"] = {
      id: savedEntry.id,
      created_at: savedEntry.created_at,
      journal_entry: savedEntry.journal_entry,
      user_id: savedEntry.user_id,
      thinking_traps: savedEntry.thinking_traps || undefined
    }

    const response: JournalEntryResponse = {
      success: true,
      entry
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 201, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )

  } catch (error) {
    console.error("Save Journal Error:", error)

    const errorResponse: JournalEntryResponse = {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred while saving your journal entry"
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
