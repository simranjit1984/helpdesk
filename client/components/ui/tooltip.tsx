import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const tooltipContentVariants = cva(
  "z-50 overflow-hidden rounded-sm shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  {
    variants: {
      variant: {
        default:
          "bg-popover text-popover-foreground border data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        dark: "bg-bluegrey-900 text-bluegrey-25",
      },
      size: {
        sm: "px-2 py-1.5 text-xs",
        md: "px-3 py-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipContentVariants> {
  title?: string;
  showArrow?: boolean;
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      sideOffset = 4,
      variant = "default",
      size = "sm",
      title,
      showArrow = true,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={cn(
            tooltipContentVariants({ variant, size }),
            title ? "flex flex-col gap-1" : "",
            variant === "dark" &&
              "shadow-[0_2px_2px_0_rgba(1,5,50,0.14),0_3px_4px_0_rgba(1,5,50,0.12),0_1px_5px_0_rgba(1,5,50,0.20)]",
            className,
          )}
          {...props}
        >
          {showArrow && (
            <TooltipPrimitive.Arrow
              className={cn(
                variant === "dark" ? "fill-bluegrey-900" : "fill-popover",
              )}
              width={8}
              height={8}
            />
          )}
          {title && (
            <div className="text-sm font-medium leading-5">{title}</div>
          )}
          <div className={title ? "text-xs leading-4" : ""}>{children}</div>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    );
  },
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
