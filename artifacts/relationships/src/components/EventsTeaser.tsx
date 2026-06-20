import { Link } from "react-router-dom";
import { Camera, ArrowRight } from "lucide-react";

import g12 from "@/assets/gallery-12.webp";
import g19 from "@/assets/gallery-19.webp";
import g17 from "@/assets/gallery-17.webp";
import g14 from "@/assets/gallery-14.jpg";

const PREVIEW = [
  { src: g12, alt: "President Agrey Chacha addressing members" },
  { src: g19, alt: "Students celebrating KUWESA founding" },
  { src: g17, alt: "Members at the inaugural meeting" },
  { src: g14, alt: "Agrey Chacha at the podium" },
];

export const EventsTeaser = () => (
  <section id="events" className="py-16 md:py-20 bg-green-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/50 border border-green-800/50 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-3">
            <Camera className="h-3.5 w-3.5" /> Events & Gallery
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Our <span className="text-yellow-400">Moments</span>
          </h2>
          <p className="text-green-300/80 text-sm mt-1">
            Captured memories from the historic founding of KUWESA
          </p>
        </div>
        <Link
          to="/events"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-green-950 font-semibold text-sm transition-all shadow-lg hover:shadow-yellow-500/30 whitespace-nowrap group"
        >
          View All Photos
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 4-photo preview grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PREVIEW.map((photo, i) => (
          <Link
            key={i}
            to="/events"
            className="group relative aspect-square overflow-hidden rounded-2xl bg-green-900 block animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-green-950/0 group-hover:bg-green-950/30 transition-all duration-300" />
            {/* On last photo show "+16 more" overlay */}
            {i === 3 && (
              <div className="absolute inset-0 bg-green-950/70 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-yellow-400">+16</span>
                <span className="text-white/70 text-xs font-medium mt-1">more photos</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Mobile CTA */}
      <div className="mt-6 text-center sm:hidden">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold text-sm transition-all"
        >
          View All 20 Photos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

    </div>
  </section>
);
