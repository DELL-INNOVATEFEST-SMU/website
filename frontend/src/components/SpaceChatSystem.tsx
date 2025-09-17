import React, { useState, useEffect } from "react";
import { ChatWindow } from "./ChatWindow";
import { ChatBubble } from "./ChatBubble";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

interface SpaceChatSystemProps {
  className?: string;
}

/**
 * Main chat system component that manages the chat window and bubble
 * Integrates seamlessly with the 3D space environment
 */
export function SpaceChatSystem({ className }: SpaceChatSystemProps) {
  const {
    session,
    isLoading,
    isTyping,
    messagesEndRef,
    sendMessage,
    clearChat,
    toggleChat,
  } = useChat();

  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  /**
   * Track unread messages when chat is closed
   */
  useEffect(() => {
    if (!session.isActive && session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1];
      if (lastMessage.role === "assistant" && !lastMessage.isTyping) {
        setHasUnreadMessages(true);
      }
    }
  }, [session.messages, session.isActive]);

  /**
   * Clear unread messages when chat is opened
   */
  useEffect(() => {
    if (session.isActive) {
      setHasUnreadMessages(false);
    }
  }, [session.isActive]);

  /**
   * Get the last assistant message for bubble preview
   */
  const getLastMessage = (): string | undefined => {
    const lastAssistantMessage = session.messages
      .filter((msg) => msg.role === "assistant" && !msg.isTyping)
      .pop();

    return lastAssistantMessage?.content;
  };

  console.log("SpaceChatSystem render - session.isActive:", session.isActive);

  return (
    <div className={cn("relative", className)}>
      {/* Chat Window */}
      <ChatWindow
        isOpen={session.isActive}
        messages={session.messages}
        isLoading={isLoading}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        onSendMessage={sendMessage}
        onClose={toggleChat}
        onClear={clearChat}
      />

      {/* Chat Bubble */}
      <ChatBubble
        isOpen={session.isActive}
        hasUnreadMessages={hasUnreadMessages}
        lastMessage={getLastMessage()}
        onClick={toggleChat}
      />
    </div>
  );
}
