import { useEffect, useState } from "react";
import { Phone, Quote } from "lucide-react";
import agreyPhoto from "@/assets/leader-agrey.png";
import sharonPhoto from "@/assets/leader-sharon.png";
import { api } from "@/lib/api";

type Leader = {
  id: string;
  name: string;
  position: string;
  phone: string | null;
  photoUrl: string | null;
};

const LEADERS_DATA = [
  {
    name: "AGREY CHACHA",
    position: "Founder President",
    phone: "+254745523865",
    photo: agreyPhoto,
    quote: "As the Founder President of Kuria West Student Association (KUWESA), I believe in the power of unity, education, and youth empowerment in transforming our society. KUWESA was founded to bring together students from all wards of Kuria West and create a platform for mentorship, leadership, academic growth, advocacy, and community service. Through this association, we aim to empower students, address social challenges such as GBV, FGM, and early marriages, and inspire a generation of responsible leaders committed to the progress and development of Kuria West. Together, we can build a stronger, united, and empowered community.",
  },
  {
    name: "SHARON OTAIGO",
    position: "Vice President",
    phone: "+254748207838",
    photo: sharonPhoto,
    quote: "Every girl and every boy from our seven wards deserves a real chance — not just to be admitted, but to graduate, to lead, and to come back home and lift the next child. I joined KUWESA because I believe leadership is about opening doors so wide that no student is left outside. When we stand together as Kuria West, there is nothing we cannot achieve.",
  },
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const Leadership = () => {
  const [leaders, setLeaders] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await api.get<any[]>("/leaders");
        if (data && data.length > 0) {
          setLeaders(data.map((l) => ({
            name: l.name,
            position: l.position,
            phone: l.phone,
            photo: LEADERS_DATA.find((ld) =>
              ld.name.toLowerCase().includes(l.name.toLowerCase())
            )?.photo || null,
            quote: LEADERS_DATA.find((ld) =>
              ld.name.toLowerCase().includes(l.name.toLowerCase())
            )?.quote || "",
          })));
        } else {
          setLeaders(LEADERS_DATA);
        }
      } catch {
        setLeaders(LEADERS_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  return (
    <section id="leadership" className="section-padding bg-gradient-soft relative overflow-hidden">
      <span className="section-number">05</span>
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-14 reveal">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-semibold tracking-wider uppercase mb-4">
            Leadership Team
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            Meet Our <span className="text-primary">Leaders</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Dedicated to empowering students and transforming Kuria West
          </p>
        </div>

        {!loading && leaders.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {leaders.map((leader: any, i: number) => (
              <article
                key={leader.name}
                className={`group relative bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-elegant transition-all border border-border/50 hover:-translate-y-2 card-shimmer ${
                  i % 2 === 0 ? "reveal-left" : "reveal-right"
                }`}
              >
                {/* Background accent */}
                <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-primary opacity-5 rounded-full blur-3xl pointer-events-none group-hover:opacity-10 transition-all" />

                {/* Photo */}
                <div className="relative h-80 overflow-hidden bg-gradient-primary flex items-center justify-center">
                  {leader.photo ? (
                    <img
                      src={leader.photo}
                      alt={leader.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-primary-foreground">
                      <span className="text-6xl font-bold">{getInitials(leader.name)}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="relative p-6 sm:p-8">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">{leader.name}</h3>
                  <p className="text-primary font-semibold text-sm mt-1 mb-5 inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {leader.position}
                  </p>

                  {/* Quote */}
                  <div className="bg-gradient-to-br from-accent/12 to-primary/5 rounded-2xl p-4 mb-5 border border-accent/20">
                    <Quote className="h-5 w-5 text-accent mb-2 opacity-80" />
                    <p className="text-sm text-foreground/85 italic leading-relaxed line-clamp-5">
                      {LEADERS_DATA.find((ld) => ld.name === leader.name)?.quote ||
                        "Empowering students through unity and leadership."}
                    </p>
                  </div>

                  {/* Phone */}
                  {leader.phone && (
                    <a
                      href={`tel:${leader.phone}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-medium text-sm"
                    >
                      <Phone className="h-4 w-4" />
                      {leader.phone}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
