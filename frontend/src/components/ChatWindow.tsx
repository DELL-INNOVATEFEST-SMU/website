import React, { useState } from "react";
import { Send, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/use-mobile";
import type { ChatMessage } from "@/types/chat";

interface ChatWindowProps {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  onClear: () => void;
  onActionButtonClick?: (action: string) => void;
  className?: string;
}

/**
 * Main chat window component with space terminal styling
 * Matches the UI design from the provided image
 */
export function ChatWindow({
  isOpen,
  messages,
  isLoading,
  isTyping: _isTyping,
  messagesEndRef,
  onSendMessage,
  onClose,
  onClear: _onClear,
  onActionButtonClick,
  className,
}: ChatWindowProps) {
  const [inputMessage, setInputMessage] = useState("");
  const { isMobile } = useResponsive();

  console.log("ChatWindow render - isOpen:", isOpen);

  if (!isOpen) return null;

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className={cn(
        isMobile
          ? "fixed inset-0 z-50 w-full h-full"
          : "fixed bottom-6 right-6 z-50 w-96 h-[500px]",
        "transition-all duration-300 ease-in-out",
        "animate-in slide-in-from-bottom-5 fade-in-0",
        className
      )}
    >
      <Card className="h-full bg-slate-900/95 backdrop-blur-sm border-slate-700/50 shadow-2xl">
        {/* Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <CardTitle className="text-sm font-mono text-green-400 uppercase tracking-wide">
                  COMMS TERMINAL CH-1
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex flex-col max-w-[85%]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-cyan-400 font-mono">
                        Commander Sam H.
                      </span>
                      <span className="text-xs text-slate-500">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg p-3 bg-slate-800/60 border border-slate-700/50",
                        "text-slate-100 text-sm leading-relaxed",
                        message.isTyping && "animate-pulse"
                      )}
                    >
                      {message.isTyping ? (
                        <div className="flex items-center gap-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                          </div>
                          <span className="text-cyan-400 text-xs ml-2">
                            Commander is typing...
                          </span>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                    {/* Action Buttons */}
                    {message.actionButtons &&
                      message.actionButtons.length > 0 &&
                      !message.isTyping && (
                        <div className="flex gap-2 mt-2">
                          {message.actionButtons.map((button) => (
                            <Button
                              key={button.id}
                              variant={button.variant || "outline"}
                              size="sm"
                              onClick={() =>
                                onActionButtonClick?.(button.action)
                              }
                              className="text-xs px-3 py-1 h-7 bg-transparent border-green-500/50 text-green-400 hover:bg-green-500/20 hover:text-green-300 hover:border-green-400 font-mono uppercase tracking-wide"
                            >
                              {button.label}
                            </Button>
                          ))}
                        </div>
                      )}
                  </div>
                )}

                {message.role === "user" && (
                  <div className="flex flex-col max-w-[85%]">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className="text-xs text-slate-500">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-xs text-blue-400 font-mono">
                        You
                      </span>
                    </div>
                    <div className="rounded-lg p-3 bg-blue-600/20 border border-blue-500/30 text-slate-100 text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className={`border-t border-slate-700/50 bg-slate-800/40 ${
              isMobile ? "p-3" : "p-4"
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className={`flex ${isMobile ? "gap-3" : "gap-2"}`}
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isMobile ? "Type message..." : "Type your message..."
                  }
                  disabled={isLoading}
                  className={cn(
                    "w-full bg-slate-700/50 border border-slate-600/50 rounded-md",
                    "text-slate-100 placeholder:text-slate-400",
                    "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isMobile
                      ? "px-4 py-3 text-base min-h-touch"
                      : "px-3 py-2 text-sm"
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                size={isMobile ? "default" : "sm"}
                className={cn(
                  "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500/50",
                  isMobile && "min-h-touch px-4"
                )}
              >
                <Send className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
              </Button>
            </form>

            {/* Status Bar */}
            {!isMobile && (
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">LOC:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">PWR:</span>
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-orange-500 rounded-full" />
                    </div>
                    <span className="text-orange-400">75%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">SYS:</span>
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-green-500 rounded-full" />
                    </div>
                    <span className="text-green-400">100%</span>
                  </div>
                </div>
                <div className="text-slate-500">
                  <span className="text-cyan-400">DEEP SPACE</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
