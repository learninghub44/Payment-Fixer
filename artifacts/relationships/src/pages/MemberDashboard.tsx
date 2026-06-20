import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, User, Bell, Heart, HandHeart, Megaphone,
  Phone, Mail, MapPin, BookOpen, Building2, Calendar,
  Shield, TrendingUp, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────
type Member = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  category: string;
  institution: string;
  county: string;
  status: string;
  tier: string;
  joined_at: string;
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

type WelfareCampaign = {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  raised_amount: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return { icon: CheckCircle2, bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: status };
    case "pending":
    case "pending payment":
      return { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", label: status };
    case "inactive":
    case "suspended":
      return { icon: AlertCircle, bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: status };
    default:
      return { icon: AlertCircle, bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: status };
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* hero skeleton */}
      <div className="bg-gradient-hero pt-24 pb-10 px-4">
        <div className="container-custom space-y-4">
          <Skeleton className="h-5 w-32 bg-white/20 rounded-full" />
          <Skeleton className="h-10 w-64 bg-white/20" />
          <Skeleton className="h-5 w-48 bg-white/20" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-9 w-28 bg-white/20 rounded-full" />
            <Skeleton className="h-9 w-24 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="container-custom px-4 py-8 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [welfare, setWelfare] = useState<WelfareCampaign[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "announcements" | "welfare">("profile");

  useScrollReveal();

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<any>("/member/me");
        if (!me?.id) { navigate("/member/login"); return; }

        const profile = await api.get<any>(`/member/${me.id}`);
        setMember(profile);

        const annRaw = await api.get<any[]>("/announcements");
        if (annRaw) {
          setAnnouncements(annRaw.slice(0, 5).map((a) => ({
            id: a.id, title: a.title,
            body: a.body ?? a.content ?? "",
            created_at: a.created_at ?? a.createdAt ?? "",
          })));
        }

        const welRaw = await api.get<any[]>("/welfare");
        if (welRaw) {
          setWelfare(welRaw.slice(0, 5).map((w) => ({
            id: w.id, title: w.title, description: w.description,
            goal_amount: Number(w.goal_amount ?? w.goalAmount ?? 0),
            raised_amount: Number(w.raised_amount ?? w.raisedAmount ?? 0),
          })));
        }
      } catch {
        navigate("/member/login");
      }
    })();
  }, [navigate]);

  const handleLogout = async () => {
    try { await api.post("/member/logout", {}); } catch {}
    navigate("/");
  };

  if (!member) return <DashboardSkeleton />;

  const status = statusConfig(member.status);
  const StatusIcon = status.icon;

  const tabs = [
    { id: "profile",       label: "Profile",        Icon: User,     count: null },
    { id: "announcements", label: "Announcements",  Icon: Bell,     count: announcements.length },
    { id: "welfare",       label: "Welfare",        Icon: Heart,    count: welfare.length },
  ] as const;

  // Initials avatar
  const initials = member.full_name
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <>
      <Navbar />

      {/* ── Hero header ────────────────────────────────────────────────── */}
      <div className="bg-gradient-hero relative overflow-hidden pt-20">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-8 h-40 w-40 rounded-full bg-green-400/10 translate-y-1/2 pointer-events-none" />

        <div className="container-custom px-4 sm:px-6 py-10 sm:py-14 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Avatar */}
            <div className="shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-elegant ring-4 ring-white/20">
              <span className="text-3xl sm:text-4xl font-black text-green-900">{initials}</span>
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0">
              <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-1">Member Dashboard</p>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white truncate">
                {member.full_name}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {member.category} · {member.institution}
              </p>
            </div>

            {/* Status + tier chips */}
            <div className="flex sm:flex-col gap-2 sm:items-end shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                <Shield className="h-3 w-3" />
                {member.tier}
              </span>
            </div>
          </div>

          {/* Logout link */}
          <button
            onClick={handleLogout}
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        {/* Wave edge */}
        <div className="wave-divider">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-full h-10 fill-background">
            <path d="M0,32 C360,0 1080,64 1440,32 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="bg-background min-h-screen">
        <div className="container-custom px-4 sm:px-6 py-8 space-y-6">

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 reveal">
            {[
              { icon: Shield,     label: "Tier",           value: member.tier,               accent: "bg-green-50 border-green-200",  iconCls: "text-green-600 bg-green-100" },
              { icon: TrendingUp, label: "Announcements",  value: String(announcements.length), accent: "bg-blue-50 border-blue-200",  iconCls: "text-blue-600 bg-blue-100"  },
              { icon: Heart,      label: "Welfare Active", value: String(welfare.length),    accent: "bg-rose-50 border-rose-200",    iconCls: "text-rose-600 bg-rose-100"  },
            ].map(({ icon: Icon, label, value, accent, iconCls }) => (
              <div key={label} className={`rounded-2xl border p-4 flex items-center gap-3 ${accent}`}>
                <span className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${iconCls}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
                  <p className="text-lg font-black text-foreground leading-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex bg-secondary rounded-xl p-1 gap-1 reveal">
            {tabs.map(({ id, label, Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === id
                    ? "bg-white shadow-card text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden xs:inline sm:inline">{label}</span>
                {count !== null && count > 0 && (
                  <span className={`h-5 min-w-[20px] px-1 rounded-full text-xs font-bold flex items-center justify-center ${
                    activeTab === id ? "bg-primary text-white" : "bg-border text-muted-foreground"
                  }`}>{count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Profile tab ── */}
          {activeTab === "profile" && (
            <div className="reveal space-y-4">
              {/* Detail grid */}
              <div className="bg-white rounded-2xl border border-border/60 shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border/40 bg-secondary/40">
                  <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">Personal Details</h2>
                </div>
                <div className="divide-y divide-border/40">
                  {[
                    { icon: Phone,     label: "Phone",       value: member.phone },
                    { icon: Mail,      label: "Email",       value: member.email || "Not provided" },
                    { icon: BookOpen,  label: "Category",    value: member.category },
                    { icon: Building2, label: "Institution", value: member.institution },
                    { icon: MapPin,    label: "County",      value: member.county },
                    {
                      icon: Calendar,
                      label: "Member since",
                      value: member.joined_at
                        ? new Date(member.joined_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
                        : "—",
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors">
                      <span className="shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      <div className="flex-1 min-w-0 flex sm:items-center flex-col sm:flex-row sm:gap-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32 shrink-0">{label}</p>
                        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info note */}
              <div className="rounded-xl border border-border/60 bg-secondary/50 px-5 py-4 flex gap-3 items-start">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To update your details, contact KUWESA leadership via the{" "}
                  <a href="/#contact" className="text-primary font-semibold hover:underline">Contact page</a>.
                </p>
              </div>
            </div>
          )}

          {/* ── Announcements tab ── */}
          {activeTab === "announcements" && (
            <div className="space-y-3 reveal">
              {announcements.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border/60 shadow-card p-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Megaphone className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-display font-bold text-foreground mb-1">No announcements yet</p>
                  <p className="text-xs text-muted-foreground">Check back soon — leadership posts updates here.</p>
                </div>
              ) : announcements.map((a, i) => (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl border border-border/60 shadow-card p-5 flex gap-4 hover:-translate-y-0.5 transition-smooth"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                    <Megaphone className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-foreground text-sm">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">{a.body}</p>
                    {a.created_at && (
                      <p className="text-xs text-muted-foreground/60 mt-3 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-primary/40" />
                        {new Date(a.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Welfare tab ── */}
          {activeTab === "welfare" && (
            <div className="space-y-3 reveal">
              {welfare.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border/60 shadow-card p-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
                    <HandHeart className="h-7 w-7 text-rose-500" />
                  </div>
                  <p className="font-display font-bold text-foreground mb-1">No active campaigns</p>
                  <p className="text-xs text-muted-foreground">Leadership posts welfare cases as they arise.</p>
                </div>
              ) : welfare.map((w, i) => {
                const pct = w.goal_amount > 0
                  ? Math.min(100, Math.round((w.raised_amount / w.goal_amount) * 100))
                  : 0;
                const raisedPct = Math.min(100, pct);
                return (
                  <div
                    key={w.id}
                    className="bg-white rounded-2xl border border-border/60 shadow-card p-5 hover:-translate-y-0.5 transition-smooth"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="shrink-0 h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-rose-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-foreground text-sm">{w.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{w.description}</p>
                      </div>
                      <span className="shrink-0 text-sm font-black text-primary">{pct}%</span>
                    </div>

                    {/* Progress */}
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary rounded-full transition-all duration-700"
                        style={{ width: `${raisedPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                      <span className="font-semibold text-foreground">KES {w.raised_amount.toLocaleString()} raised</span>
                      <span>of KES {w.goal_amount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}
