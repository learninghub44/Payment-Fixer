import { Link } from "react-router-dom";
import logo from "@/assets/kuwesa-logo.png";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const EXPLORE = [
  ["#about", "About KUWESA"],
  ["#programs", "Programs"],
  ["#leadership", "Leadership"],
  ["#membership", "Join KUWESA"],
  ["#welfare", "Welfare Fund"],
  ["#announcements", "Announcements"],
];

const WARDS = ["Isebania", "Nyamosense/Komosoko", "Tagare", "Bukira Central", "Makerero", "Bukira East", "Masaba"];

export const Footer = () => (
  <footer className="bg-green-600 text-white">
    {/* Top accent bar */}
    <div className="h-1 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

        {/* Brand — spans 2 cols on lg */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-14 w-14 rounded-full overflow-hidden bg-white ring-2 ring-yellow-300 shadow-lg flex-shrink-0">
              <img src={logo} alt="KUWESA" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-black text-xl text-white tracking-tight">KUWESA</div>
              <div className="text-sm text-green-50 font-medium">Kuria West Students Association</div>
            </div>
          </div>

          <p className="text-green-50 text-sm leading-relaxed mb-5 max-w-sm">
            A united platform for students from all seven wards of Kuria West — empowering through mentorship,
            leadership, welfare support, and community service.
          </p>

          {/* Wards badges */}
          <div className="flex flex-wrap gap-1.5">
            {WARDS.map((w) => (
              <span key={w} className="px-2.5 py-1 rounded-full bg-green-700/60 text-green-50 text-[11px] font-medium border border-green-400/40">
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-bold mb-4 text-xs uppercase tracking-[0.15em] text-yellow-300">Explore</h4>
          <ul className="space-y-3">
            {EXPLORE.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-sm text-green-50 hover:text-yellow-300 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-0 group-hover:w-4 bg-yellow-300 transition-all duration-200 flex-shrink-0" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold mb-4 text-xs uppercase tracking-[0.15em] text-yellow-300">Contact Us</h4>
          <ul className="space-y-3.5">
            <li>
              <a href="tel:+254745523865" className="text-sm text-green-50 hover:text-yellow-300 transition-colors flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span>+254 745 523 865<br /><span className="text-green-100 text-xs">Agrey Chacha (President)</span></span>
              </a>
            </li>
            <li>
              <a href="tel:+254748207838" className="text-sm text-green-50 hover:text-yellow-300 transition-colors flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span>+254 748 207 838<br /><span className="text-green-100 text-xs">Sharon Otaigo (VP)</span></span>
              </a>
            </li>
            <li>
              <a href="mailto:kuwesa12@gmail.com" className="text-sm text-green-50 hover:text-yellow-300 transition-colors flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-yellow-300 flex-shrink-0" />
                kuwesa12@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-green-50">
              <MapPin className="h-4 w-4 text-yellow-300 flex-shrink-0" />
              Kuria West, Migori County
            </li>
            <li>
              <Link to="/admin" className="text-sm text-green-50 hover:text-yellow-300 transition-colors flex items-center gap-2.5">
                <ExternalLink className="h-4 w-4 text-green-100 flex-shrink-0" />
                Management Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-green-700/50 pt-8">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
          <p className="text-xs text-green-100 text-center sm:text-left">
            © {new Date().getFullYear()} Kuria West Students Association (KUWESA). All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-green-100">
            <Link to="/privacy" className="hover:text-yellow-300 transition-colors">Privacy Policy</Link>
            <span className="text-green-400">·</span>
            <Link to="/terms" className="hover:text-yellow-300 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
        <div className="mt-3 text-center text-[11px] text-green-200">
          Website powered by{" "}
          <a href="#" className="text-green-100 hover:text-yellow-300 transition-colors font-medium">
            Zetu Business Solutions
          </a>
        </div>
      </div>
    </div>
  </footer>
);
