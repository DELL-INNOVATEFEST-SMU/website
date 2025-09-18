import { useState, useCallback, useRef, useEffect } from "react"
import type { ChatMessage, ChatSession } from "@/types/chat"
import { edgeChatService } from "@/lib/gemini-chat-edge"

/**
 * Custom hook for managing chat functionality with Edge Function
 */
export function useChatEdge() {
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
  const [isOnline, setIsOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  /**
   * Show typing indicator immediately
   */
  const showTypingIndicator = useCallback(() => {
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
    
    setIsTyping(true)
  }, [])

  /**
   * Replace typing indicator with actual message
   */
  const replaceTypingWithMessage = useCallback((text: string) => {
    setIsTyping(false)
    
    // Remove typing indicator and add actual message
    setSession(prev => ({
      ...prev,
      messages: [
        ...prev.messages.filter(msg => msg.id !== "typing_indicator"),
        edgeChatService.createMessage(text, "assistant")
      ],
      lastActivity: new Date(),
    }))
  }, [])

  /**
   * Simulate typing effect for bot responses with realistic delay
   */
  const simulateTyping = useCallback(async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      // Simulate realistic typing delay based on message length
      const typingDelay = Math.min(Math.max(text.length * 15, 800), 2500)
      
      setTimeout(() => {
        replaceTypingWithMessage(text)
        resolve()
      }, typingDelay)
    })
  }, [replaceTypingWithMessage])

  /**
   * Send a message and get AI response via Edge Function
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)

    try {
      // Add user message immediately
      const userMessage = edgeChatService.createMessage(content.trim(), "user")
      
      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        lastActivity: new Date(),
      }))

      // Show typing indicator immediately (no delay)
      showTypingIndicator()

      // Get conversation history for context (excluding typing indicators)
      const conversationHistory = session.messages.filter(msg => !msg.isTyping)

      // Get AI response from Edge Function
      const aiResponse = await edgeChatService.sendMessage(content.trim(), conversationHistory)
      
      // Simulate typing and add AI response
      await simulateTyping(aiResponse)

    } catch (error) {
      console.error("Error sending message:", error)
      
      // Add error message with typing simulation
      await simulateTyping("I'm experiencing some technical difficulties. Please try again, Commander!")
      
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, session.messages, showTypingIndicator, simulateTyping])

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
    setSession(prev => ({
      ...prev,
      isActive: !prev.isActive,
      lastActivity: new Date(),
    }))
  }, [])

  /**
   * Check Edge Function health
   */
  const checkHealth = useCallback(async () => {
    try {
      const healthy = await edgeChatService.healthCheck()
      setIsOnline(healthy)
      return healthy
    } catch {
      setIsOnline(false)
      return false
    }
  }, [])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [session.messages, scrollToBottom])

  // Health check on mount
  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  return {
    session,
    isLoading,
    isTyping,
    isOnline,
    messagesEndRef,
    sendMessage,
    clearChat,
    toggleChat,
    scrollToBottom,
    checkHealth,
  }
}
