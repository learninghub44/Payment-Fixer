import { Link } from "react-router-dom";
import logo from "@/assets/kuwesa-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-primary-deep text-primary-foreground">
      <div className="container-custom py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-white ring-2 ring-accent/60 shadow-md">
                <img src={logo} alt="KUWESA" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="font-display font-bold text-lg">KUWESA</div>
                <div className="text-xs text-white/70">Kuria West Students Association</div>
              </div>
            </div>
            <p className="text-white/70 text-sm max-w-md leading-relaxed">
              Empowering Students. Building Leaders. Transforming Communities.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-accent">Explore</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#about" className="hover:text-accent transition-smooth">About</a></li>
              <li><a href="#programs" className="hover:text-accent transition-smooth">Programs</a></li>
              <li><a href="#leadership" className="hover:text-accent transition-smooth">Leadership</a></li>
              <li><a href="#membership" className="hover:text-accent transition-smooth">Join</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-accent">Contact</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="tel:+254745523865" className="hover:text-accent transition-smooth">+254 745 523 865</a></li>
              <li><a href="mailto:kuwesa12@gmail.com" className="hover:text-accent transition-smooth break-all">kuwesa12@gmail.com</a></li>
              <li><Link to="/admin" className="hover:text-accent transition-smooth">Admin Panel</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <div>© {new Date().getFullYear()} Kuria West Students Association (KUWESA). All rights reserved.</div>
          <div className="text-white/70">
            7 wards · 1 family
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-center text-[11px] text-white/60">
          Website powered by{" "}
          <a
            href="#"
            className="text-accent font-semibold hover:underline"
            aria-label="Zetu Business Solutions"
          >
            Zetu Business Solutions
          </a>
        </div>
      </div>
    </footer>
  );
};
