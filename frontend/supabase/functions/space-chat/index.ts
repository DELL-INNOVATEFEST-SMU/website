import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { GeminiChatService } from "./gemini-service.ts"
import type { ChatMessage, ChatRequest, ChatResponse } from "./types.ts"

/**
 * Space Chat Edge Function
 * Handles AI-powered space exploration conversations using Gemini API
 * Supports both authenticated and anonymous users
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

    // Parse request body
    const { message, conversationHistory, userId, isAnonymous }: ChatRequest = await req.json()

    // Validate required fields
    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      )
    }

    // Initialize Gemini service
    const geminiService = new GeminiChatService()

    // Process the chat message
    const aiResponse = await geminiService.sendMessage(
      message.trim(),
      conversationHistory || [],
      userId,
      isAnonymous || false
    )

    // Create response message
    const responseMessage: ChatMessage = {
      id: geminiService.generateMessageId(),
      content: aiResponse,
      role: "assistant",
      timestamp: new Date().toISOString(),
    }

    const response: ChatResponse = {
      success: true,
      message: responseMessage,
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
    console.error("Space Chat Error:", error)

    // Return user-friendly error response
    const errorResponse: ChatResponse = {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      message: {
        id: `error_${Date.now()}`,
        content: "Commander Sam H. reporting - I'm experiencing some communication difficulties with the main computer. Please try again in a moment, or feel free to ask me about any specific planets or space phenomena you'd like to explore!",
        role: "assistant",
        timestamp: new Date().toISOString(),
      },
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