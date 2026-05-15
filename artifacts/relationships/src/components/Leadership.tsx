import { useEffect, useState } from "react";
import { Phone, Quote } from "lucide-react";
import agreyPhoto from "@/assets/leader-agrey.png";
import sharonPhoto from "@/assets/leader-sharon.png";
import { api } from "@/lib/api";

const STATIC_LEADERS = [
  {
    id: "static-1",
    name: "AGREY CHACHA",
    position: "Founder President",
    phone: "+254745523865",
    photoUrl: agreyPhoto,
    quote:
      "As the Founder President of Kuria West Student Association (KUWESA), I believe in the power of unity, education, and youth empowerment in transforming our society. KUWESA was founded to bring together students from all wards of Kuria West and create a platform for mentorship, leadership, academic growth, advocacy, and community service. Through this association, we aim to empower students, address social challenges such as GBV, FGM, and early marriages, and inspire a generation of responsible leaders committed to the progress and development of Kuria West. Together, we can build a stronger, united, and empowered community.",
  },
  {
    id: "static-2",
    name: "SHARON OTAIGO",
    position: "Vice President",
    phone: "+254748207838",
    photoUrl: sharonPhoto,
    quote:
      "Every girl and every boy from our seven wards deserves a real chance — not just to be admitted, but to graduate, to lead, and to come back home and lift the next child. I joined KUWESA because I believe leadership is about opening doors so wide that no student is left outside. When we stand together as Kuria West, there is nothing we cannot achieve.",
  },
];

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

export const Leadership = () => {
  const [leaders, setLeaders] = useState(STATIC_LEADERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await api.get<any[]>("/leaders");
        if (Array.isArray(data) && data.length > 0) {
          setLeaders(
            data.map((l: any) => {
              const match = STATIC_LEADERS.find(
                (ld) => ld.name.toLowerCase() === (l.name || "").toLowerCase()
              );
              return {
                id: l.id,
                name: l.name,
                position: l.position,
                phone: l.phone || null,
                // Prefer Supabase URL from DB, then bundled photo, then null
                photoUrl: l.photoUrl || l.image_url || match?.photoUrl || null,
                quote: match?.quote || "",
              };
            })
          );
        }
      } catch {
        // Keep static fallback
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  return (
    <section id="leadership" className="section-padding bg-gradient-soft">
      <span className="section-number">05</span>
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-4">
            Leadership
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Meet Our <span className="text-primary">Leaders</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Visionary student leaders dedicated to empowering and transforming Kuria West
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {leaders.map((leader, idx) => (
              <article
                key={leader.id}
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 ${
                  idx % 2 === 0 ? "reveal-left" : "reveal-right"
                }`}
              >
                <div className="relative h-96 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                  {leader.photoUrl ? (
                    <img
                      src={leader.photoUrl}
                      alt={leader.name}
                      className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-6xl font-bold text-primary/30">{getInitials(leader.name)}</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6">
                    <h3 className="font-display text-xl font-bold text-white">{leader.name}</h3>
                    <p className="text-primary-foreground/80 text-sm font-medium">{leader.position}</p>
                  </div>
                </div>

                <div className="p-6">
                  {leader.quote && (
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4 mb-5 border border-primary/10">
                      <div className="flex gap-2">
                        <Quote className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                        <p className="text-sm text-foreground/80 leading-relaxed italic">{leader.quote}</p>
                      </div>
                    </div>
                  )}

                  {leader.phone && (
                    <a
                      href={`tel:${leader.phone}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-semibold text-sm shadow-md hover:shadow-lg"
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
