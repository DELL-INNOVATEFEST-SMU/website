import type { ChatMessage } from "@/types/chat"
import { supabase } from "@/services/supabase/client"

/**
 * Chat request interface for Edge Function
 */
interface ChatRequest {
  message: string
  conversationHistory?: ChatMessage[]
  userId?: string
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
 */
export class EdgeChatService {
  private readonly functionName = "space-chat"

  /**
   * Send a message to the Edge Function and get a response
   */
  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Get current user for context (optional)
      const { data: { user } } = await supabase.auth.getUser()

      // Prepare request payload
      const requestPayload: ChatRequest = {
        message: message.trim(),
        conversationHistory: conversationHistory.filter(msg => !msg.isTyping),
        userId: user?.id
      }

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: requestPayload,
      })

      if (error) {
        console.error("Edge Function Error:", error)
        throw new Error(`Edge Function failed: ${error.message}`)
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
        if (error.message.includes("Edge Function") || error.message.includes("network")) {
          return "Commander Sam H. here - I'm experiencing some communication difficulties with the main computer. Please try again in a moment, or feel free to ask me about any specific planets or space phenomena you'd like to explore!"
        }
      }
      
      return "Commander Sam H. reporting - I'm having trouble processing that request right now. Perhaps you could rephrase your question about space exploration, or ask me about any of the planets in our solar system?"
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
        body: { message: "health_check" },
      })
      return !error
    } catch {
      return false
    }
  }
}

// Export a singleton instance
export const edgeChatService = new EdgeChatService()
