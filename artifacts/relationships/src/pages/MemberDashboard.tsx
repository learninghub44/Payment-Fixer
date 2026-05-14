import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Bell, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type Member = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  category: string;
  institution: string;
  county: string;
  status: string;
  tier: string;
  joinedAt: string;
};

type Announcement = { id: string; title: string; content: string; createdAt: string };
type WelfareCampaign = { id: string; title: string; description: string; raisedAmount: number };

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [welfare, setWelfare] = useState<WelfareCampaign[]>([]);
  const [activeTab, setActiveTab] = useState<"profile" | "announcements" | "welfare">("profile");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const me = await api.get<any>("/member/me");
        if (!me?.id) {
          navigate("/member/login");
          return;
        }

        const profile = await api.get<Member>(`/member/${me.id}`);
        setMember(profile);

        const annData = await api.get<Announcement[]>("/announcements");
        if (annData) setAnnouncements(annData.slice(0, 5));

        const welData = await api.get<WelfareCampaign[]>("/welfare");
        if (welData) setWelfare(welData.slice(0, 5));
      } catch {
        navigate("/member/login");
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post("/member/logout", {});
      navigate("/");
    } catch {}
  };

  if (!member) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-soft pt-20">
      <div className="container-custom px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-elegant p-6 sm:p-8 mb-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">{member.fullName}</h1>
              <p className="text-muted-foreground text-sm">{member.category} • {member.institution}</p>
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {member.tier}
              </div>
              <div className={`mt-2 text-xs font-medium ${member.status === "Active" ? "text-green-600" : "text-yellow-600"}`}>
                {member.status}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border/50">
          {[
            { id: "profile", label: "Personal Details", icon: User },
            { id: "announcements", label: "Announcements", icon: Bell },
            { id: "welfare", label: "Welfare", icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon as any;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2">
            {activeTab === "profile" && (
              <div className="bg-white rounded-3xl shadow-elegant p-6 sm:p-8 border border-border/50 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Phone</p>
                    <p className="text-lg font-semibold text-foreground mt-1">{member.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Email</p>
                    <p className="text-lg font-semibold text-foreground mt-1">{member.email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Category</p>
                    <p className="text-lg font-semibold text-foreground mt-1">{member.category}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">County</p>
                    <p className="text-lg font-semibold text-foreground mt-1">{member.county}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Joined</p>
                    <p className="text-lg font-semibold text-foreground mt-1">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <Settings className="h-4 w-4" /> Edit Profile
                </button>
              </div>
            )}

            {activeTab === "announcements" && (
              <div className="space-y-4">
                {announcements.map((a) => (
                  <div key={a.id} className="bg-white rounded-2xl shadow-card p-6 border border-border/50">
                    <h3 className="font-bold text-foreground">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{a.content}</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {announcements.length === 0 && <p className="text-muted-foreground">No announcements yet.</p>}
              </div>
            )}

            {activeTab === "welfare" && (
              <div className="space-y-4">
                {welfare.map((w) => (
                  <div key={w.id} className="bg-white rounded-2xl shadow-card p-6 border border-border/50">
                    <h3 className="font-bold text-foreground">{w.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{w.description}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex-1 bg-secondary rounded-full h-2">
                        <div className="bg-primary h-full rounded-full" style={{ width: "45%" }} />
                      </div>
                      <p className="text-sm font-semibold text-foreground">KES {w.raisedAmount}</p>
                    </div>
                  </div>
                ))}
                {welfare.length === 0 && <p className="text-muted-foreground">No welfare campaigns yet.</p>}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-elegant p-6 border border-border/50">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-xl">
                  <p className="text-xs text-muted-foreground">Membership Tier</p>
                  <p className="text-lg font-bold text-primary mt-1">{member.tier}</p>
                </div>
                <div className="p-4 bg-accent/5 rounded-xl">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-lg font-bold text-accent mt-1">{member.status}</p>
                </div>
                <div className="p-4 bg-secondary rounded-xl">
                  <p className="text-xs text-muted-foreground">Announcements</p>
                  <p className="text-lg font-bold text-foreground mt-1">{announcements.length}</p>
                </div>
                <div className="p-4 bg-secondary rounded-xl">
                  <p className="text-xs text-muted-foreground">Welfare Campaigns</p>
                  <p className="text-lg font-bold text-foreground mt-1">{welfare.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
