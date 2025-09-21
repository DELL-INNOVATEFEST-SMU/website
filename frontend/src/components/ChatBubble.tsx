import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  isOpen: boolean;
  hasUnreadMessages: boolean;
  lastMessage?: string;
  onClick: () => void;
  className?: string;
}

/**
 * Floating chat bubble component that appears when chat is minimized
 * Positioned in the bottom right corner with space theme styling
 */
export function ChatBubble({
  isOpen,
  hasUnreadMessages,
  lastMessage,
  onClick,
  className,
}: ChatBubbleProps) {
  if (isOpen) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
        "hover:scale-105 active:scale-95",
        className
      )}
    >
      {/* Chat Preview Tooltip */}
      {hasUnreadMessages && lastMessage && (
        <div className="absolute bottom-16 right-0 mb-2 max-w-64 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Pulsing Ring Effect - Behind the button */}
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 border-blue-400/50",
          "animate-ping pointer-events-none -z-10",
          hasUnreadMessages ? "opacity-75" : "opacity-0"
        )}
      />

      {/* Main Chat Bubble */}
      <Button
        onClick={() => {
          console.log("ChatBubble clicked!");
          onClick();
        }}
        size="lg"
        className={cn(
          "relative h-14 w-14 rounded-full shadow-lg z-10",
          "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700",
          "hover:from-blue-500 hover:via-purple-500 hover:to-indigo-600",
          "border-2 border-white/20",
          "transition-all duration-300 ease-in-out",
          hasUnreadMessages && "animate-pulse"
        )}
      >
        <MessageCircle className="h-6 w-6 text-white" />

        {/* Unread Message Indicator */}
        {hasUnreadMessages && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 hover:bg-red-500 text-white text-xs border-2 border-white">
            !
          </Badge>
        )}
      </Button>
    </div>
  );
}
