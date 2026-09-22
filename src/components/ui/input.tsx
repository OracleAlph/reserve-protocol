import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-sm border border-line bg-surface px-3 text-base text-ink shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 focus-visible:border-teal disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
