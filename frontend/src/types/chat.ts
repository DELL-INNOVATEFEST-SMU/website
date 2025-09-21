/**
 * Action button interface for chat messages
 */
export interface ChatActionButton {
  id: string
  label: string
  action: string
  variant?: "default" | "outline" | "secondary"
}

/**
 * Chat message interface for the space exploration chat system
 */
export interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isTyping?: boolean
  actionButtons?: ChatActionButton[]
}

/**
 * Chat session state interface
 */
export interface ChatSession {
  id: string
  messages: ChatMessage[]
  isActive: boolean
  lastActivity: Date
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
  }>
}

/**
 * Chat service configuration
 */
export interface ChatConfig {
  apiKey: string
  model: string
  systemPrompt: string
}
