import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import logo from "@/assets/kuwesa-logo.png";
import img1 from "@/assets/kuwesa-event-1.webp";
import img2 from "@/assets/kuwesa-event-2.webp";
import img3 from "@/assets/kuwesa-event-3.webp";
import img4 from "@/assets/kuwesa-event-4.webp";
import img5 from "@/assets/kuwesa-event-5.webp";
import img6 from "@/assets/kuwesa-event-6.webp";
import img7 from "@/assets/kuwesa-event-7.jpg";
import img8 from "@/assets/kuwesa-event-8.webp";
import img9 from "@/assets/kuwesa-event-9.webp";
import img10 from "@/assets/kuwesa-event-10.webp";

const SLIDES = [
  { src: img3, caption: "Founder President Agrey Chacha addressing members" },
  { src: img2, caption: "KUWESA students during the inaugural meeting" },
  { src: img8, caption: "Youth celebrating the birth of KUWESA" },
  { src: img4, caption: "Students gathered for the KUWESA launch" },
  { src: img5, caption: "Engaged members at the KUWESA launch event" },
  { src: img9, caption: "President speaking passionately to students" },
  { src: img1, caption: "Leadership team during the founding event" },
  { src: img6, caption: "Students listening attentively" },
  { src: img7, caption: "Members at the KUWESA founding meeting" },
  { src: img10, caption: "Agrey Chacha — Founder President of KUWESA" },
];

export const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((p) => (p + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <section
      id="home"
      className="relative min-h-[100vh] sm:min-h-[110vh] w-full overflow-hidden bg-green-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slideshow */}
      {SLIDES.map(({ src, caption }, i) => (
        <img
          key={i}
          src={src}
          alt={caption}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[100vh] sm:min-h-[110vh] flex-col items-center justify-center text-center px-4 pt-20 pb-16">
        {/* Logo */}
        <div className="mb-6">
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-white shadow-2xl ring-4 ring-yellow-400/70 mx-auto">
            <img src={logo} alt="KUWESA Logo" className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 max-w-4xl">
          Kuria West <span className="text-green-400">Students</span> Association
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mb-3 font-semibold tracking-widest uppercase">
          KUWESA
        </p>
        <p className="text-base sm:text-lg text-white/75 max-w-2xl mb-8">
          Empowering Students · Building Leaders · Transforming Communities
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <a href="#membership"
            className="px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-base transition-all shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5">
            Join KUWESA →
          </a>
          <a href="#about"
            className="px-8 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-base border border-white/30 backdrop-blur-sm transition-all">
            Learn More
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl w-full">
          {[
            { n: "7", label: "Wards" },
            { n: "200+", label: "Members" },
            { n: "5", label: "Programs" },
            { n: "1", label: "Family" },
          ].map(({ n, label }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-2xl sm:text-3xl font-black text-yellow-400">{n}</div>
              <div className="text-xs text-white/70 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm transition-all"
        aria-label="Previous">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm transition-all"
        aria-label="Next">
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 flex-wrap justify-center px-4">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => { setCurrent(i); setPaused(true); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-yellow-400" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </section>
  );
};
