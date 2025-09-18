import { useState, useEffect } from "react";
import { ChatWindow } from "./ChatWindow";
import { ChatBubble } from "./ChatBubble";
import { useChatEdge } from "@/hooks/use-chat-edge";
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
    isOnline,
    isAuthenticated,
    messagesEndRef,
    sendMessage,
    clearChat,
    toggleChat,
  } = useChatEdge();

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
      {/* Status Indicators */}
      {session.isActive && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          {!isOnline && (
            <div className="bg-yellow-500/90 text-yellow-100 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              ⚠️ Connection issues detected
            </div>
          )}
          {!isAuthenticated && isOnline && (
            <div className="bg-blue-500/90 text-blue-100 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              👤 Anonymous mode - messages not saved
            </div>
          )}
        </div>
      )}

      {/* Chat Window */}
      <ChatWindow
        isOpen={session.isActive}
        messages={session.messages}
        isLoading={isLoading}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
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
