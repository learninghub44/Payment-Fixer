import { Target, Heart, Compass, Shield, Star, Users, Handshake, Award } from "lucide-react";

const WARDS = [
  "Isebania Ward","Nyamosense/Komosoko Ward","Tagare Ward",
  "Bukira Central/Ikerege Ward","Makerero Ward","Bukira East Ward","Masaba Ward",
];

const VALUES = [
  { icon: Users,    title: "Unity",                 desc: "Promoting togetherness and cooperation among all students of Kuria West." },
  { icon: Shield,   title: "Integrity",             desc: "Upholding honesty, transparency, accountability, and ethical leadership." },
  { icon: Star,     title: "Leadership",            desc: "Nurturing responsible, visionary, and transformative student leaders." },
  { icon: Award,    title: "Empowerment",           desc: "Supporting students through mentorship, education, networking, and growth opportunities." },
  { icon: Handshake,title: "Inclusivity",           desc: "Embracing all students regardless of background, ward, gender, or education level." },
  { icon: Target,   title: "Excellence",            desc: "Encouraging academic achievement, innovation, discipline, and personal development." },
  { icon: Heart,    title: "Service to Community",  desc: "Inspiring students to positively contribute to the growth of Kuria West and society." },
  { icon: Compass,  title: "Welfare & Support",     desc: "Advocating for the wellbeing, rights, and interests of all students." },
];

export const About = () => (
  <section id="about" className="section-padding bg-gradient-soft relative overflow-hidden">
    <span className="section-number">01</span>
    <div className="container-custom space-y-20">

      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto reveal">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">About Us</span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
          One association. <span className="text-primary">Seven wards.</span> Endless potential.
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
          Kuria West Students Association (KUWESA) is a registered student-led association that unites students from all wards of Kuria West Constituency —
          from junior institutions to higher learning — with the aim of promoting unity, students' welfare, leadership, mentorship, academic growth, and
          empowerment for the development of Kuria West.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {WARDS.map((w) => (
            <span key={w} className="px-3 py-1 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-medium">{w}</span>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="group relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 border border-primary/20 shadow-card hover:shadow-elegant transition-smooth reveal-left">
          <div className="absolute top-0 left-0 w-full h-1 rounded-t-3xl bg-gradient-primary" />
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-primary text-white shadow-soft mb-5">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-3">Our Mission</h3>
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
            To unite, empower, and uplift students of Kuria West Constituency through mentorship, leadership, academic support, networking,
            and advocacy for students' welfare, while nurturing responsible and transformative future leaders committed to community development.
          </p>
        </div>

        <div className="group relative bg-gradient-to-br from-accent/10 to-accent/20 rounded-3xl p-8 border border-accent/30 shadow-card hover:shadow-elegant transition-smooth reveal-right">
          <div className="absolute top-0 left-0 w-full h-1 rounded-t-3xl bg-gradient-to-r from-accent to-yellow-400" />
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-yellow-400 text-primary-deep shadow-soft mb-5">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-3">Our Vision</h3>
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
            To build a united, empowered, and academically excellent community of students and future leaders dedicated to transforming Kuria West
            through knowledge, integrity, innovation, and service to society.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div>
        <div className="text-center mb-10 reveal">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-3">Our Foundation</span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Core Values</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v, i) => (
            <div key={v.title}
              className={`group bg-card rounded-2xl p-5 shadow-card hover:shadow-elegant border border-border/50 hover:-translate-y-1 transition-smooth card-shimmer reveal delay-${(i % 4 + 1) * 100}`}
            >
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-primary text-white mb-3 group-hover:scale-110 transition-bounce">
                <v.icon className="h-5 w-5" />
              </div>
              <h4 className="font-display font-bold text-foreground text-sm mb-1">{v.title}</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  </section>
);
