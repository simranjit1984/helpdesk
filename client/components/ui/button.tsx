import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * UCL v11 Button
 * --button-border-radius: 0.125rem (2px)
 * Primary:  bg=#041295 → hover=#030F77 → pressed=#020B59
 * Danger:   bg=#E01E00 → hover=#B31800
 * Outline:  border=#041295, text=#041295 → hover bg=#E6E7F4
 * Ghost:    transparent → hover bg=bluegrey-50
 */
const buttonVariants = cva(
  // Base: UCL shared button styles
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // UCL Primary button: #041295 → #030F77 hover → #020B59 active
        default:
          "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",

        // UCL Danger button: #E01E00 → #B31800 hover
        destructive:
          "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",

        // UCL Outline button: transparent with primary border, text=primary
        outline:
          "border border-blue-500 bg-transparent text-blue-500 hover:bg-blue-50 active:bg-blue-100",

        // UCL Secondary / neutral button
        secondary:
          "bg-bluegrey-100 text-bluegrey-900 hover:bg-bluegrey-200 active:bg-bluegrey-300",

        // UCL Ghost: no border, subtle hover
        ghost:
          "bg-transparent text-bluegrey-700 hover:bg-bluegrey-50 active:bg-bluegrey-100",

        // UCL Link style
        link:
          "bg-transparent text-blue-500 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-8 px-3 text-xs",
        lg:      "h-12 px-6 text-base",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
