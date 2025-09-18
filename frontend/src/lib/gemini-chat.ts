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
      console.warn("VITE_GEMINI_API_KEY environment variable is not set. Chat will work in demo mode.")
      // Don't throw error, allow chat to work in demo mode
    }

    this.config = {
      apiKey,
      model: "gemini-2.5-flash",
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
      // If no API key, return demo responses
      if (!this.config.apiKey) {
        return this.getDemoResponse(message)
      }

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
   * Get demo response when API key is not available
   */
  private getDemoResponse(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Commander Sam H. reporting for duty! Welcome aboard our deep space vessel. I'm here to guide you through our solar system exploration mission. What would you like to know about our celestial neighbors?"
    }
    
    if (lowerMessage.includes("earth")) {
      return "Ah, Earth - our beautiful blue marble! The third planet from the Sun and our home base. Earth is unique with its liquid water oceans, protective atmosphere, and diverse life forms. It's the only known planet to harbor life as we know it. What specific aspect of Earth interests you, Commander?"
    }
    
    if (lowerMessage.includes("mars")) {
      return "Mars, the Red Planet! Our next frontier for human exploration. Mars has polar ice caps, the largest volcano in the solar system (Olympus Mons), and evidence of ancient water flows. NASA and other space agencies are actively planning crewed missions there. The journey takes about 7 months with current technology."
    }
    
    if (lowerMessage.includes("jupiter")) {
      return "Jupiter - the king of planets! This gas giant is more massive than all other planets combined. It has over 80 moons, including the four Galilean moons: Io, Europa, Ganymede, and Callisto. Jupiter's Great Red Spot is a storm larger than Earth that's been raging for centuries!"
    }
    
    if (lowerMessage.includes("saturn")) {
      return "Saturn, the jewel of our solar system! Famous for its spectacular ring system made of ice and rock particles. Saturn has 146 known moons, including Titan with its thick atmosphere and methane lakes. The planet itself is less dense than water - it would float!"
    }
    
    if (lowerMessage.includes("sun")) {
      return "Our Sun - the heart of our solar system! This massive fusion reactor converts 600 million tons of hydrogen into helium every second, providing the energy that powers life on Earth. It's a middle-aged star that will shine for another 5 billion years."
    }
    
    if (lowerMessage.includes("space") || lowerMessage.includes("exploration")) {
      return "Space exploration is humanity's greatest adventure! We've sent probes to every planet, landed on the Moon, and have continuous human presence on the International Space Station. The next big steps include returning to the Moon, reaching Mars, and perhaps exploring the moons of Jupiter and Saturn."
    }
    
    // Default response
    return `Commander Sam H. here! I'm currently operating in demo mode without full AI capabilities, but I'm still ready to discuss space exploration with you. Try asking me about planets like Earth, Mars, Jupiter, or Saturn, or about space exploration in general. What celestial topic interests you most?`
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

// Export a singleton instance with error handling
let geminiChatService: GeminiChatService
try {
  geminiChatService = new GeminiChatService()
} catch (error) {
  console.error("Failed to initialize GeminiChatService:", error)
  // Create a fallback service that always works in demo mode
  geminiChatService = {
    generateMessageId: () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createMessage: (content: string, role: "user" | "assistant") => ({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      role,
      timestamp: new Date(),
    }),
    sendMessage: async (message: string) => {
      // Simple demo responses
      const lowerMessage = message.toLowerCase()
      if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
        return "Commander Sam H. reporting for duty! Welcome aboard our deep space vessel. What would you like to explore?"
      }
      return "Commander Sam H. here! I'm operating in demo mode. Try asking me about planets or space exploration!"
    }
  } as any
}

export { geminiChatService }
