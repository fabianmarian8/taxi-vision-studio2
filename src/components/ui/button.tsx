import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-sm font-medium transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none border border-transparent",
  {
    variants: {
      variant: {
        // Bulma-style: default je čierne tlačidlo
        default: "bg-foreground text-card hover:bg-foreground/90 active:bg-foreground/80",
        // Primary - taxi žltá
        primary: "bg-[#ffd700] text-foreground hover:bg-[#e6c200] active:bg-[#ccab00]",
        // Link - modrá
        link: "bg-[#485fc7] text-white hover:bg-[#3e56b4] active:bg-[#3451a1]",
        // Info - cyan
        info: "bg-[#3e8ed0] text-white hover:bg-[#3082c5] active:bg-[#2776b9]",
        // Success - zelená
        success: "bg-[#48c78e] text-white hover:bg-[#3ec487] active:bg-[#34c17f]",
        // Warning - žltá
        warning: "bg-[#ffe08a] text-foreground hover:bg-[#ffd970] active:bg-[#ffd257]",
        // Danger - červená
        danger: "bg-[#f14668] text-white hover:bg-[#ef3a5d] active:bg-[#ee2d52]",
        // Destructive - alias pre danger (kompatibilita s shadcn/ui)
        destructive: "bg-[#f14668] text-white hover:bg-[#ef3a5d] active:bg-[#ee2d52]",
        // Outline varianta
        outline: "bg-transparent border-foreground/30 text-foreground hover:bg-foreground/5 active:bg-foreground/10",
        // Ghost - bez pozadia
        ghost: "bg-transparent text-foreground hover:bg-foreground/10 active:bg-foreground/15",
        // Secondary - sivá
        secondary: "bg-foreground/10 text-foreground hover:bg-foreground/15 active:bg-foreground/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
