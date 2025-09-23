import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { GeminiModerationService } from "./gemini-moderation-service.ts"
import { GeminiChatService } from "./gemini-service.ts"
import type { ChatMessage, ChatRequest, ChatResponse } from "./types.ts"

/**
 * Space Chat Edge Function with Gemini Guard Rails
 * Uses Gemini 2.5 Flash for both content moderation and chat responses
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

    // Initialize services
    const moderationService = new GeminiModerationService()
    const chatService = new GeminiChatService()

    // Step 1: Input Moderation
    console.log("🔍 Moderating user input...")
    const inputModeration = await moderationService.moderateInput(message, conversationHistory)
    
    if (!inputModeration.isSafe) {
      console.log("❌ Input blocked:", inputModeration.reason)
      
      const response: ChatResponse = {
        success: false,
        error: "Content policy violation",
        message: {
          id: `moderation_${Date.now()}`,
          content: "I'm sorry, but I can't engage with that type of content. Let's keep our conversation focused on space exploration and astronomy! What would you like to know about our solar system?",
          role: "assistant",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      }
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    console.log("✅ Input approved, processing with Gemini...")

    // Step 2: Process with Gemini Chat Service
    const aiResponse = await chatService.sendMessage(
      message.trim(),
      conversationHistory || [],
      userId,
      isAnonymous || false
    )

    // Step 3: Output Moderation
    console.log("🔍 Moderating AI output...")
    const outputModeration = await moderationService.moderateOutput(aiResponse)
    
    if (!outputModeration.isSafe) {
      console.log("❌ Output blocked:", outputModeration.reason)
      
      const response: ChatResponse = {
        success: true,
        message: {
          id: chatService.generateMessageId(),
          content: "I apologize, but I need to keep our conversation appropriate and focused on space exploration topics. Let me help you with something else about astronomy or space science!",
          role: "assistant",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      }
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    console.log("✅ Output approved, delivering response...")

    // Step 4: Return safe response
    const responseMessage: ChatMessage = {
      id: chatService.generateMessageId(),
      content: aiResponse,
      role: "assistant",
      timestamp: new Date().toISOString(),
    }

    const response: ChatResponse = {
      success: true,
      message: responseMessage,
      timestamp: new Date().toISOString(),
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("Guarded Chat Error:", error)

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

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
