import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Camera, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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

const EVENTS = [
  {
    date: "May 2026",
    title: "KUWESA Inaugural Founding Meeting",
    venue: "Kuria West, Kenya",
    photos: [
      { src: g12, caption: "Founder President Agrey Chacha addressing members at the podium" },
      { src: g14, caption: "Agrey Chacha — Founder President of KUWESA" },
      { src: g19, caption: "Students celebrate the birth of KUWESA" },
      { src: g11, caption: "Leadership team during the founding event" },
      { src: g17, caption: "KUWESA members engaged during the inaugural meeting" },
      { src: g13, caption: "Wide view of the founding session hall" },
      { src: g20, caption: "Engaged members during the meeting" },
      { src: g15, caption: "Students listening attentively" },
      { src: g16, caption: "Members in focused discussion" },
      { src: g18, caption: "Students during the KUWESA launch" },
      { src: g1,  caption: "A student leader addresses the audience" },
      { src: g2,  caption: "A member in quiet reflection during the meeting" },
      { src: g3,  caption: "Female member paying close attention" },
      { src: g4,  caption: "Wide shot of the auditorium" },
      { src: g5,  caption: "Students seated in the auditorium" },
      { src: g6,  caption: "Leader addressing from the podium, wide view" },
      { src: g7,  caption: "Full view of the lecture hall" },
      { src: g8,  caption: "Members connecting during the event" },
      { src: g9,  caption: "Two members engaged during the session" },
      { src: g10, caption: "Member in white shirt and tie, attentive during the event" },
    ],
  },
];

export default function Events() {
  const [lightbox, setLightbox] = useState<{ eventIdx: number; photoIdx: number } | null>(null);

  const allPhotos = lightbox !== null ? EVENTS[lightbox.eventIdx].photos : [];

  const prev = useCallback(() => {
    if (!lightbox) return;
    setLightbox({ ...lightbox, photoIdx: (lightbox.photoIdx - 1 + allPhotos.length) % allPhotos.length });
  }, [lightbox, allPhotos.length]);

  const next = useCallback(() => {
    if (!lightbox) return;
    setLightbox({ ...lightbox, photoIdx: (lightbox.photoIdx + 1) % allPhotos.length });
  }, [lightbox, allPhotos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  return (
    <div className="min-h-screen bg-green-950">
      <Navbar />

      {/* Hero */}
      <div className="pt-24 pb-12 px-4 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/50 border border-green-800/50 text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-4">
          <Camera className="h-3.5 w-3.5" /> Photo Gallery
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
          KUWESA <span className="text-yellow-400">Events</span>
        </h1>
        <p className="text-green-300/80 max-w-xl mx-auto text-sm">
          Captured memories from our historic journey — founding meetings, student gatherings, and community moments.
        </p>
      </div>

      {/* Events */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {EVENTS.map((event, eIdx) => (
          <div key={eIdx} className="mb-16">
            {/* Event header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-green-900/60" />
              <div className="text-center">
                <div className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-1">{event.date}</div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{event.title}</h2>
                <div className="text-green-400/70 text-xs mt-1">📍 {event.venue} · {event.photos.length} photos</div>
              </div>
              <div className="h-px flex-1 bg-green-900/60" />
            </div>

            {/* Photo grid — masonry, respects each photo's natural aspect ratio */}
            <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2 sm:gap-3 [&>*]:mb-2 sm:[&>*]:mb-3">
              {event.photos.map((photo, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => setLightbox({ eventIdx: eIdx, photoIdx: pIdx })}
                  className="group relative block w-full overflow-hidden rounded-xl bg-green-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 break-inside-avoid animate-fade-in"
                  style={{ animationDelay: `${(pIdx % 15) * 50}ms` }}
                  aria-label={photo.caption}
                >
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading={pIdx < 10 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-green-950/0 group-hover:bg-green-950/50 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-sm rounded-full p-2">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  {/* Photo number */}
                  <div className="absolute bottom-2 right-2 bg-green-950/60 text-white text-[10px] px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {pIdx + 1}/{event.photos.length}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Footer />

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-green-950/97 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/10 text-white text-xs">
            {lightbox.photoIdx + 1} / {allPhotos.length}
          </div>

          {/* Prev */}
          <button
            className="absolute left-3 sm:left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Image */}
          <div
            className="max-w-5xl max-h-[85vh] mx-16 sm:mx-24 flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allPhotos[lightbox.photoIdx].src}
              alt={allPhotos[lightbox.photoIdx].caption}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
            <p className="text-white/70 text-sm text-center px-4">
              {allPhotos[lightbox.photoIdx].caption}
            </p>
          </div>

          {/* Next */}
          <button
            className="absolute right-3 sm:right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dot strip */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1 flex-wrap justify-center max-w-xs px-4">
            {allPhotos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox!, photoIdx: i }); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === lightbox.photoIdx ? "w-6 bg-yellow-400" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
