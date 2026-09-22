import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-teal text-teal-fg hover:opacity-90",
        secondary:
          "bg-surface text-ink shadow-[var(--shadow-border)] hover:bg-teal-soft",
        ghost: "text-ink hover:bg-teal-soft",
        outline: "border border-line-strong bg-transparent text-ink hover:bg-surface",
        destructive: "bg-rust text-rust-fg hover:opacity-90",
        sage: "bg-sage text-sage-fg hover:opacity-90",
        link: "text-teal underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        default: "h-11 px-4 text-sm rounded-sm",
        sm: "h-9 px-3 text-sm rounded-sm",
        lg: "h-12 px-5 text-base rounded-md",
        icon: "size-11 rounded-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
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
