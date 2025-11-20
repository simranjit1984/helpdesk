import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";

export type InsightType = "info" | "warning" | "error" | "success" | "tip";
export type InsightSeverity = "low" | "medium" | "high";

export interface InsightAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

interface InsightCardProps {
  type: InsightType;
  severity?: InsightSeverity;
  title: string;
  description: string;
  actions?: InsightAction[];
  icon?: React.ReactNode;
}

export const InsightCard = ({
  type,
  severity = "medium",
  title,
  description,
  actions,
  icon,
}: InsightCardProps) => {
  const typeStyles = {
    info: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-200",
    error: "bg-red-50 border-red-200",
    success: "bg-green-50 border-green-200",
    tip: "bg-purple-50 border-purple-200",
  };

  const iconStyles = {
    info: "text-blue-600",
    warning: "text-yellow-600",
    error: "text-red-600",
    success: "text-green-600",
    tip: "text-purple-600",
  };

  const defaultIcon = {
    info: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    tip: <Lightbulb className="h-5 w-5" />,
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-2",
        typeStyles[type]
      )}
    >
      {/* Header with title and actions */}
      <div className="flex items-start gap-2">
        <div className={cn("flex-shrink-0 mt-0.5", iconStyles[type])}>
          {icon || defaultIcon[type]}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-semibold text-xs text-bluegrey-900 leading-tight">
              {title}
            </h3>
            {actions && actions.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={cn(
                      "text-xs font-medium transition-colors whitespace-nowrap",
                      action.variant === "primary"
                        ? "text-[#041295] hover:text-[#041295]/70 underline"
                        : "text-[#041295] hover:text-[#041295]/70 underline"
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-bluegrey-700 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
