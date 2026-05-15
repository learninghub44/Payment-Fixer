import { Link } from "react-router-dom";
import logo from "@/assets/kuwesa-logo.png";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

export const Footer = () => (
  <footer className="bg-green-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">

        {/* Brand */}
        <div className="sm:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-white ring-2 ring-yellow-400/60 shadow-md flex-shrink-0">
              <img src={logo} alt="KUWESA" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-lg text-white">KUWESA</div>
              <div className="text-xs text-green-300">Kuria West Students Association</div>
            </div>
          </div>
          <p className="text-green-200 text-sm max-w-xs leading-relaxed mb-4">
            Empowering Students. Building Leaders. Transforming Communities.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Isebania","Nyamosense","Tagare","Bukira","Makerero","Bukira East","Masaba"].map((w) => (
              <span key={w} className="px-2 py-0.5 rounded-full bg-white/10 text-green-200 text-[10px] font-medium">
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-yellow-400">Explore</h4>
          <ul className="space-y-2.5 text-sm text-green-200">
            {[["#about","About"],["#programs","Programs"],["#leadership","Leadership"],["#membership","Join KUWESA"],["#welfare","Welfare Fund"],["#announcements","Announcements"]].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                  <span className="h-px w-3 bg-yellow-400/50" />{label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-yellow-400">Contact</h4>
          <ul className="space-y-3 text-sm text-green-200">
            <li>
              <a href="tel:+254745523865" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                <Phone className="h-4 w-4 text-yellow-400 flex-shrink-0" /> +254 745 523 865
              </a>
            </li>
            <li>
              <a href="tel:+254748207838" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                <Phone className="h-4 w-4 text-yellow-400 flex-shrink-0" /> +254 748 207 838
              </a>
            </li>
            <li>
              <a href="mailto:kuwesa12@gmail.com" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                <Mail className="h-4 w-4 text-yellow-400 flex-shrink-0" /> kuwesa12@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-yellow-400 flex-shrink-0" /> Kuria West, Migori County
            </li>
            <li>
              <Link to="/admin" className="hover:text-yellow-400 transition-colors flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border border-yellow-400/40 flex-shrink-0" /> Management Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-green-300">
        <div>© {new Date().getFullYear()} Kuria West Students Association (KUWESA). All rights reserved.</div>
        <div className="flex items-center gap-1">
          Made with <Heart className="h-3 w-3 text-red-400 fill-red-400 mx-1" /> for Kuria West students
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/10 text-center text-[11px] text-green-400">
        Website powered by{" "}
        <a href="#" className="text-yellow-400 font-semibold hover:underline">Zetu Business Solutions</a>
      </div>
    </div>
  </footer>
);
