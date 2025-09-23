import type { ChatMessage } from "@/types/chat"
import { supabase } from "@/lib/supabase"

/**
 * Chat request interface for Edge Function
 */
interface ChatRequest {
  message: string
  conversationHistory?: ChatMessage[]
  userId?: string
  isAnonymous?: boolean
}

/**
 * Chat response interface from Edge Function
 */
interface ChatResponse {
  success: boolean
  message: ChatMessage
  error?: string
  timestamp: string
}

/**
 * Edge Function Chat Service
 * Handles communication with Supabase Edge Function for space exploration conversations
 * Uses the main authentication system - no duplicate auth logic
 */
export class EdgeChatService {
  private readonly functionName = "space-chat-guarded"

  /**
   * Send a message to the Edge Function and get a response
   * Assumes user is already authenticated (anonymous or regular) via main auth system
   */
  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Get current user from main auth system
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error("Authentication required for chat functionality")
      }

      // Prepare request payload
      const requestPayload: ChatRequest = {
        message: message.trim(),
        conversationHistory: conversationHistory.filter(msg => !msg.isTyping),
        userId: user.id,
        isAnonymous: user.is_anonymous || false
      }

      // console.log(`Making Edge Function call for ${user.is_anonymous ? 'anonymous' : 'authenticated'} user`)
      
      // Call Edge Function using Supabase client
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: requestPayload,
      })

      if (error) {
        console.error("Edge Function Error:", error)
        throw new Error(`Edge Function failed: ${error.message || error}`)
      }

      // Parse response
      const response: ChatResponse = data

      if (!response.success) {
        throw new Error(response.error || "Unknown error occurred")
      }

      return response.message.content

    } catch (error) {
      console.error("Error communicating with Edge Function:", error)
      
      // Return fallback response that stays in character
      if (error instanceof Error) {
        if (error.message.includes("Authentication required")) {
          return "Commander Sam H. reporting - Authentication systems are initializing. Please try again in a moment!"
        }
        if (error.message.includes("Edge Function") || error.message.includes("network")) {
          return "Commander Sam H. here - I'm experiencing some communication difficulties with the main computer. Please try again in a moment, or feel free to ask me about any specific planets or space phenomena you'd like to explore!"
        }
      }
      
      return "Hey... I'm having trouble processing that request right now. Maybe you could rephrase your thought?"
    }
  }

  /**
   * Generate a unique message ID
   */
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Create a new chat message
   */
  createMessage(content: string, role: "user" | "assistant"): ChatMessage {
    return {
      id: this.generateMessageId(),
      content,
      role,
      timestamp: new Date(),
    }
  }

  /**
   * Check if Edge Function is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke(this.functionName, {
        body: { 
          message: "health_check",
          isAnonymous: true 
        },
      })
      return !error
    } catch {
      return false
    }
  }
}

// Export a singleton instance
export const edgeChatService = new EdgeChatService()