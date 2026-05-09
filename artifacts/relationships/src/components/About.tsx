import { Target, Heart, Compass } from "lucide-react";

const pillars = [
  { icon: Target, title: "Our Mission", text: "To unite, mentor and empower students from Kuria West Constituency so they can lead with purpose, excel academically and uplift their communities — from junior institutions all the way to higher learning." },
  { icon: Heart,  title: "Our Values",  text: "Integrity, unity, hard work and service. We believe every student from Kuria West deserves opportunities that match their potential, regardless of ward or background." },
  { icon: Compass,title: "Our Vision", text: "A connected generation of Kuria West students leading change in education, business, sports and public service across all seven wards of the constituency." },
];

const WARDS = [
  "Isebania Ward",
  "Nyamosense/Komosoko Ward",
  "Tagare Ward",
  "Bukira Central/Ikerege Ward",
  "Makerero Ward",
  "Bukira East Ward",
  "Masaba Ward",
];

export const About = () => (
  <section id="about" className="section-padding bg-gradient-soft relative overflow-hidden">
    <span className="section-number">01</span>
    <div className="container-custom">
      <div className="text-center max-w-3xl mx-auto mb-14 reveal">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">About Us</span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
          One association. <span className="text-primary">Seven wards.</span> Endless potential.
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
          Kuria West Students Association (KUWESA) is a registered student-led association that unites students from all wards of Kuria West Constituency.
          We bring together students from junior institutions to higher learning institutions with the aim of promoting unity, students' welfare, leadership,
          mentorship, academic growth, and empowerment for the development of Kuria West.
        </p>
        {/* Ward chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {WARDS.map((w) => (
            <span key={w} className="px-3 py-1 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-medium">{w}</span>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {pillars.map((p, i) => (
          <div key={p.title}
            className={`group relative bg-gradient-card rounded-2xl p-7 shadow-card hover:shadow-elegant transition-smooth border border-border/50 hover:-translate-y-2 card-shimmer reveal delay-${(i+1)*100}`}
          >
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-primary opacity-0 group-hover:opacity-100 transition-smooth" />
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-primary text-primary-foreground shadow-soft mb-5 group-hover:scale-110 transition-bounce">
              <p.icon className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">{p.title}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
