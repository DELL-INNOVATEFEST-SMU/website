import { useState, useCallback, useRef, useEffect } from "react"
import type { ChatMessage, ChatSession, ChatActionButton } from "@/types/chat"
import { edgeChatService } from "@/lib/gemini-chat-edge"
import { useAuthContext } from "@/providers/AuthProvider"

/**
 * Custom hook for managing chat functionality with Edge Function
 * Uses main authentication system for proper auth handling
 * Updated to work with AuthGate - users are guaranteed to be authenticated
 */
export function useChatEdge() {
  const { user, isAnonymous } = useAuthContext()
  
  const [session, setSession] = useState<ChatSession>({
    id: `session_${Date.now()}`,
    messages: [
      {
        id: "welcome_msg",
        content: "Commander Sam H. here, ready for your orders. Select a planet to begin our mission briefing, or just chat with me about space exploration!",
        role: "assistant",
        timestamp: new Date(),
        actionButtons: [
          {
            id: "first_mission_btn",
            label: "First Mission",
            action: "first_mission",
            variant: "outline"
          },
          {
            id: "where_are_we_btn",
            label: "Where are we?",
            action: "where_are_we",
            variant: "outline"
          }
        ]
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
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
      // Check if user is authenticated (AuthGate ensures this, but good to verify)
      if (!user) {
        console.error("User not authenticated - this should not happen with AuthGate")
        return
      }

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
  }, [isLoading, session.messages, showTypingIndicator, simulateTyping, user])

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
          actionButtons: [
            {
              id: "first_mission_btn",
              label: "First Mission",
              action: "first_mission",
              variant: "outline"
            },
            {
              id: "where_are_we_btn",
              label: "Where are we?",
              action: "where_are_we",
              variant: "outline"
            }
          ]
        }
      ],
      lastActivity: new Date(),
    }))
  }, [])

  /**
   * Handle action button clicks
   */
  const handleActionButtonClick = useCallback(async (action: string) => {
    if (action === "where_are_we") {
      // Add user message showing the button click
      const userMessage: ChatMessage = {
        id: `user_action_${Date.now()}`,
        content: "Where are we?",
        role: "user",
        timestamp: new Date(),
      }

      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        lastActivity: new Date(),
      }))

      // Show typing indicator
      showTypingIndicator()

      // Add the response
      const responseText = "You're adrift among the stars, Commander. Out here, space can feel endless… and a little lonely. That's why we've charted planets where you can land, pause, and catch your breath after the tough grind of astro-work. But our journey isn't over—our next destination lies a hundred light years away. To get there, we'll need to gather enough fuel for the voyage. Ready to keep pushing the frontier?"

      await simulateTyping(responseText)

      // Update the welcome message to only show First Mission button
      setSession(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === "welcome_msg" || msg.id === "welcome_msg_new"
            ? {
                ...msg,
                actionButtons: [
                  {
                    id: "first_mission_btn",
                    label: "First Mission",
                    action: "first_mission",
                    variant: "outline"
                  }
                ]
              }
            : msg
        ),
        lastActivity: new Date(),
      }))
    } else if (action === "first_mission") {
      // Add user message showing the button click
      const userMessage: ChatMessage = {
        id: `user_action_${Date.now()}`,
        content: "First Mission",
        role: "user",
        timestamp: new Date(),
      }

      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        lastActivity: new Date(),
      }))

      // Show typing indicator
      showTypingIndicator()

      // Add a response for first mission
      const responseText = "Excellent choice, Commander! Your first mission is to explore the planets in our solar system. Each planet offers unique activities and experiences. Click on any planet to begin your journey and discover what awaits you in the cosmos."

      await simulateTyping(responseText)
    }
  }, [showTypingIndicator, simulateTyping])

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

  // Monitor user authentication state
  useEffect(() => {
    if (!user) {
      console.warn("User authentication lost - AuthGate should handle this")
      setIsOnline(false)
    } else {
      // User is authenticated, ensure we're online for chat
      checkHealth()
    }
  }, [user, checkHealth])

  return {
    session,
    isLoading,
    isTyping,
    isOnline,
    isAuthenticated: !!user && !isAnonymous,
    messagesEndRef,
    sendMessage,
    clearChat,
    toggleChat,
    scrollToBottom,
    checkHealth,
    handleActionButtonClick,
  }
}