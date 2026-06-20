import { useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn } from "lucide-react";

import g1  from "@/assets/gallery-1.jpg";
import g2  from "@/assets/gallery-2.webp";
import g3  from "@/assets/gallery-3.jpg";
import g4  from "@/assets/gallery-4.webp";
import g5  from "@/assets/gallery-5.webp";
import g6  from "@/assets/gallery-6.jpg";
import g7  from "@/assets/gallery-7.webp";
import g8  from "@/assets/gallery-8.webp";
import g9  from "@/assets/gallery-9.jpg";
import g10 from "@/assets/gallery-10.jpg";
import g11 from "@/assets/gallery-11.webp";
import g12 from "@/assets/gallery-12.webp";
import g13 from "@/assets/gallery-13.webp";
import g14 from "@/assets/gallery-14.jpg";
import g15 from "@/assets/gallery-15.webp";
import g16 from "@/assets/gallery-16.webp";
import g17 from "@/assets/gallery-17.webp";
import g18 from "@/assets/gallery-18.webp";
import g19 from "@/assets/gallery-19.webp";
import g20 from "@/assets/gallery-20.webp";

const PHOTOS = [
  { src: g12, caption: "Founder President Agrey Chacha addressing members at the podium" },
  { src: g19, caption: "Students celebrate the birth of KUWESA with raised fists" },
  { src: g17, caption: "KUWESA members engaged during the inaugural meeting" },
  { src: g13, caption: "Wide view of the founding session hall" },
  { src: g20, caption: "Engaged members during the meeting" },
  { src: g15, caption: "Students listening attentively to the leadership address" },
  { src: g11, caption: "Leadership team during the founding event" },
  { src: g16, caption: "Members in focused discussion" },
  { src: g18, caption: "Students during the KUWESA launch" },
  { src: g14, caption: "Agrey Chacha — Founder President of KUWESA" },
  { src: g1,  caption: "A student leader addresses the audience at the podium" },
  { src: g2,  caption: "A member in quiet reflection during the meeting" },
  { src: g3,  caption: "Female member paying close attention to the proceedings" },
  { src: g4,  caption: "Wide shot of the auditorium during the founding session" },
  { src: g5,  caption: "Students seated in the auditorium" },
  { src: g6,  caption: "Leader addressing from the podium, wide view" },
  { src: g7,  caption: "Full view of the lecture hall" },
  { src: g8,  caption: "Members chatting and connecting during the event" },
  { src: g9,  caption: "Two male members engaged during the session" },
  { src: g10, caption: "Member in white shirt and tie, attentive during the event" },
];

export const Gallery = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? PHOTOS : PHOTOS.slice(0, 12);

  const prev = useCallback(() => {
    setLightbox((i) => (i !== null ? (i - 1 + PHOTOS.length) % PHOTOS.length : null));
  }, []);

  const next = useCallback(() => {
    setLightbox((i) => (i !== null ? (i + 1) % PHOTOS.length : null));
  }, []);

  return (
    <section id="gallery" className="py-16 md:py-24 bg-green-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/50 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-4 border border-green-800/50">
            <Camera className="h-3.5 w-3.5" /> Photo Gallery
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Our <span className="text-yellow-400">Moments</span>
          </h2>
          <p className="text-green-300/80 text-base max-w-xl mx-auto">
            Captured memories from the historic founding of KUWESA — Kuria West Students Association
          </p>
        </div>

        {/* Grid */}
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 sm:gap-3 [&>*]:mb-2 sm:[&>*]:mb-3">
          {visible.map((photo, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="group relative block w-full overflow-hidden rounded-xl bg-green-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 break-inside-avoid animate-fade-in"
              style={{ animationDelay: `${(i % 12) * 60}ms` }}
              aria-label={photo.caption}
            >
              <img
                src={photo.src}
                alt={photo.caption}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-green-950/0 group-hover:bg-green-950/50 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
              </div>
            </button>
          ))}
        </div>

        {/* Show more / less */}
        {PHOTOS.length > 12 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="px-8 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-green-950 font-semibold text-sm transition-all shadow-lg hover:shadow-yellow-500/30"
            >
              {showAll ? "Show Less ↑" : `View All ${PHOTOS.length} Photos ↓`}
            </button>
          </div>
        )}

        {/* Count badge */}
        <div className="flex justify-center mt-6">
          <span className="text-xs text-green-400">
            Showing {visible.length} of {PHOTOS.length} photos
          </span>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-green-950/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev */}
          <button
            className="absolute left-3 sm:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Image */}
          <div
            className="max-w-4xl max-h-[85vh] mx-12 sm:mx-20 flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={PHOTOS[lightbox].src}
              alt={PHOTOS[lightbox].caption}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            <p className="text-white/70 text-sm text-center px-4">
              {PHOTOS[lightbox].caption}
            </p>
            <p className="text-yellow-400/70 text-xs">
              {lightbox + 1} / {PHOTOS.length}
            </p>
          </div>

          {/* Next */}
          <button
            className="absolute right-3 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </section>
  );
};
