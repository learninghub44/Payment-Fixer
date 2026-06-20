import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import img1 from "@/assets/IMG_7180.jpg";
import img2 from "@/assets/IMG_7181.jpg";
import img3 from "@/assets/IMG_7182.jpg";
import img4 from "@/assets/IMG_7185.jpg";
import img5 from "@/assets/IMG_7186.jpg";
import img6 from "@/assets/IMG_7187.jpg";
import img7 from "@/assets/IMG_7188.jpg";
import img8 from "@/assets/IMG_7189.jpg";
import img9 from "@/assets/IMG_7190.jpg";
import img10 from "@/assets/IMG_7191.webp";
import img11 from "@/assets/IMG_7194.webp";
import img12 from "@/assets/IMG_7202.webp";
import img13 from "@/assets/IMG_7205.webp";
import img14 from "@/assets/IMG_7209.webp";
import img15 from "@/assets/IMG_7213.webp";
import img16 from "@/assets/IMG_7215.webp";
import img17 from "@/assets/IMG_7216.webp";
import img18 from "@/assets/IMG_7220.webp";
import img19 from "@/assets/IMG_7272.webp";
import img20 from "@/assets/IMG_7274.webp";
import img21 from "@/assets/IMG_7275.webp";
import img22 from "@/assets/IMG_7277.webp";

const EVENTS_IMAGES = [
  img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
  img11, img12, img13, img14, img15, img16, img17, img18, img19, img20,
  img21, img22,
];

export const Events = () => {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % EVENTS_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % EVENTS_IMAGES.length);
    setAutoPlay(false);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + EVENTS_IMAGES.length) % EVENTS_IMAGES.length);
    setAutoPlay(false);
  };

  return (
    <section id="events" className="section-padding bg-white">
      <span className="section-number">05</span>

      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12 reveal">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
            Gallery
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            KUWESA <span className="text-primary">Events</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Memorable moments from our community events, workshops, and gatherings
          </p>
        </div>

        {/* Image Carousel */}
        <div className="relative h-96 sm:h-[500px] md:h-[600px] rounded-2xl overflow-hidden bg-green-100 shadow-lg">
          {/* Images */}
          {EVENTS_IMAGES.map((img, idx) => (
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

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

          {/* Navigation Buttons */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 text-foreground hover:bg-white transition-all backdrop-blur"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 text-foreground hover:bg-white transition-all backdrop-blur"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 flex-wrap justify-center max-w-xs">
            {EVENTS_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrent(idx);
                  setAutoPlay(false);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === current ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>

          {/* Photo counter */}
          <div className="absolute top-6 right-6 z-20 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur">
            {current + 1} / {EVENTS_IMAGES.length}
          </div>
        </div>

        {/* Gallery Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 rounded-lg bg-primary/5">
            <div className="text-3xl font-bold text-primary mb-2">{EVENTS_IMAGES.length}</div>
            <div className="text-muted-foreground">Event Photos</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-primary/5">
            <div className="text-3xl font-bold text-primary mb-2">∞</div>
            <div className="text-muted-foreground">Memories Made</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-primary/5">
            <div className="text-3xl font-bold text-primary mb-2">1</div>
            <div className="text-muted-foreground">Community</div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            These moments capture the essence of KUWESA - our passion for education, community service, and youth empowerment. From workshops and seminars to community events and celebrations, each photo tells a story of dedication, unity, and progress. Join us in our journey to transform lives and build a brighter future for our members and communities.
          </p>
        </div>
      </div>
    </section>
  );
};
