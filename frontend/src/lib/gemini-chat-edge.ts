import type { ChatMessage } from "@/types/chat"
import { supabase } from "@/services/supabase/client"

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
 * Supports both authenticated and anonymous users
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
      // Try to get current user (non-blocking)
      let user = null
      let isAnonymous = true
      
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        if (!error && currentUser) {
          user = currentUser
          isAnonymous = false
        }
      } catch (authError) {
        // Auth error is non-critical for chat functionality
        console.log("Auth check failed, proceeding as anonymous user:", authError)
      }

      // Prepare request payload
      const requestPayload: ChatRequest = {
        message: message.trim(),
        conversationHistory: conversationHistory.filter(msg => !msg.isTyping),
        userId: user?.id,
        isAnonymous
      }

      // Call the Edge Function with anonymous access
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: requestPayload,
      })

      if (error) {
        console.error("Edge Function Error:", error)
        
        // Handle specific auth-related errors gracefully
        if (error.message?.includes("JWT") || error.message?.includes("auth")) {
          console.log("Auth-related error, retrying as anonymous...")
          // Retry with explicit anonymous flag
          const retryPayload: ChatRequest = {
            message: message.trim(),
            conversationHistory: conversationHistory.filter(msg => !msg.isTyping),
            isAnonymous: true
          }
          
          const { data: retryData, error: retryError } = await supabase.functions.invoke(this.functionName, {
            body: retryPayload,
          })
          
          if (retryError) {
            throw new Error(`Edge Function failed: ${retryError.message}`)
          }
          
          const retryResponse: ChatResponse = retryData
          if (!retryResponse.success) {
            throw new Error(retryResponse.error || "Unknown error occurred")
          }
          
          return retryResponse.message.content
        }
        
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
        if (error.message.includes("auth") || error.message.includes("JWT")) {
          return "Commander Sam H. reporting - Communication systems are operational for all crew members. What would you like to explore in our solar system?"
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

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return !error && !!user
    } catch {
      return false
    }
  }
}

// Export a singleton instance
export const edgeChatService = new EdgeChatService()
