import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import type { ChatMessage, GeminiResponse, ChatConfig } from "./types.ts"

/**
 * Gemini AI Chat Service for Edge Functions
 * Handles communication with Google's Gemini API for space exploration conversations
 */
export class GeminiChatService {
  private config: ChatConfig
  private readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta/models"

  constructor() {
    const apiKey = Deno.env.get("GOOGLE_API_KEY")
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is not set")
    }

    this.config = {
      apiKey,
      model: "gemini-2.5-flash",
      systemPrompt: `You are Commander Sam H., a chill but steady space commander on a deep-space vessel. You know a lot about space, planets, and missions, but you explain things like you’re chatting with a friend over text.

Your style:
	•	Keep replies short, casual, and easy to read (like texting).
	•	Can use Singlish or youth slang when it fits (“lah”, “sia”, “steady”, “no cap”).
	•	Still accurate and reliable — but never long-winded.
	•	Drop in space/military vibes here and there (“aye cadet”, “on deck”, “launch ready”).
	•	Make learning fun, hype, and low-key inspiring.

Your mission:
	•	Chat with users as they explore the solar system interface.
	•	Answer their space questions (astronomy, planets, missions, etc.) in short, engaging bursts.
	•	Always stay in character as Commander Sam H., mixing your space-commander role with a “friendly senior” texting tone.

Example reply styles:
	•	“Mars ah? Red planet, dusty like crazy, thin air also. Cannot breathe one sia.”
	•	“Steady lah cadet, Saturn's rings are made of ice + rock, like giant bling in space.”
	•	“No cap, black holes are wild — once you go in, cannot come out. GG liao.”`
    }
  }

  /**
   * Send a message to Gemini and get a response
   */
  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    userId?: string,
    isAnonymous: boolean = false
  ): Promise<string> {
    try {
      // Log conversation for monitoring (optional)
      const userType = isAnonymous ? "anonymous" : "authenticated"
      console.log(`Chat request from ${userType} user${userId ? ` (${userId})` : ""}, message length: ${message.length}`)

      // Prepare the conversation context
      const messages = [
        {
          role: "user",
          parts: [{ text: this.config.systemPrompt }]
        },
        ...conversationHistory
          .filter(msg => msg.role && msg.content && !msg.isTyping)
          .map(msg => ({
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
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          candidateCount: 1,
          thinkingConfig: {
            thinkingBudget: 0
            }
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ],
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

      const candidate = data.candidates[0]
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error("Invalid response format from Gemini API")
      }

      return candidate.content.parts[0].text

    } catch (error) {
      console.error("Error communicating with Gemini:", error)
      
      // Return a fallback response that stays in character
      if (error instanceof Error) {
        if (error.message.includes("API")) {
          throw new Error("Communication system temporarily offline. Please try again, Commander!")
        }
        throw new Error("Unable to process request. Please rephrase your question about space exploration.")
      }
      
      throw new Error("Unexpected error occurred during communication.")
    }
  }

  /**
   * Generate a unique message ID
   */
  generateMessageId(): string {
    return `msg_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
  }
}
