import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, MapPin, BookOpen, Star } from "lucide-react";
import logo from "@/assets/kuwesa-logo.png";
import s1 from "@/assets/students-1.png";
import s2 from "@/assets/students-2.png";
import s3 from "@/assets/students-3.png";

const SLIDES = [s1, s2, s3];
const WARDS = "Isebania · Nyamosense/Komosoko · Tagare · Bukira Central/Ikerege · Makerero · Bukira East · Masaba";

const STATS = [
  { n: 7,   suffix: "",  label: "Wards", icon: MapPin },
  { n: 5,   suffix: "",  label: "Programs",      icon: BookOpen },
  { n: 200, suffix: "+", label: "Students",      icon: Users },
  { n: 1,   suffix: "",  label: "Strong Family", icon: Star },
];

function useCounter(target: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(id); }
      else setVal(cur);
    }, 35);
    return () => clearInterval(id);
  }, [target, active]);
  return val;
}

function StatItem({ n, suffix, label, icon: Icon, active }: typeof STATS[0] & { active: boolean }) {
  const val = useCounter(n, active);
  return (
    <div className="stat-card">
      <Icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
      <div className="font-display text-3xl sm:text-4xl font-extrabold text-accent leading-none">{val}{suffix}</div>
      <div className="text-[11px] sm:text-xs text-white/70 mt-1 font-medium">{label}</div>
    </div>
  );
}

export const Hero = () => {
  const [index, setIndex] = useState(0);
  const [statsActive, setStatsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
      a: Math.random() * 0.45 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,215,80,${p.a})`; ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <section id="home" className="relative min-h-[88vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-20 pb-12 sm:pt-24 sm:pb-16">
      <div className="absolute inset-0">
        {SLIDES.map((src, i) => (
          <img key={src} src={src} alt="" aria-hidden
            className={`absolute inset-0 h-full w-full object-cover ease-out ${i === index ? "opacity-35 scale-105" : "opacity-0 scale-100"}`}
            style={{ transitionProperty: "opacity, transform", transitionDuration: "1500ms" }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/90 via-primary/75 to-primary-deep/95" />
      </div>
      <canvas ref={canvasRef} id="hero-particles" className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-primary-glow rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container-custom relative z-10 text-center px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-accent/40 text-white text-[11px] sm:text-xs font-medium mb-5 sm:mb-8 animate-fade-in badge-pulse">
          <Sparkles className="h-3.5 w-3.5 text-accent flex-shrink-0" />
          <span className="hidden sm:inline">{WARDS}</span>
          <span className="sm:hidden">7 Wards · One Constituency</span>
        </div>

        <div className="flex justify-center mb-5 sm:mb-8 animate-scale-in">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/50 blur-3xl rounded-full scale-125 animate-pulse" />
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 rounded-full overflow-hidden bg-white shadow-elegant ring-4 ring-accent/70 animate-float leader-ring">
              <img src={logo} alt="KUWESA logo" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white text-balance leading-[1.1] mb-3 sm:mb-4 animate-fade-in-up">
          Kuria West Students <br className="hidden sm:block" />
          <span className="text-gradient">Association</span>
        </h1>
        <p className="text-accent text-xs sm:text-base font-bold tracking-[0.35em] sm:tracking-[0.4em] uppercase mb-4 sm:mb-6 animate-fade-in-up cursor-blink" style={{ animationDelay: "0.1s" }}>
          KUWESA
        </p>
        <p className="text-base sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto text-balance mb-7 sm:mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Empowering Students. Building Leaders. Transforming Communities.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <a href="#membership">
            <Button variant="gold" size="xl" className="group shadow-glow">
              Join KUWESA <ArrowRight className="h-5 w-5 transition-bounce group-hover:translate-x-1" />
            </Button>
          </a>
          <a href="#about">
            <Button size="xl" className="bg-white/10 hover:bg-white/25 text-white border-2 border-white/40 backdrop-blur-md">
              Learn More
            </Button>
          </a>
        </div>

        <div ref={statsRef} className="mt-10 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 max-w-3xl mx-auto">
          {STATS.map((s) => <StatItem key={s.label} {...s} active={statsActive} />)}
        </div>

        <div className="flex justify-center gap-2 mt-8 sm:mt-10">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-accent" : "w-2 bg-white/35 hover:bg-white/55"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
