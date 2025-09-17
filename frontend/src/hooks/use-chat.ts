import { useState, useCallback, useRef, useEffect } from "react"
import type { ChatMessage, ChatSession } from "@/types/chat"
import { geminiChatService } from "@/lib/gemini-chat"

/**
 * Custom hook for managing chat functionality
 */
export function useChat() {
  const [session, setSession] = useState<ChatSession>({
    id: `session_${Date.now()}`,
    messages: [
      {
        id: "welcome_msg",
        content: "Commander Sam H. here, ready for your orders. Select a planet to begin our mission briefing, or just chat with me about space exploration!",
        role: "assistant",
        timestamp: new Date(),
      }
    ],
    isActive: false,
    lastActivity: new Date(),
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  /**
   * Simulate typing effect for bot responses
   */
  const simulateTyping = useCallback(async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true)
      
      // Add typing indicator message
      const typingMessage: ChatMessage = {
        id: "typing_indicator",
        content: "",
        role: "assistant",
        timestamp: new Date(),
        isTyping: true,
      }

      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, typingMessage],
        lastActivity: new Date(),
      }))

      // Simulate realistic typing delay based on message length
      const typingDelay = Math.min(Math.max(text.length * 20, 1000), 3000)
      
      setTimeout(() => {
        setIsTyping(false)
        
        // Remove typing indicator and add actual message
        setSession(prev => ({
          ...prev,
          messages: [
            ...prev.messages.filter(msg => msg.id !== "typing_indicator"),
            geminiChatService.createMessage(text, "assistant")
          ],
          lastActivity: new Date(),
        }))
        
        resolve()
      }, typingDelay)
    })
  }, [])

  /**
   * Send a message and get AI response
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)

    try {
      // Add user message immediately
      const userMessage = geminiChatService.createMessage(content.trim(), "user")
      
      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        lastActivity: new Date(),
      }))

      // Get conversation history for context (excluding typing indicators)
      const conversationHistory = session.messages.filter(msg => !msg.isTyping)

      // Get AI response
      const aiResponse = await geminiChatService.sendMessage(content.trim(), conversationHistory)
      
      // Simulate typing and add AI response
      await simulateTyping(aiResponse)

    } catch (error) {
      console.error("Error sending message:", error)
      
      // Add error message
      await simulateTyping("I'm experiencing some technical difficulties. Please try again, Commander!")
      
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, session.messages, simulateTyping])

  /**
   * Clear chat history
   */
  const clearChat = useCallback(() => {
    setSession(prev => ({
      ...prev,
      messages: [
        {
          id: "welcome_msg_new",
          content: "Commander Sam H. here, ready for your orders. Select a planet to begin our mission briefing, or just chat with me about space exploration!",
          role: "assistant",
          timestamp: new Date(),
        }
      ],
      lastActivity: new Date(),
    }))
  }, [])

  /**
   * Toggle chat active state
   */
  const toggleChat = useCallback(() => {
    console.log("toggleChat called - current isActive:", session.isActive)
    setSession(prev => {
      const newState = {
        ...prev,
        isActive: !prev.isActive,
        lastActivity: new Date(),
      }
      console.log("toggleChat - new isActive:", newState.isActive)
      return newState
    })
  }, [session.isActive])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [session.messages, scrollToBottom])

  return {
    session,
    isLoading,
    isTyping,
    messagesEndRef,
    sendMessage,
    clearChat,
    toggleChat,
    scrollToBottom,
  }
}
