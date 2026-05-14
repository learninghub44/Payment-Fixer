import { useState } from "react";
import { Menu, X, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/kuwesa-logo.png";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Leadership", href: "#leadership" },
  { label: "Announcements", href: "#announcements" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  window.addEventListener("scroll", () => {
    setScrolled(window.scrollY > 20);
  });

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${
      scrolled ? "bg-white shadow-lg border-b border-border/50" : "bg-gradient-to-b from-primary/10 to-transparent"
    }`}>
      <div className="container-custom px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group shrink-0">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-white shadow-md group-hover:scale-110 transition-transform ring-2 ring-accent/60">
            <img src={logo} alt="KUWESA" className="h-full w-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <div className="font-display font-bold text-primary text-sm leading-tight">KUWESA</div>
            <div className="text-[10px] text-muted-foreground">Kuria West Students</div>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons - Desktop */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <a href="/member/login">
            <Button variant="outline" size="sm" className="gap-1">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Member Login</span>
            </Button>
          </a>
          
          <a href="#membership">
            <Button variant="hero" size="sm">
              Register
            </Button>
          </a>

          <a href="/admin" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-xs">
              Admin
            </Button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="sm:hidden bg-white border-t border-border/50 shadow-lg animate-in slide-in-from-top">
          <div className="container-custom px-4 py-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
            
            <div className="pt-3 border-t border-border/50 space-y-2">
              <a href="/member/login" onClick={() => setOpen(false)} className="block">
                <Button variant="outline" size="sm" className="w-full gap-1">
                  <UserCircle className="h-4 w-4" />
                  Member Login
                </Button>
              </a>
              <a href="#membership" onClick={() => setOpen(false)} className="block">
                <Button variant="hero" size="sm" className="w-full">
                  Register
                </Button>
              </a>
              <a href="/admin" onClick={() => setOpen(false)} className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Admin
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
