import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/kuwesa-logo.png";
import { cn } from "@/lib/utils";

const links = [
  { href: "#about", label: "About" },
  { href: "#programs", label: "Programs" },
  { href: "#leadership", label: "Leadership" },
  { href: "#membership", label: "Membership" },
  { href: "#welfare", label: "Welfare" },
  { href: "#contact", label: "Contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const location = useLocation();
  const onHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      // section spy
      if (!onHome) return;
      const offsets = links
        .map((l) => {
          const el = document.querySelector(l.href);
          if (!el) return null;
          const rect = (el as HTMLElement).getBoundingClientRect();
          return { href: l.href, top: rect.top };
        })
        .filter(Boolean) as { href: string; top: number }[];
      const cur = offsets.filter((o) => o.top <= 120).pop();
      setActive(cur?.href || "");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-smooth",
        scrolled
          ? "bg-background/90 backdrop-blur-xl shadow-soft border-b border-border/40"
          : "bg-transparent"
      )}
    >
      <nav className="container-custom flex items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent/30 blur-md opacity-0 group-hover:opacity-100 transition-smooth" />
            <div className="relative h-12 w-12 rounded-full overflow-hidden bg-white ring-2 ring-primary/30 shadow-soft transition-bounce group-hover:scale-105 group-hover:ring-accent">
              <img
                src={logo}
                alt="KUWESA logo"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="leading-tight">
            <div className={cn(
              "font-display font-bold text-base transition-smooth",
              scrolled ? "text-foreground" : "text-foreground"
            )}>
              KUWESA
            </div>
            <div className="text-[10px] text-muted-foreground hidden sm:block">
              Kuria West Students Association
            </div>
          </div>
        </Link>

        {onHome && (
          <ul className="hidden lg:flex items-center gap-1 bg-background/60 backdrop-blur-sm rounded-full px-2 py-1 border border-border/40">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-full transition-smooth inline-block",
                    active === l.href
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground/75 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Admin
            </Button>
          </Link>
          {onHome && (
            <a href="#membership">
              <Button variant="hero" size="sm">Join Now</Button>
            </a>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
          className="lg:hidden p-2 rounded-md text-foreground hover:bg-secondary transition-smooth"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-background/95 backdrop-blur-lg border-t border-border animate-fade-in">
          <div className="flex flex-col p-4 gap-2 max-h-[calc(100vh-80px)] overflow-y-auto">
            {onHome && (
              <div className="space-y-1 pb-4 border-b border-border">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-smooth font-medium"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            )}
            <Link to="/admin" onClick={() => setOpen(false)} className="w-full">
              <Button variant="outline" className="w-full gap-1.5 justify-center">
                <ShieldCheck className="h-4 w-4" /> Admin Portal
              </Button>
            </Link>
            {onHome && (
              <a href="#membership" onClick={() => setOpen(false)} className="w-full">
                <Button variant="hero" className="w-full">Join KUWESA Today</Button>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
