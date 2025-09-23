/**
 * Type definitions for the Guarded Space Chat Edge Function
 */

/**
 * Chat message interface
 */
export interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
  isTyping?: boolean
}

/**
 * Chat request payload
 */
export interface ChatRequest {
  message: string
  conversationHistory?: ChatMessage[]
  userId?: string
  isAnonymous?: boolean
}

/**
 * Chat response payload
 */
export interface ChatResponse {
  success: boolean
  message: ChatMessage
  error?: string
  timestamp: string
}

/**
 * Gemini API response interface
 */
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
    finishReason?: string
    safetyRatings?: Array<{
      category: string
      probability: string
    }>
  }>
  promptFeedback?: {
    safetyRatings?: Array<{
      category: string
      probability: string
    }>
  }
}

/**
 * Chat service configuration
 */
export interface ChatConfig {
  apiKey: string
  model: string
  systemPrompt: string
}

/**
 * Moderation result interface
 */
export interface ModerationResult {
  isSafe: boolean
  riskLevel: "low" | "medium" | "high"
  categories: string[]
  reason?: string
}
