import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { api } from "@/lib/api";

type Announcement = { id: string; title: string; body: string; created_at: string };

export const Announcements = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get<any[]>("/announcements").then((data) => {
      if (data) {
        setItems(data.slice(0, 6).map((a) => ({
          id: a.id,
          title: a.title,
          body: a.body,
          created_at: a.createdAt ?? a.created_at,
        })));
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  if (!loaded || items.length === 0) return null;

  return (
    <section id="announcements" className="section-padding bg-background">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            Latest Updates
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            <span className="text-primary">Announcements</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Stay in the loop with everything happening at KUWESA.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {items.map((a) => (
            <article
              key={a.id}
              className="group bg-card rounded-3xl p-6 shadow-card hover:shadow-elegant transition-smooth border border-border/50 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 h-11 w-11 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-soft">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-foreground">{a.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{a.body}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(a.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
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
