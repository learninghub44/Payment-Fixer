import { useEffect, useState } from "react";
import { ChevronRight, Play, Users, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

import event1 from "@/assets/kuwesa-event-1.webp";
import event2 from "@/assets/kuwesa-event-2.webp";
import event3 from "@/assets/kuwesa-event-3.webp";
import event4 from "@/assets/kuwesa-event-4.webp";
import event5 from "@/assets/kuwesa-event-5.webp";
import event6 from "@/assets/kuwesa-event-6.webp";
import event8 from "@/assets/kuwesa-event-8.webp";
import event9 from "@/assets/kuwesa-event-9.webp";
import event10 from "@/assets/kuwesa-event-10.webp";

import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Leadership } from "@/components/Leadership";
import { Announcements } from "@/components/Announcements";
import { Membership } from "@/components/Membership";
import { WelfareSection } from "@/components/WelfareSection";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const HERO_IMAGES = [event1, event2, event3, event4, event5, event6, event8, event9, event10];

export default function IndexPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay]);

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setAutoplay(false);
  };

  return (
    <>
      {/* Hero with Image Carousel */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images */}
        {HERO_IMAGES.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`KUWESA Event ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Content */}
        <div className="relative z-20 container-custom text-center text-white">
          <div className="max-w-3xl mx-auto reveal-up">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Kuria West <span className="text-primary">Student</span> Association
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-100">
              Empowering students through unity, education, and leadership
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#membership">
                <Button size="lg" variant="hero" className="gap-2">
                  Join Now <ChevronRight className="h-5 w-5" />
                </Button>
              </a>
              <a href="#about">
                <Button size="lg" variant="outline" className="gap-2">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Image Carousel Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`h-3 rounded-full transition-all ${
                index === currentImageIndex ? "w-8 bg-primary" : "w-3 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>

        {/* Autoplay Toggle */}
        <button
          onClick={() => setAutoplay(!autoplay)}
          className="absolute bottom-8 right-8 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
          aria-label="Toggle autoplay"
        >
          <Play className="h-5 w-5" />
        </button>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-white py-12">
        <div className="container-custom">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div className="reveal">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <div className="font-display text-3xl font-bold">1000+</div>
              <p className="text-sm text-primary-foreground/80">Active Members</p>
            </div>
            <div className="reveal delay-100">
              <Award className="h-8 w-8 mx-auto mb-2" />
              <div className="font-display text-3xl font-bold">7</div>
              <p className="text-sm text-primary-foreground/80">Wards Represented</p>
            </div>
            <div className="reveal delay-200">
              <Zap className="h-8 w-8 mx-auto mb-2" />
              <div className="font-display text-3xl font-bold">2025</div>
              <p className="text-sm text-primary-foreground/80">Year Founded</p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Sections */}
      <Hero />
      <About />
      <Leadership />
      <Announcements />
      <Membership />
      <WelfareSection />
      <Contact />
      <Footer />
    </>
  );
}
