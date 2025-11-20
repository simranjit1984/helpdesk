import React, { useState, useEffect, useRef } from "react";
import { Minimize2, Brain, Send } from "lucide-react";
import { InsightCard } from "./InsightCard";
import { generateUserInsights, UserData, Insight } from "./insightsGenerator";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  userData: UserData;
  isOpen?: boolean;
  isSideSheetOpen?: boolean;
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const AIAssistant = ({ userData, isOpen = true, isSideSheetOpen = false }: AIAssistantProps) => {
  // Initialize from localStorage if available, otherwise use isOpen prop
  const [isMinimized, setIsMinimized] = useState(() => {
    const saved = localStorage.getItem("aiAssistantMinimized");
    return saved !== null ? JSON.parse(saved) : !isOpen;
  });
  const [previousMinimizedState, setPreviousMinimizedState] = useState(
    () => {
      const saved = localStorage.getItem("aiAssistantMinimized");
      return saved !== null ? JSON.parse(saved) : !isOpen;
    }
  );
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isMac, setIsMac] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Detect OS for correct keyboard shortcut display
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
  }, []);

  // Generate insights on mount
  useEffect(() => {
    setIsLoading(true);
    // Simulate AI processing delay
    const timer = setTimeout(() => {
      const generated = generateUserInsights(userData);
      setInsights(generated);
      setIsLoading(false);

      // Add initial assistant message
      setMessages([
        {
          id: "1",
          type: "assistant",
          content: `I've analyzed ${userData.firstName} ${userData.lastName}'s profile. I found ${generated.length} insights and recommendations that need your attention.`,
          timestamp: new Date(),
        },
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [userData]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sidesheet open/close
  useEffect(() => {
    if (isSideSheetOpen) {
      // Save current state and minimize
      setPreviousMinimizedState(isMinimized);
      setIsMinimized(true);
    } else {
      // Restore previous state
      setIsMinimized(previousMinimizedState);
    }
  }, [isSideSheetOpen]);

  // Handle keyboard shortcuts (Ctrl+K or Cmd+K, and Escape)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Ctrl+K or Cmd+K
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();

        // Store the current focus before opening
        if (isMinimized && document.activeElement instanceof HTMLElement) {
          previousFocusRef.current = document.activeElement;
        }

        // If minimized, restore the window
        if (isMinimized) {
          setIsMinimized(false);
          // Focus input field after state update
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
        } else {
          // If already open, just focus the input field
          inputRef.current?.focus();
        }
      }

      // Handle Escape key
      if (event.key === "Escape" && !isMinimized) {
        event.preventDefault();
        setIsMinimized(true);
        // Restore focus to the previous element
        setTimeout(() => {
          previousFocusRef.current?.focus();
        }, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMinimized]);

  // Add transition classes for minimize/maximize animation
  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateMockResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  if (isMinimized) {
    // When sidesheet is open, move button left to maintain 24px gap from sidesheet
    // Sidesheet width (384px = sm:max-w-sm) + desired gap (24px)
    const rightPosition = isSideSheetOpen ? "calc(384px + 24px)" : "24px";

    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 z-40 h-14 w-14 rounded-full bg-[#041295] text-white shadow-lg hover:bg-[#041295]/90 transition-all duration-300 flex items-center justify-center animate-[slide-up-in_0.3s_ease-out_forwards]"
        style={{ right: rightPosition }}
        title="Open AI Assistant"
      >
        <Brain className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-bluegrey-200 animate-[slide-up-in_0.3s_ease-out_forwards]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#041295] to-[#041295]/90 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5" />
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">AI Assistant</h2>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[#041295]/40 rounded border border-white/20">
              {isMac ? (
                <>
                  <span>⌘</span>
                  <span>K</span>
                </>
              ) : (
                <>
                  <span>Ctrl</span>
                  <span>K</span>
                </>
              )}
            </kbd>
          </div>
        </div>
        <button
          onClick={handleMinimize}
          className="p-1 hover:bg-[#041295]/30 rounded transition-colors"
          title="Minimize"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-3 bg-bluegrey-25">
        {/* Insights Section */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#041295] mx-auto mb-3" />
              <p className="text-sm text-bluegrey-600">
                Analyzing user profile...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Insights Header */}
            <div className="mb-1">
              <h3 className="text-xs font-semibold text-bluegrey-900 uppercase tracking-wider">
                Insights & Recommendations
              </h3>
            </div>

            {/* Insight Cards */}
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                type={insight.type}
                severity={insight.severity}
                title={insight.title}
                description={insight.description}
                actions={insight.actions}
                icon={insight.icon}
              />
            ))}

            {/* Chat Messages */}
            {messages.length > 0 && (
              <div className="mt-2 pt-3 border-t border-bluegrey-200">
                <h3 className="text-xs font-semibold text-bluegrey-900 mb-2 uppercase tracking-wider">
                  Messages
                </h3>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "mb-2 flex",
                      message.type === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                        message.type === "user"
                          ? "bg-[#041295] text-white"
                          : "bg-white text-bluegrey-900 border border-bluegrey-200"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-bluegrey-200 p-3 flex-shrink-0 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            placeholder="Ask..."
            className="flex-1 rounded-lg border border-bluegrey-300 px-3 py-2 text-xs"
          />
          <button
            onClick={handleSendMessage}
            className="bg-[#041295] text-white p-2 rounded-lg hover:bg-[#041295]/90 transition-colors"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock response generator for demo
const generateMockResponse = (userInput: string): string => {
  const input = userInput.toLowerCase();

  if (input.includes("role") || input.includes("access")) {
    return "You can add access roles by clicking the 'Add Role' button in the Access Roles section. This will open a dialog where you can select from available roles and set expiration dates.";
  }

  if (input.includes("expir") || input.includes("validity")) {
    return "To update the account validity date, click on the 'Change Validity' button or directly edit the End Date field in the Basic Information tab.";
  }

  if (input.includes("security") || input.includes("mfa")) {
    return "Multi-factor authentication adds an extra layer of security. You can configure it in the Security tab. Click 'Configure MFA' to set it up.";
  }

  if (input.includes("activity") || input.includes("event")) {
    return "Recent events are displayed in the Event Log tab. You can view detailed information about user actions, logins, and system events.";
  }

  return "I'm here to help! You can ask me about user roles, account validity, security settings, or recent activity. I can also guide you to make specific changes.";
};
