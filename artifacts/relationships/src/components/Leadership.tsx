import { useEffect, useState } from "react";
import { Phone, Quote } from "lucide-react";
import agreyPhoto from "@/assets/leader-agrey.png";
import sharonPhoto from "@/assets/leader-sharon.png";
import { api } from "@/lib/api";

const LEADERS = [
  {
    id: "1",
    name: "AGREY CHACHA",
    position: "Founder President",
    phone: "+254745523865",
    photo: agreyPhoto,
    quote:
      "As the Founder President of Kuria West Student Association (KUWESA), I believe in the power of unity, education, and youth empowerment in transforming our society. KUWESA was founded to bring together students from all wards of Kuria West and create a platform for mentorship, leadership, academic growth, advocacy, and community service. Through this association, we aim to empower students, address social challenges such as GBV, FGM, and early marriages, and inspire a generation of responsible leaders committed to the progress and development of Kuria West. Together, we can build a stronger, united, and empowered community.",
  },
  {
    id: "2",
    name: "SHARON OTAIGO",
    position: "Vice President",
    phone: "+254748207838",
    photo: sharonPhoto,
    quote:
      "Every girl and every boy from our seven wards deserves a real chance — not just to be admitted, but to graduate, to lead, and to come back home and lift the next child. I joined KUWESA because I believe leadership is about opening doors so wide that no student is left outside. When we stand together as Kuria West, there is nothing we cannot achieve.",
  },
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export const Leadership = () => {
  const [leaders, setLeaders] = useState(LEADERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await api.get("/leaders");
        if (Array.isArray(data) && data.length > 0) {
          setLeaders(
            data.map((l: any) => {
              const match = LEADERS.find((ld) =>
                ld.name.toLowerCase().includes(l.name?.toLowerCase() || "")
              );
              return {
                id: l.id,
                name: l.name,
                position: l.position,
                phone: l.phone,
                photo: match?.photo || null,
                quote: match?.quote || "",
              };
            })
          );
        }
      } catch (e) {
        console.log("Using fallback leaders");
        setLeaders(LEADERS);
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

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {leaders.map((leader, idx) => (
            <article
              key={leader.id}
              className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 ${
                idx % 2 === 0 ? "reveal-left" : "reveal-right"
              }`}
            >
              {/* Photo Section */}
              <div className="relative h-96 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                {leader.photo ? (
                  <img
                    src={leader.photo}
                    alt={leader.name}
                    className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="text-6xl font-bold text-primary/30">{getInitials(leader.name)}</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Content Section */}
              <div className="p-8">
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">{leader.name}</h3>
                <p className="text-primary font-semibold text-sm mb-6 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {leader.position}
                </p>

                {/* Quote */}
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-5 mb-6 border border-primary/10">
                  <div className="flex gap-2 mb-3">
                    <Quote className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <p className="text-sm text-foreground/80 leading-relaxed italic">{leader.quote}</p>
                  </div>
                </div>

                {/* Contact */}
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
      </div>
    </section>
  );
};
