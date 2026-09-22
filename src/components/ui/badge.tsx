import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent bg-teal text-teal-fg",
        secondary: "border-transparent bg-teal-soft text-teal",
        outline: "border-line text-ink-muted",
        rust: "border-transparent bg-rust-soft text-rust",
        sage: "border-transparent bg-sage-soft text-sage",
        amber: "border-transparent bg-amber-soft text-amber",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
