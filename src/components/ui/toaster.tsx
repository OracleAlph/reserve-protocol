import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="light"
      toastOptions={{
        classNames: {
          toast: "bg-surface text-ink border-line shadow-[var(--shadow-border)]",
        },
      }}
    />
  );
}
