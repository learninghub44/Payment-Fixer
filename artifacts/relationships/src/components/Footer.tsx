import { Link } from "react-router-dom";
import logo from "@/assets/kuwesa-logo.png";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

export const Footer = () => (
  <footer className="bg-primary-deep text-primary-foreground relative overflow-hidden">
    {/* Top wave */}
    <div className="wave-divider -mt-1">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height="60">
        <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="hsl(147 40% 96%)" />
      </svg>
    </div>

    {/* Decorative blobs */}
    <div className="absolute top-0 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

    <div className="container-custom py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        {/* Brand */}
        <div className="sm:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-white ring-2 ring-accent/60 shadow-md">
              <img src={logo} alt="KUWESA" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-display font-bold text-lg">KUWESA</div>
              <div className="text-xs text-white/60">Kuria West Students Association</div>
            </div>
          </div>
          <p className="text-white/65 text-sm max-w-xs leading-relaxed mb-4">Empowering Students. Building Leaders. Transforming Communities.</p>
          {/* Social proof row */}
          <div className="flex flex-wrap gap-2">
            {["Isebania","Nyamosense/Komosoko","Tagare","Bukira Central","Makerero"].map((w) => (
              <span key={w} className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[10px] font-medium">{w}</span>
            ))}
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-semibold">+2 more</span>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-accent">Explore</h4>
          <ul className="space-y-2 text-sm text-white/70">
            {[["#about","About"],["#programs","Programs"],["#leadership","Leadership"],["#membership","Join"],["#welfare","Welfare"]].map(([href, label]) => (
              <li key={href}><a href={href} className="hover:text-accent transition-smooth flex items-center gap-1.5 group"><span className="h-px w-0 group-hover:w-3 bg-accent transition-all" />{label}</a></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-accent">Contact</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li>
              <a href="tel:+254745523865" className="hover:text-accent transition-smooth flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-accent flex-shrink-0" /> +254 745 523 865
              </a>
            </li>
            <li>
              <a href="mailto:kuwesa12@gmail.com" className="hover:text-accent transition-smooth flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-accent flex-shrink-0" /> kuwesa12@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" /> Kuria West, Migori County
            </li>
            <li>
              <Link to="/admin" className="hover:text-accent transition-smooth flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border border-accent/50 flex-shrink-0" /> Management Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
        <div>© {new Date().getFullYear()} Kuria West Students Association (KUWESA). All rights reserved.</div>
        <div className="flex items-center gap-1 text-white/50">
          Made with <Heart className="h-3 w-3 text-red-400 fill-red-400 mx-0.5" /> for Kuria West students
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/10 text-center text-[11px] text-white/50">
        Website powered by{" "}
        <a href="#" className="text-accent font-semibold hover:underline">Zetu Business Solutions</a>
      </div>
    </div>
  </footer>
);
