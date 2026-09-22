import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { STATUS_LINE } from "@/lib/protocol/content";
import { useProtocolStore } from "@/lib/protocol/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/visit", label: "Clinic" },
  { to: "/loaded", label: "Loaded" },
  { to: "/panel", label: "Panel" },
  { to: "/series", label: "Series" },
  { to: "/protocol", label: "Protocol" },
  { to: "/effect", label: "Effect" },
  { to: "/compute", label: "Compute" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const finish = () => {
      const s = useProtocolStore.getState();
      s.ensureSeed();
      s.setHydrated();
    };
    const result = useProtocolStore.persist.rehydrate();
    if (result && typeof result.then === "function") {
      void result.then(finish, finish);
    } else {
      finish();
    }
  }, []);

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-dvh bg-bg text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-teal focus:px-3 focus:py-2 focus:text-teal-fg"
        >
          Skip to content
        </a>
        <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/92 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <Link to="/" className="min-w-0 shrink-0">
              <div className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-teal">
                Functional reserve
              </div>
              <div className="font-display text-lg leading-none tracking-tight text-ink sm:text-xl">
                Reserve Protocol
              </div>
            </Link>
            <nav className="ml-auto hidden items-center gap-0.5 xl:flex">
              {NAV.map((item) => {
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "rounded-sm px-2.5 py-2 text-sm font-medium transition-colors duration-150",
                      active ? "bg-teal text-teal-fg" : "text-ink-muted hover:bg-teal-soft hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="ml-auto xl:hidden">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Reserve Protocol · Functional Reserve</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col gap-1">
                    {NAV.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-sm px-3 py-3 text-base font-medium text-ink hover:bg-teal-soft"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
          {children}
        </main>
        <footer className="no-print border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
            <p>{STATUS_LINE}</p>
            <p>O’Leary, 2026 · Life 16(9):1457 · measurement specification</p>
          </div>
        </footer>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
