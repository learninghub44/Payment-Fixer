import { GraduationCap, Sparkles, Trophy, Briefcase, Rocket } from "lucide-react";

const programs = [
  { icon: GraduationCap, title: "Mentorship",        desc: "One-on-one and group mentorship pairing students with professionals from our region.", color: "from-emerald-500 to-green-600" },
  { icon: Sparkles,      title: "Capacity Building", desc: "Workshops, trainings and bootcamps in leadership, tech, finance and personal development.", color: "from-yellow-400 to-amber-500" },
  { icon: Trophy,        title: "Sports",            desc: "Tournaments and talent development programs that unite our wards through healthy competition.", color: "from-sky-400 to-blue-500" },
  { icon: Briefcase,     title: "Internship",        desc: "Linking students with internship opportunities for hands-on industry experience.", color: "from-violet-400 to-purple-600" },
  { icon: Rocket,        title: "Empowerment",       desc: "Scholarships, mental health awareness and entrepreneurship support to help students thrive.", color: "from-rose-400 to-red-500" },
];

export const Programs = () => (
  <section id="programs" className="section-padding bg-background relative overflow-hidden">
    <span className="section-number">02</span>
    <div className="container-custom">
      <div className="text-center max-w-3xl mx-auto mb-14 reveal">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">What We Do</span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
          Our <span className="text-primary">Programs</span>
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">Five focused pillars built to grow every member academically, professionally and personally.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((p, i) => (
          <article key={p.title}
            className={`group relative overflow-hidden bg-card rounded-2xl p-7 shadow-card hover:shadow-elegant transition-smooth border border-border/50 hover:-translate-y-2 card-shimmer reveal delay-${(i % 3 + 1) * 100}`}
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/4 rounded-full -translate-y-14 translate-x-14 group-hover:scale-150 transition-smooth" />
            <div className="relative">
              <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${p.color} text-white shadow-soft mb-5 group-hover:scale-110 group-hover:rotate-3 transition-bounce`}>
                <p.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{p.desc}</p>
            </div>
            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${p.color} group-hover:w-full transition-all duration-500`} />
          </article>
        ))}
      </div>
    </div>
  </section>
);
