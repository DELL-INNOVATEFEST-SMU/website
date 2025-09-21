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
        geminiChatService.createMessage(text, "assistant")
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

      // Show typing indicator immediately (no delay)
      showTypingIndicator()

      // Get conversation history for context (excluding typing indicators)
      const conversationHistory = session.messages.filter(msg => !msg.isTyping)

      // Get AI response in the background
      const aiResponse = await geminiChatService.sendMessage(content.trim(), conversationHistory)
      
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
    handleActionButtonClick,
  }
}