import { Target, Heart, Compass } from "lucide-react";

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    text: "To unite, mentor and empower students from Kuria West so they can lead with purpose, excel academically and uplift their communities.",
  },
  {
    icon: Heart,
    title: "Our Values",
    text: "Integrity, unity, hard work and service. We believe every student deserves opportunities that match their potential.",
  },
  {
    icon: Compass,
    title: "Our Vision",
    text: "A connected generation of Kuria West students leading change in education, business, sports and public service.",
  },
];

export const About = () => {
  return (
    <section id="about" className="section-padding bg-gradient-soft">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            About Us
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            One association. <span className="text-primary">Seven wards.</span> Endless potential.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Kuria West Students Association (KUWESA) is a youth-driven movement bringing together students from all
            seven wards of Kuria West — Bwirege, Bukira East, Bukira Central, Bukira West, Tagare, Nyamosense/Komotobo
            and Kehancha. We exist to mentor, build skills, create opportunities and celebrate the talent rising from
            our region.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className="group relative bg-gradient-card rounded-2xl p-7 shadow-card hover:shadow-elegant transition-smooth border border-border/50 hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
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
};
