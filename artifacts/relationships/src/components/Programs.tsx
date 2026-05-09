import { GraduationCap, Scale, Megaphone, Heart, Home, Users, Shield, Lightbulb, Brain, Leaf } from "lucide-react";

const programs = [
  {
    icon: GraduationCap, color: "from-emerald-500 to-green-600",
    title: "Academic Mentorship",
    desc: "Guiding students on career choices, academic excellence, and higher education opportunities.",
  },
  {
    icon: Scale, color: "from-blue-500 to-sky-600",
    title: "Leadership, Accountability & Civic Awareness",
    desc: "Engaging leaders on student matters, promoting transparency, accountability, and active civic participation.",
  },
  {
    icon: Megaphone, color: "from-orange-400 to-amber-500",
    title: "Community Awareness & Advocacy",
    desc: "Creating awareness on GBV, FGM, early marriages, drug abuse, and school dropouts.",
  },
  {
    icon: Heart, color: "from-pink-400 to-rose-500",
    title: "Pad Drive & Girl Child Empowerment",
    desc: "Supporting vulnerable girls through pad distributions, mentorship, and menstrual hygiene education.",
  },
  {
    icon: Home, color: "from-purple-400 to-violet-600",
    title: "Orphanage & Charity Outreach",
    desc: "Visiting orphanages and vulnerable families through donations, counseling, and community support.",
  },
  {
    icon: Users, color: "from-teal-400 to-cyan-600",
    title: "Leadership & Empowerment Forums",
    desc: "Organizing seminars, workshops, and trainings to nurture responsible and visionary student leaders.",
  },
  {
    icon: Shield, color: "from-indigo-400 to-blue-600",
    title: "Student Welfare & Advocacy",
    desc: "Advocating for students' rights, wellbeing, and access to educational opportunities and support systems.",
  },
  {
    icon: Lightbulb, color: "from-yellow-400 to-amber-500",
    title: "Talent Development & Innovation",
    desc: "Supporting talents in sports, arts, music, entrepreneurship, technology, and innovation.",
  },
  {
    icon: Brain, color: "from-fuchsia-400 to-pink-600",
    title: "Guidance, Counseling & Mental Wellness",
    desc: "Offering mentorship, emotional support, and awareness on mental health and social wellbeing.",
  },
  {
    icon: Leaf, color: "from-green-400 to-emerald-600",
    title: "Community Service & Environmental Conservation",
    desc: "Tree planting, clean-up activities, and initiatives that promote a healthy and sustainable environment.",
  },
];

export const Programs = () => (
  <section id="programs" className="section-padding bg-background relative overflow-hidden">
    <span className="section-number">02</span>
    <div className="container-custom">
      <div className="text-center max-w-3xl mx-auto mb-14 reveal">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">What We Do</span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
          Our <span className="text-primary">10 Programmes</span>
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">Ten focused programmes built to grow every member academically, socially, and as a leader.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {programs.map((p, i) => (
          <article key={p.title}
            className={`group relative overflow-hidden bg-card rounded-2xl p-6 shadow-card hover:shadow-elegant transition-smooth border border-border/50 hover:-translate-y-2 card-shimmer reveal delay-${(i % 4 + 1) * 100}`}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/4 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-smooth" />
            <div className="relative">
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${p.color} text-white shadow-soft mb-4 group-hover:scale-110 group-hover:rotate-3 transition-bounce`}>
                <p.icon className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold text-muted-foreground/60 mb-1">PROGRAMME {String(i + 1).padStart(2, "0")}</div>
              <h3 className="font-display text-base font-bold text-foreground mb-2 leading-snug">{p.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{p.desc}</p>
            </div>
            <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${p.color} group-hover:w-full transition-all duration-500`} />
          </article>
        ))}
      </div>
    </div>
  </section>
);
