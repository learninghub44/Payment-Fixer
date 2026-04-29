import { Phone, User, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import agreyPhoto from "@/assets/leader-agrey.png";
import sharonPhoto from "@/assets/leader-sharon.png";
import { api } from "@/lib/api";

type Leader = {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  photo_url: string | null;
};

const fallbackLeaders: Leader[] = [
  { id: "1", name: "AGREY CHACHA", role: "President", phone: "+254745523865", photo_url: agreyPhoto },
  { id: "2", name: "SHARON ATIEGO", role: "Vice President", phone: "", photo_url: sharonPhoto },
];

const seededPhotoFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("agrey")) return agreyPhoto;
  if (n.includes("sharon")) return sharonPhoto;
  return null;
};

const QUOTES_BY_NAME: Record<string, string> = {
  agrey:
    "When I look at Kuria West, I don't see one ward or one school — I see one family with one future. KUWESA exists so that no student walks alone, no dream dies because of school fees, and no village is forgotten. Together we will rise, and the next generation will inherit a stronger Kuria.",
  sharon:
    "Every girl and every boy from our seven wards deserves a real chance — not just to be admitted, but to graduate, to lead, and to come back home and lift the next child. I joined KUWESA because I believe leadership is about opening doors so wide that no student is left outside.",
};

const QUOTES_BY_ROLE: Record<string, string> = {
  president:
    "Leadership is service before titles. We carry KUWESA on our backs so the next student can climb higher than we ever did — that is the only legacy worth leaving behind.",
  "vice president":
    "We grow stronger when we walk together. One Kuria, one family — across all seven wards, no student should ever feel like they are facing university alone.",
  secretary:
    "Behind every great movement is great organisation. I keep our story straight, our records clean, and our promises kept — because trust is the currency of any community.",
  treasurer:
    "Every shilling our members contribute is a seed planted in a student's future. We protect it, we account for it, and we make sure it grows into real opportunity.",
  organising:
    "Strong programs build strong leaders. We turn ideas into action, plans into events, and events into memories that bind our members for life.",
  default:
    "Empowered students build empowered communities. KUWESA is more than a name — it is a promise that no Kuria West student walks the journey alone.",
};

const quoteFor = (name: string, role: string) => {
  const n = name.toLowerCase();
  for (const k of Object.keys(QUOTES_BY_NAME)) if (n.includes(k)) return QUOTES_BY_NAME[k];
  const r = role.toLowerCase();
  for (const k of Object.keys(QUOTES_BY_ROLE)) if (r.includes(k)) return QUOTES_BY_ROLE[k];
  return QUOTES_BY_ROLE.default;
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

export const Leadership = () => {
  const [leaders, setLeaders] = useState<Leader[]>(fallbackLeaders);

  useEffect(() => {
    let active = true;
    api.get<any[]>("/leaders").then((data) => {
      if (!active || !data || data.length === 0) return;
      setLeaders(
        data.map((l) => ({
          id: l.id,
          name: l.name,
          role: l.role,
          phone: l.phone ?? null,
          photo_url: l.photoUrl ?? l.photo_url ?? seededPhotoFor(l.name),
        }))
      );
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <section id="leadership" className="section-padding bg-gradient-soft">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-semibold tracking-wider uppercase mb-4">
            Our Team
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            Meet the <span className="text-primary">Leadership</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            The student leaders steering KUWESA forward — in their own words.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {leaders.map((l) => (
            <article
              key={l.id}
              className="group relative bg-card rounded-3xl p-8 shadow-card hover:shadow-elegant transition-smooth border border-border/50 text-center hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-24 w-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative inline-block mb-5">
                <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-smooth" />
                <div className="relative h-32 w-32 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-elegant ring-4 ring-accent/40 overflow-hidden">
                  {l.photo_url ? (
                    <img src={l.photo_url} alt={`${l.name}, ${l.role} of KUWESA`} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="font-display text-4xl font-bold">{getInitials(l.name)}</span>
                  )}
                </div>
              </div>

              <h3 className="font-display text-xl font-bold text-foreground">{l.name}</h3>
              <p className="text-primary font-semibold text-sm mt-1 mb-5">{l.role}</p>

              <div className="bg-gradient-to-br from-accent/15 to-primary/5 rounded-2xl p-5 mb-5 text-left border border-accent/20">
                <Quote className="h-6 w-6 text-accent mb-2" />
                <p className="text-sm text-foreground/85 italic leading-relaxed">
                  {quoteFor(l.name, l.role)}
                </p>
              </div>

              {l.phone ? (
                <a
                  href={`tel:${l.phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm hover:bg-primary hover:text-primary-foreground transition-smooth"
                >
                  <Phone className="h-4 w-4" />
                  {l.phone}
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-muted-foreground text-sm">
                  <User className="h-4 w-4" />
                  Contact via President
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
