import { useEffect, useState, useCallback } from "react";
import { Menu, X, UserCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/kuwesa-logo.png";

const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Welfare", href: "#welfare" },
  { label: "Leadership", href: "#leadership" },
  { label: "Announcements", href: "#announcements" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-green-500/40 group-hover:scale-110 transition-transform">
            <img src={logo} alt="KUWESA" className="h-full w-full object-cover" width="40" height="40" />
          </div>
          <div>
            <div className="font-bold text-green-700 text-sm leading-tight">KUWESA</div>
            <div className="text-[10px] text-gray-500 leading-tight">Kuria West Students</div>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors rounded-lg hover:bg-green-50">
              {item.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <a href="#welfare">
            <Button variant="outline" size="sm" className="gap-1 border-rose-200 text-rose-600 hover:bg-rose-50">
              <Heart className="h-3.5 w-3.5" /> Welfare
            </Button>
          </a>
          <a href="/member/login">
            <Button variant="outline" size="sm" className="gap-1">
              <UserCircle className="h-4 w-4" /> Login
            </Button>
          </a>
          <a href="#membership">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">Join</Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <a href="#membership">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs px-3">Join</Button>
          </a>
          <button onClick={() => setOpen((o) => !o)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100 shadow-lg ${
        open ? "max-h-screen" : "max-h-0"
      }`}>
        <div className="px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
              {item.label}
            </a>
          ))}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <a href="/member/login" onClick={() => setOpen(false)} className="block">
              <Button variant="outline" size="sm" className="w-full gap-1">
                <UserCircle className="h-4 w-4" /> Member Login
              </Button>
            </a>
            <a href="#membership" onClick={() => setOpen(false)} className="block">
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">Join KUWESA</Button>
            </a>
            <a href="/admin" onClick={() => setOpen(false)} className="block">
              <Button variant="ghost" size="sm" className="w-full text-xs text-gray-400">Admin</Button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
