import React, { useState, useEffect, useRef } from "react";
import { Minimize2, Brain, Send } from "lucide-react";
import { InsightCard } from "./InsightCard";
import { generateUserInsights, UserData, Insight } from "./insightsGenerator";
import { cn } from "@/lib/utils";
import { Event } from "@/components/mockEvents";

// Bounce animation styles
const glowStyle = `
  @keyframes button-bounce {
    0% {
      transform: translateY(0);
    }
    6% {
      transform: translateY(-12px);
    }
    12% {
      transform: translateY(0);
    }
    18% {
      transform: translateY(-8px);
    }
    24% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-4px);
    }
    36% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(0);
    }
  }

  .ai-assistant-bounce {
    animation: button-bounce 1.2s ease-out 3 forwards;
  }
`;

interface AIAssistantProps {
  userData: UserData;
  isOpen?: boolean;
  isSideSheetOpen?: boolean;
  selectedCard?: { cardType: string; data: any } | null;
  events?: Event[];
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const AIAssistant = ({ userData, isOpen = true, isSideSheetOpen = false, selectedCard, events = [] }: AIAssistantProps) => {
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
  const [showAnimation, setShowAnimation] = useState(false);
  const [hasNewContent, setHasNewContent] = useState(false);
  const [showBounce, setShowBounce] = useState(false);
  const bounceTimeoutRef = useRef<NodeJS.Timeout>();
  const previousUserDataIdRef = useRef<string>("");
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

  // Persist minimized state to localStorage
  useEffect(() => {
    localStorage.setItem("aiAssistantMinimized", JSON.stringify(isMinimized));
  }, [isMinimized]);

  // Generate insights on mount
  useEffect(() => {
    // Check if this is a new user (userData changed)
    const currentUserId = userData.id || userData.email || "";
    const isNewUser = currentUserId && previousUserDataIdRef.current !== currentUserId;

    // Only highlight if we're switching to a new user with content (not empty userData)
    if (isNewUser && currentUserId) {
      setHasNewContent(true);
      setShowBounce(true);
      previousUserDataIdRef.current = currentUserId;

      // Stop bounce animation after 3.6s (3 bounce sequences, 1.2s each)
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current);
      }
      bounceTimeoutRef.current = setTimeout(() => {
        setShowBounce(false);
      }, 3600);
    }

    setIsLoading(true);
    // Simulate AI processing delay
    const timer = setTimeout(() => {
      const generated = generateUserInsights(userData);
      setInsights(generated);
      setIsLoading(false);

      // Add initial assistant message only if userData has content
      if (currentUserId) {
        setMessages([
          {
            id: "1",
            type: "assistant",
            content: `I've analyzed ${userData.firstName} ${userData.lastName}'s profile. I found ${generated.length} insights and recommendations that need your attention.`,
            timestamp: new Date(),
          },
        ]);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current);
      }
    };
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
      setShowAnimation(true);
      setIsMinimized(true);
      setTimeout(() => setShowAnimation(false), 300);
    } else {
      // Restore previous state
      setShowAnimation(true);
      setIsMinimized(previousMinimizedState);
      setTimeout(() => setShowAnimation(false), 300);
    }
  }, [isSideSheetOpen]);

  // Generate insights from events based on card type
  const generateCardInsights = (cardType: string, data: any, allEvents: Event[]) => {
    const getEventStatus = (description: string): "success" | "failure" => {
      const lowerDesc = description?.toLowerCase() || "";
      if (lowerDesc.includes("failed") || lowerDesc.includes("failure") || lowerDesc.includes("lockout") || lowerDesc.includes("invalid")) {
        return "failure";
      }
      return "success";
    };

    const getAuthenticatorFromEvent = (event: Event): string | null => {
      if (!event.description) return null;
      const description = event.description.toLowerCase();
      if (description.includes("sms otp")) return "SMS OTP";
      if (description.includes("email otp")) return "Email OTP";
      if (description.includes("totp")) return "TOTP";
      if (description.includes("qr code")) return "QR code Enrollment";
      if (description.includes("push") || description.includes("mfa")) return "Push MFA";
      if (description.includes("magic link")) return "Magic link authentication";
      if (description.includes("username") || description.includes("password")) return "Username & Password";
      if (description.includes("google")) return "Google";
      if (description.includes("facebook")) return "Facebook";
      if (description.includes("apple")) return "Apple";
      return null;
    };

    let insights = "";

    switch (cardType) {
      case "totalEvents": {
        const eventsByType = new Map<string, number>();
        const eventsByApp = new Map<string, number>();
        allEvents.forEach((event) => {
          eventsByType.set(event.eventType, (eventsByType.get(event.eventType) || 0) + 1);
          if (event.application) {
            eventsByApp.set(event.application, (eventsByApp.get(event.application) || 0) + 1);
          }
        });

        const topEventType = Array.from(eventsByType.entries()).sort((a, b) => b[1] - a[1])[0];
        const topApp = Array.from(eventsByApp.entries()).sort((a, b) => b[1] - a[1])[0];

        insights = `I've analyzed ${data.totalCount} total authentication events for this user.\n\n**Key Findings:**\n- Most common event type: ${topEventType ? topEventType[0] + ` (${topEventType[1]} occurrences)` : "N/A"}\n- Primary application: ${topApp ? topApp[0] + ` (${topApp[1]} events)` : "N/A"}\n- Latest activity: ${data.latestEvent}\n\n**Recommendations:**\nReview the Event Log tab for a detailed breakdown of all authentication attempts. Look for any unusual patterns or spikes in activity that might indicate security concerns.`;
        break;
      }

      case "successRate": {
        const failureEvents = allEvents.filter(e => getEventStatus(e.description || "") === "failure");
        const failureTypes = new Map<string, number>();

        failureEvents.forEach((event) => {
          const auth = getAuthenticatorFromEvent(event);
          if (auth) {
            failureTypes.set(auth, (failureTypes.get(auth) || 0) + 1);
          }
        });

        const topFailure = Array.from(failureTypes.entries()).sort((a, b) => b[1] - a[1])[0];

        const analysis = data.successRate < 70 ? "⚠️ This is a concerning success rate that needs attention." : data.successRate < 90 ? "⚠️ This could be improved. There are some authentication issues." : "✓ This is a healthy success rate.";

        insights = `Success rate analysis: ${data.successRate}% (${data.successCount}/${data.totalCount} successful)\n\n${analysis}\n\n**Failure Analysis:**\n${failureEvents.length > 0 ? `- Total failures: ${failureEvents.length}\n- Most problematic authenticator: ${topFailure ? topFailure[0] + ` (${topFailure[1]} failures)` : "N/A"}\n\n**Recommendations:**\nReview failed attempts in the Event Log tab, particularly for "${topFailure?.[0]}" authenticator. Check for:\n- Invalid credentials\n- Lockout conditions\n- Configuration issues\n- User education needs` : "- No failures detected - authentication methods are working well."}`;
        break;
      }

      case "failedEvents": {
        const failureEvents = allEvents.filter(e => getEventStatus(e.description || "") === "failure");
        const failuresByAuth = new Map<string, number>();
        const recentFailures: Event[] = [];

        failureEvents.forEach((event) => {
          const auth = getAuthenticatorFromEvent(event);
          if (auth) {
            failuresByAuth.set(auth, (failuresByAuth.get(auth) || 0) + 1);
          }
          if (recentFailures.length < 3) {
            recentFailures.push(event);
          }
        });

        const sortedFailures = Array.from(failuresByAuth.entries()).sort((a, b) => b[1] - a[1]);

        if (data.failureCount > 0) {
          insights = `**Failed Authentication Events: ${data.failureCount}**\n\n**Failure Breakdown by Authenticator:**\n${sortedFailures.map(([auth, count]) => `- ${auth}: ${count} failures`).join("\n")}\n\n**Recent Failures:**\n${recentFailures.map((e, i) => `${i + 1}. ${e.description} (${e.date})`).join("\n")}\n\n**Recommendations:**\n- Investigate the authenticator with highest failures: "${sortedFailures[0]?.[0]}"\n- Check Event Log tab for detailed error messages\n- Consider resetting credentials if they've been compromised\n- Review user training and documentation\n- Check for system configuration or integration issues`;
        } else {
          insights = `✓ **No Authentication Failures Detected**\n\nAll authentication attempts for this user have been successful, indicating:\n- Strong credential practices\n- Proper authenticator configuration\n- Good user understanding of the authentication process\n\n**Recommendation:**\nContinue monitoring through the Event Log tab to maintain this security posture.`;
        }
        break;
      }

      case "activeAuthenticators": {
        const authCounts = new Map<string, number>();
        allEvents.forEach((event) => {
          const auth = getAuthenticatorFromEvent(event);
          if (auth) {
            authCounts.set(auth, (authCounts.get(auth) || 0) + 1);
          }
        });

        const sortedAuths = Array.from(authCounts.entries()).sort((a, b) => b[1] - a[1]);
        const avgUsagePerAuth = Math.round(data.totalCount / data.uniqueAuthenticators);

        insights = `**Active Authenticators: ${data.uniqueAuthenticators}**\n\n**Usage Distribution:**\n${sortedAuths.map(([auth, count]) => `- ${auth}: ${count} uses (${Math.round((count / data.totalCount) * 100)}%)`).join("\n")}\n\n**Analysis:**\n- Average events per authenticator: ${avgUsagePerAuth}\n- Most used: ${sortedAuths[0]?.[0]}\n- Least used: ${sortedAuths[sortedAuths.length - 1]?.[0]}\n\n**Recommendations:**\n- Consider removing underutilized authenticators (${sortedAuths[sortedAuths.length - 1]?.[0]})\n- Monitor primary authenticator (${sortedAuths[0]?.[0]}) for reliability\n- Check Event Log for details on specific authenticator performance\n- Consider policy adjustments if usage distribution is unbalanced`;
        break;
      }
    }

    return insights;
  };

  // Handle card review requests
  useEffect(() => {
    if (selectedCard && selectedCard.cardType) {
      // Restore the AI Assistant window if minimized
      if (isMinimized) {
        setShowAnimation(true);
        setIsMinimized(false);
        setHasNewContent(false);
        setTimeout(() => setShowAnimation(false), 300);
      }

      const cardMessage = generateCardInsights(selectedCard.cardType, selectedCard.data, events);

      // Add the card review message to the chat
      const userMessage: ChatMessage = {
        id: `card-review-user-${selectedCard.cardType}`,
        type: "user",
        content: `Review: ${selectedCard.cardType}`,
        timestamp: new Date(),
      };

      const assistantMessage: ChatMessage = {
        id: `card-review-assistant-${selectedCard.cardType}`,
        type: "assistant",
        content: cardMessage,
        timestamp: new Date(),
      };

      // Add a small delay to allow the window to restore first
      setTimeout(() => {
        setMessages((prev) => {
          // Check if this message already exists
          const exists = prev.some((msg) => msg.id === assistantMessage.id);
          if (!exists) {
            return [...prev, userMessage, assistantMessage];
          }
          return prev;
        });
      }, 350);
    }
  }, [selectedCard, events]);

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
          setShowAnimation(true);
          setIsMinimized(false);
          setHasNewContent(false); // Clear the highlight
          setTimeout(() => setShowAnimation(false), 300);
          // Focus input field after state update
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
        } else {
          // If already open, just focus the input field
          inputRef.current?.focus();
        }
      }

      // Handle Escape key
      if (event.key === "Escape" && !isMinimized) {
        event.preventDefault();
        setShowAnimation(true);
        setIsMinimized(true);
        setTimeout(() => setShowAnimation(false), 300);
        // Restore focus to the previous element
        setTimeout(() => {
          previousFocusRef.current?.focus();
        }, 50);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMinimized]);

  // Add transition classes for minimize/maximize animation
  const handleMinimize = () => {
    setShowAnimation(true);
    setIsMinimized(true);
    // Clear animation flag after animation completes
    setTimeout(() => setShowAnimation(false), 300);
  };

  const handleRestore = () => {
    // Clear pending bounce timeout FIRST
    if (bounceTimeoutRef.current) {
      clearTimeout(bounceTimeoutRef.current);
    }
    // Stop bounce animation immediately
    setShowBounce(false);
    setHasNewContent(false); // Clear the highlight when opening
    // Open the window
    setShowAnimation(true);
    setIsMinimized(false);
    // Clear animation flag after animation completes
    setTimeout(() => setShowAnimation(false), 300);
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
      <>
        <style>{glowStyle}</style>
        <button
          onClick={handleRestore}
          className={cn(
            "fixed bottom-6 z-40 h-14 w-14 rounded-full bg-[#041295] text-white hover:bg-[#041295]/90 transition-all duration-300 flex items-center justify-center",
            showBounce && "ai-assistant-bounce",
            showAnimation && "animate-[slide-up-in_0.3s_ease-out_forwards]"
          )}
          style={{ right: rightPosition }}
          title={hasNewContent ? "New recommendations available - Click to view" : "Open Recovery Assistant"}
        >
          <Brain className="h-6 w-6" />
        </button>
      </>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-40 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-bluegrey-200",
      showAnimation && "animate-[slide-up-in_0.3s_ease-out_forwards]"
    )}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#041295] to-[#041295]/90 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5" />
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Recovery Assistant</h2>
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
