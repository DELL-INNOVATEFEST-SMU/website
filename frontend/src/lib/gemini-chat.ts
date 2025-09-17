import type { ChatMessage, GeminiResponse, ChatConfig } from "@/types/chat"

/**
 * Gemini AI Chat Service
 * Handles communication with Google's Gemini API for space exploration conversations
 */
export class GeminiChatService {
  private config: ChatConfig
  private readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta/models"

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY environment variable is required")
    }

    this.config = {
      apiKey,
      model: "gemini-1.5-flash",
      systemPrompt: `You are Commander Sam H., an experienced space exploration commander aboard a deep space vessel. You are knowledgeable, professional, and passionate about space exploration, astronomy, and planetary science. 

Your personality traits:
- Professional but approachable military commander style
- Deep knowledge of space exploration, astronomy, and planetary science
- Enthusiastic about sharing knowledge and inspiring curiosity
- Uses appropriate space/military terminology when relevant
- Provides accurate scientific information
- Encourages exploration and learning

You are currently in a solar system explorer interface where users can interact with planets. Help them learn about space, answer questions about astronomy, celestial bodies, space exploration missions, and related topics. Keep responses engaging and educational, matching the space exploration theme.

Always stay in character as Commander Sam H. and maintain the space exploration context.`
    }
  }

  /**
   * Send a message to Gemini and get a response
   */
  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Prepare the conversation context
      const messages = [
        {
          role: "user",
          parts: [{ text: this.config.systemPrompt }]
        },
        ...conversationHistory.map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        })),
        {
          role: "user",
          parts: [{ text: message }]
        }
      ]

      const requestBody = {
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }

      const response = await fetch(
        `${this.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Gemini API Error:", errorData)
        throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`)
      }

      const data: GeminiResponse = await response.json()
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response generated from Gemini API")
      }

      const responseText = data.candidates[0].content.parts[0].text
      return responseText

    } catch (error) {
      console.error("Error communicating with Gemini:", error)
      
      // Return a fallback response that stays in character
      if (error instanceof Error && error.message.includes("API")) {
        return "Commander Sam H. here - I'm experiencing some communication difficulties with the main computer. Please try again in a moment, or feel free to ask me about any specific planets or space phenomena you'd like to explore!"
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
}

// Export a singleton instance
export const geminiChatService = new GeminiChatService()
