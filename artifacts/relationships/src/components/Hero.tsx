import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import img1 from "@/assets/kuwesa-event-1.webp";
import img2 from "@/assets/kuwesa-event-2.webp";
import img3 from "@/assets/kuwesa-event-3.webp";
import img4 from "@/assets/kuwesa-event-4.webp";
import img5 from "@/assets/kuwesa-event-5.webp";

const HERO_IMAGES = [img1, img2, img3, img4, img5];

export const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % HERO_IMAGES.length);
    setAutoPlay(false);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
    setAutoPlay(false);
  };

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`KUWESA event ${idx + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              idx === current ? "opacity-100" : "opacity-0"
            }`}
            loading={idx === 0 ? "eager" : "lazy"}
          />
        ))}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
        <div className="max-w-4xl space-y-6 reveal-down">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black leading-tight text-balance">
            Kuria West <br /> <span className="text-primary">Students</span> <br /> Association
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto font-medium">
            Empowering students through education, leadership, and community service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <a href="#membership">
              <Button size="lg" variant="hero" className="gap-2">
                <Play className="h-4 w-4" />
                Join Now
              </Button>
            </a>
            <a href="#about">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Carousel Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-all backdrop-blur"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-all backdrop-blur"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrent(idx);
              setAutoPlay(false);
            }}
            className={`h-2 rounded-full transition-all ${
              idx === current ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="h-8 w-5 border-2 border-white rounded-full flex justify-center">
          <div className="h-2 w-1 bg-white rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
};
