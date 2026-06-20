import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Send, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const locations = [
  "Isebania",
  "Bukira East",
  "Bukira Central",
  "Makerero",
  "Tagare",
  "Nyamosense/Komosoko",
  "Masaba",
];

export const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Missing fields", description: "Please complete the form.", variant: "destructive" });
      return;
    }
    setSent(true);
    toast({ title: "Message sent", description: "We'll get back to you soon." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="section-padding bg-gradient-soft">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-14 reveal">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            Get in touch
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-balance mb-4">
            Let's <span className="text-primary">connect</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Have a question, a partnership idea, or want to get involved? Our team typically replies within one business day.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Info */}
          <div className="lg:col-span-2 space-y-4 reveal-left">
            <a
              href="tel:+254745523865"
              className="flex items-start gap-4 bg-card rounded-2xl p-5 shadow-card border border-border/50 hover:shadow-elegant hover:-translate-y-0.5 transition-smooth"
            >
              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Call us</div>
                <div className="font-semibold text-foreground">+254 745 523 865</div>
                <div className="text-xs text-muted-foreground mt-0.5">Agrey Chacha, President</div>
              </div>
            </a>

            <a
              href="mailto:kuwesa12@gmail.com"
              className="flex items-start gap-4 bg-card rounded-2xl p-5 shadow-card border border-border/50 hover:shadow-elegant hover:-translate-y-0.5 transition-smooth"
            >
              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Email us</div>
                <div className="font-semibold text-foreground">kuwesa12@gmail.com</div>
                <div className="text-xs text-muted-foreground mt-0.5">For general inquiries</div>
              </div>
            </a>

            <div className="flex items-start gap-4 bg-card rounded-2xl p-5 shadow-card border border-border/50">
              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Response time</div>
                <div className="font-semibold text-foreground">Within 1 business day</div>
                <div className="text-xs text-muted-foreground mt-0.5">Monday – Saturday</div>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-card rounded-2xl p-5 shadow-card border border-border/50">
              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Where we operate</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {locations.map((l) => (
                    <span
                      key={l}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 reveal-right">
            {sent ? (
              <div className="h-full bg-card rounded-3xl p-8 shadow-card border border-border/50 flex flex-col items-center justify-center text-center gap-4 min-h-[420px]">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">Message sent</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Thanks for reaching out. A member of the KUWESA team will get back to you within one business day.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="bg-card rounded-3xl p-8 shadow-card border border-border/50 space-y-5"
              >
                <div className="mb-1">
                  <h3 className="font-display text-2xl font-bold text-foreground">Send a message</h3>
                  <p className="text-sm text-muted-foreground mt-1">Fill in the form and we'll respond as soon as we can.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="c-name">Name</Label>
                    <Input id="c-name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-email">Email</Label>
                    <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-msg">Message</Label>
                  <Textarea id="c-msg" rows={5} value={form.message} onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))} placeholder="How can we help?" />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We respect your privacy. Your details are only used to respond to your message.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
