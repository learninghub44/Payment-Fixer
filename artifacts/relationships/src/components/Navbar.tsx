import { useState } from "react";
import { Menu, X, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/kuwesa-logo.png";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Announcements", href: "#announcements" },
  { label: "Leadership", href: "#leadership" },
  { label: "Membership", href: "#membership" },
  { label: "Welfare", href: "#welfare" },
  { label: "Contact", href: "#contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
      navigate("/admin");
    } catch {}
  };

  window.addEventListener("scroll", () => {
    setScrolled(window.scrollY > 20);
  });

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${
      scrolled ? "bg-white shadow-lg" : "bg-gradient-to-b from-primary/10 to-transparent"
    }`}>
      <div className="container-custom px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-white shadow-md group-hover:scale-110 transition-bounce ring-2 ring-accent/60">
            <img src={logo} alt="KUWESA" className="h-full w-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <div className="font-display font-bold text-primary text-sm">KUWESA</div>
            <div className="text-[10px] text-muted-foreground">Kuria West Students</div>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
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

        {/* CTA + Admin buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="/member/login" className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-2">
              <UserCircle className="h-4 w-4" />
              Member Login
            </Button>
          </a>
          
          <a href="#membership" className="hidden sm:block">
            <Button variant="hero" size="sm">
              Register
            </Button>
          </a>
          
          <a href="/admin" className="hidden sm:block">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-border/50 shadow-lg">
          <div className="container-custom px-4 py-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2 border-t border-border/50 space-y-2">
              <a href="/member/login" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <UserCircle className="h-4 w-4" />
                  Member Login
                </Button>
              </a>
              <a href="#membership" onClick={() => setOpen(false)}>
                <Button variant="hero" size="sm" className="w-full">
                  Register
                </Button>
              </a>
              <a href="/admin" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Admin Login
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
