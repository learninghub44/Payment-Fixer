import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/kuwesa-logo.png";
import s1 from "@/assets/students-1.png";
import s2 from "@/assets/students-2.png";
import s3 from "@/assets/students-3.png";

const SLIDES = [s1, s2, s3];
const WARDS =
  "Bwirege · Bukira East · Bukira Central · Bukira West · Tagare · Nyamosense/Komotobo · Kehancha";

export const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-[88vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-20 pb-12 sm:pt-24 sm:pb-16"
    >
      {/* Cross-fade carousel */}
      <div className="absolute inset-0">
        {SLIDES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden
            className={`absolute inset-0 h-full w-full object-cover ease-out ${
              i === index ? "opacity-40 scale-105" : "opacity-0 scale-100"
            }`}
            style={{ transitionProperty: "opacity, transform", transitionDuration: "1500ms" }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/85 via-primary/70 to-primary-deep/95" />
      </div>

      {/* Decorative blobs */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary-glow rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="container-custom relative z-10 text-center px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-accent/40 text-white text-[11px] sm:text-xs font-medium mb-5 sm:mb-8 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-accent flex-shrink-0" />
          <span className="hidden sm:inline">{WARDS}</span>
          <span className="sm:hidden">7 Wards · One Family</span>
        </div>

        <div className="flex justify-center mb-5 sm:mb-8 animate-scale-in">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/40 blur-2xl rounded-full scale-110" />
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 rounded-full overflow-hidden bg-white shadow-elegant ring-4 ring-accent/60 animate-float">
              <img
                src={logo}
                alt="KUWESA — Kuria West Students Association logo"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white text-balance leading-[1.1] mb-3 sm:mb-4 animate-fade-in-up">
          Kuria West Students <br className="hidden sm:block" />
          <span className="text-accent">Association</span>
        </h1>
        <p
          className="text-accent text-xs sm:text-base font-bold tracking-[0.35em] sm:tracking-[0.4em] uppercase mb-4 sm:mb-6 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          KUWESA
        </p>

        <p
          className="text-base sm:text-xl md:text-2xl text-white/95 max-w-3xl mx-auto text-balance mb-7 sm:mb-10 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Empowering Students. Building Leaders. Transforming Communities.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <a href="#membership">
            <Button variant="gold" size="xl" className="group">
              Join KUWESA
              <ArrowRight className="h-5 w-5 transition-bounce group-hover:translate-x-1" />
            </Button>
          </a>
          <a href="#about">
            <Button
              size="xl"
              className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/40 backdrop-blur-md"
            >
              Learn More
            </Button>
          </a>
        </div>

        <div
          className="mt-10 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { n: "7", l: "Wards United" },
            { n: "5", l: "Programs" },
            { n: "200+", l: "Students" },
            { n: "1", l: "Strong Family" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-2xl sm:text-4xl font-bold text-accent">{s.n}</div>
              <div className="text-[11px] sm:text-sm text-white/80 mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Carousel dots */}
        <div className="flex justify-center gap-2 mt-8 sm:mt-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-accent" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
