import { useEffect, useState, useRef } from "react";
import { Megaphone, Bell, Wifi } from "lucide-react";
import { api } from "@/lib/api";

type Announcement = { id: string; title: string; body: string; createdAt: string };

export const Announcements = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [live, setLive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const data = await api.get<any[]>("/announcements");
      if (data) {
        const mapped = data.map((a) => ({
          id: a.id,
          title: a.title,
          body: a.body ?? a.content,
          createdAt: a.createdAt ?? a.created_at,
        }));
        setItems((prev) => {
          // Only update if there are new items
          if (prev.length !== mapped.length || prev[0]?.id !== mapped[0]?.id) {
            setLive(true);
            setTimeout(() => setLive(false), 2000);
            return mapped;
          }
          return prev;
        });
      }
      setLoaded(true);
    } catch { setLoaded(true); }
  };

  useEffect(() => {
    fetchAnnouncements();
    // Poll every 30 seconds for new announcements
    intervalRef.current = setInterval(fetchAnnouncements, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (!loaded) return null;
  if (items.length === 0) return null;

  return (
    <section id="announcements" className="section-padding bg-background relative overflow-hidden">
      <span className="section-number">03</span>
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12 reveal">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">Latest Updates</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            <span className="text-primary">Announcements</span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
            <Wifi className={`h-3.5 w-3.5 ${live ? "text-green-500 animate-pulse" : "text-muted-foreground/50"}`} />
            <span>Live updates every 30 seconds</span>
          </div>
        </div>

        {/* Scrolling ticker for latest announcement */}
        {items.length > 0 && (
          <div className="mb-8 reveal">
            <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-primary/20 shadow-soft">
              <div className="flex-shrink-0 bg-gradient-primary text-white px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Bell className="h-3.5 w-3.5" /> Latest
              </div>
              <div className="flex-1 bg-primary/5 px-4 py-3 overflow-hidden">
                <div className="flex gap-8 animate-marquee whitespace-nowrap">
                  {[...items, ...items].map((a, i) => (
                    <span key={`${a.id}-${i}`} className="text-sm text-foreground font-medium">
                      📢 {a.title} &nbsp;·&nbsp;
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {items.map((a, i) => (
            <article key={a.id}
              className={`group bg-card rounded-3xl p-6 shadow-card hover:shadow-elegant transition-smooth border border-border/50 hover:-translate-y-1 card-shimmer reveal delay-${(i % 2 + 1) * 100}`}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-soft group-hover:scale-110 transition-bounce">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-foreground">{a.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">{a.body}</p>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {new Date(a.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
