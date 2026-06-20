import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Bell, Heart, HandHeart, Megaphone } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

// ── Types (snake_case matching raw API response) ─────────────────────────────
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
  body: string;         // raw API field; fallback from `content`
  created_at: string;   // raw API field; fallback from `createdAt`
};

type WelfareCampaign = {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  raised_amount: number;
};

// ── Status badge helper ───────────────────────────────────────────────────────
function statusClasses(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700";
    case "pending":
    case "pending payment":
      return "bg-yellow-100 text-yellow-700";
    case "inactive":
    case "suspended":
      return "bg-red-100 text-red-700";
    default:
      return "bg-secondary text-muted-foreground";
  }
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-soft pt-20">
      <div className="container-custom px-4 sm:px-6 py-8 space-y-6">
        {/* Header card skeleton */}
        <div className="bg-white rounded-3xl shadow-elegant p-6 sm:p-8 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          </div>
          <Skeleton className="h-4 w-20 mt-4" />
        </div>

        {/* Tab bar skeleton */}
        <div className="flex gap-2 border-b border-border/50 pb-0">
          {[120, 140, 100].map((w) => (
            <Skeleton key={w} className="h-10 rounded-none" style={{ width: w }} />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl shadow-elegant p-6 border border-border/50 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={i === 4 ? "sm:col-span-2 space-y-1" : "space-y-1"}>
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-elegant p-6 border border-border/50 space-y-4">
              <Skeleton className="h-6 w-28" />
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [welfare, setWelfare] = useState<WelfareCampaign[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "announcements" | "welfare">("profile");

  useEffect(() => {
    const init = async () => {
      try {
        const me = await api.get<any>("/member/me");
        if (!me?.id) { navigate("/member/login"); return; }

        const profile = await api.get<any>(`/member/${me.id}`);
        setMember(profile);

        const annRaw = await api.get<any[]>("/announcements");
        if (annRaw) {
          setAnnouncements(
            annRaw.slice(0, 5).map((a) => ({
              id: a.id,
              title: a.title,
              // defensive: API returns `body`, but guard against `content` too
              body: a.body ?? a.content ?? "",
              created_at: a.created_at ?? a.createdAt ?? "",
            }))
          );
        }

        const welRaw = await api.get<any[]>("/welfare");
        if (welRaw) {
          setWelfare(
            welRaw.slice(0, 5).map((w) => ({
              id: w.id,
              title: w.title,
              description: w.description,
              goal_amount: Number(w.goal_amount ?? w.goalAmount ?? 0),
              raised_amount: Number(w.raised_amount ?? w.raisedAmount ?? 0),
            }))
          );
        }
      } catch {
        navigate("/member/login");
      }
    };

    init();
  }, [navigate]);

  const handleLogout = async () => {
    try { await api.post("/member/logout", {}); } catch {}
    navigate("/");
  };

  if (!member) return <DashboardSkeleton />;

  const tabs = [
    { id: "profile",       label: "Personal Details", Icon: User },
    { id: "announcements", label: "Announcements",    Icon: Bell },
    { id: "welfare",       label: "Welfare",          Icon: Heart },
  ] as const;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-soft pt-20">
        <div className="container-custom px-4 sm:px-6 py-8">

          {/* ── Header card ── */}
          <div className="bg-white rounded-3xl shadow-elegant p-6 sm:p-8 mb-6 border border-border/50">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  {member.full_name}
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {member.category} · {member.institution}
                </p>
              </div>
              <div className="text-right shrink-0 space-y-1.5">
                <span className="inline-block px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                  {member.tier}
                </span>
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClasses(member.status)}`}>
                    {member.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-0 mb-6 border-b border-border/50 overflow-x-auto">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Main panel */}
            <div className="lg:col-span-2">

              {/* Profile tab */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-3xl shadow-elegant p-6 sm:p-8 border border-border/50 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      ["Phone",       member.phone],
                      ["Email",       member.email || "Not provided"],
                      ["Category",    member.category],
                      ["County",      member.county],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                        <p className="text-base sm:text-lg font-semibold text-foreground mt-1">{value}</p>
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member Since</p>
                      <p className="text-base sm:text-lg font-semibold text-foreground mt-1">
                        {member.joined_at
                          ? new Date(member.joined_at).toLocaleDateString(undefined, {
                              year: "numeric", month: "long", day: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* No edit-profile button — no backend endpoint exists; contact admin to update details */}
                  <div className="rounded-xl border border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
                    To update your details, contact KUWESA leadership or reach out via the{" "}
                    <a href="/#contact" className="text-primary font-medium hover:underline">Contact page</a>.
                  </div>
                </div>
              )}

              {/* Announcements tab */}
              {activeTab === "announcements" && (
                <div className="space-y-4">
                  {announcements.length === 0 && (
                    <div className="bg-white rounded-3xl shadow-card p-10 text-center border border-border/50">
                      <Megaphone className="h-8 w-8 text-primary/40 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No announcements yet.</p>
                    </div>
                  )}
                  {announcements.map((a) => (
                    <div key={a.id} className="bg-white rounded-2xl shadow-card p-6 border border-border/50 flex gap-4">
                      <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-foreground">{a.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">{a.body}</p>
                        {a.created_at && (
                          <p className="text-xs text-muted-foreground mt-3">
                            {new Date(a.created_at).toLocaleDateString(undefined, {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Welfare tab */}
              {activeTab === "welfare" && (
                <div className="space-y-4">
                  {welfare.length === 0 && (
                    <div className="bg-white rounded-3xl shadow-card p-10 text-center border border-border/50">
                      <HandHeart className="h-8 w-8 text-primary/40 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No active welfare campaigns right now.</p>
                    </div>
                  )}
                  {welfare.map((w) => {
                    const pct =
                      w.goal_amount > 0
                        ? Math.min(100, Math.round((w.raised_amount / w.goal_amount) * 100))
                        : 0;
                    return (
                      <div key={w.id} className="bg-white rounded-2xl shadow-card p-6 border border-border/50">
                        <h3 className="font-display font-bold text-foreground">{w.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{w.description}</p>
                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-foreground">
                              KES {w.raised_amount.toLocaleString()} raised
                            </span>
                            <span className="text-muted-foreground">
                              of KES {w.goal_amount.toLocaleString()} goal · {pct}%
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-elegant p-6 border border-border/50">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-primary/5 rounded-xl">
                    <p className="text-xs text-muted-foreground">Membership Tier</p>
                    <p className="text-lg font-bold text-primary mt-0.5">{member.tier}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border/60">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-sm font-semibold ${statusClasses(member.status)}`}>
                      {member.status}
                    </span>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-xs text-muted-foreground">Announcements</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{announcements.length}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-xs text-muted-foreground">Welfare Campaigns</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">{welfare.length}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
