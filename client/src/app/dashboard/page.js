"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, Repeat2, Star, Bell, Plus,
  LogOut, Search, ChevronRight, MessageCircle
} from "lucide-react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import toast, { Toaster } from "react-hot-toast";

export default function Dashboard() {
  const router = useRouter();
  const { user, setAuth, logout } = useAuthStore();

  const [profile, setProfile]       = useState(null);
  const [matches, setMatches]        = useState([]);
  const [incoming, setIncoming]      = useState([]);
  const [outgoing, setOutgoing]      = useState([]);
  const [loading, setLoading]        = useState(true);
  const [activeTab, setActiveTab]    = useState("matches");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [profileRes, incomingRes, outgoingRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/barter/incoming"),
        api.get("/barter/outgoing"),
      ]);
      setProfile(profileRes.data);
      setIncoming(incomingRes.data);
      setOutgoing(outgoingRes.data);

      // Only fetch matches if user has learn skills
      if (profileRes.data.learnSkills?.length > 0) {
        const matchRes = await api.get("/users/match");
        setMatches(matchRes.data);
      }
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/barter/${id}/accept`);
      toast.success("Request accepted!");
      fetchAll();
    } catch { toast.error("Failed to accept"); }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/barter/${id}/reject`);
      toast.success("Request rejected");
      fetchAll();
    } catch { toast.error("Failed to reject"); }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "var(--forest)" }}>Loading...</div>
      </div>
    </div>
  );

  const pendingCount = incoming.filter(r => r.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "grid", gridTemplateColumns: "260px 1fr" }}>
      <Toaster position="top-right"/>

      {/* Sidebar */}
      <aside style={{
        background: "var(--forest)", padding: "32px 20px",
        display: "flex", flexDirection: "column", gap: "8px",
        position: "sticky", top: 0, height: "100vh"
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", marginBottom: "32px", display: "block" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--cream)" }}>
            Skill<span style={{ color: "var(--terra-light)" }}>Barter</span>
          </div>
        </Link>

        {/* User info */}
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "var(--terra)", display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1.1rem"
            }}>
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ color: "var(--cream)", fontWeight: 600, fontSize: "0.95rem" }}>{profile?.name}</div>
              <div style={{ color: "var(--sage)", fontSize: "0.78rem" }}>⭐ {profile?.rating || 0} · {profile?.completedSwaps || 0} swaps</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        {[
          { label: "Matches",  icon: <Users size={18}/>,         tab: "matches",  badge: null },
          { label: "Requests", icon: <Bell size={18}/>,          tab: "requests", badge: pendingCount },
          { label: "My Swaps", icon: <Repeat2 size={18}/>,       tab: "swaps",    badge: null },
          { label: "Explore",  icon: <Search size={18}/>,        tab: null,       href: "/explore" },
        ].map((item) => (
          <button key={item.label}
            onClick={() => item.href ? router.push(item.href) : setActiveTab(item.tab)}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderRadius: "8px", border: "none",
              background: activeTab === item.tab ? "rgba(255,255,255,0.12)" : "transparent",
              color: activeTab === item.tab ? "var(--cream)" : "var(--sage)",
              cursor: "pointer", width: "100%", textAlign: "left",
              fontSize: "0.95rem", fontWeight: activeTab === item.tab ? 600 : 400,
              transition: "all 0.2s"
            }}>
            {item.icon}
            {item.label}
            {item.badge > 0 && (
              <span style={{ marginLeft: "auto", background: "var(--terra)", color: "white", borderRadius: "20px", padding: "2px 8px", fontSize: "0.75rem" }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}

        {/* Bottom — Add skill + Logout */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link href="/profile" style={{ textDecoration: "none" }}>
            <button style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.2)",
              background: "transparent", color: "var(--sage)", cursor: "pointer",
              width: "100%", fontSize: "0.9rem"
            }}>
              <Plus size={18}/> Edit Profile
            </button>
          </Link>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "12px 16px", borderRadius: "8px", border: "none",
            background: "transparent", color: "var(--sage)", cursor: "pointer",
            width: "100%", fontSize: "0.9rem"
          }}>
            <LogOut size={18}/> Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ padding: "40px 48px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{ fontSize: "2rem", color: "var(--forest)", marginBottom: "6px" }}>
            Good day, {profile?.name?.split(" ")[0]}! 👋
          </h1>
          <p style={{ color: "var(--muted)" }}>Here's what's happening with your skill swaps</p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
          {[
            { label: "Skill Matches",     value: matches.length,                          icon: <Users size={20}/>,   color: "var(--forest)" },
            { label: "Pending Requests",  value: pendingCount,                            icon: <Bell size={20}/>,    color: "var(--terra)" },
            { label: "Completed Swaps",   value: profile?.completedSwaps || 0,            icon: <Star size={20}/>,    color: "var(--sage)" },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ background: `${stat.color}18`, color: stat.color, padding: "12px", borderRadius: "10px" }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "var(--charcoal)" }}>{stat.value}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* My Skills summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "40px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ fontWeight: 600, color: "var(--forest)", marginBottom: "14px", display: "flex", justifyContent: "space-between" }}>
              🎓 I Teach
              <Link href="/profile" style={{ fontSize: "0.8rem", color: "var(--terra)", textDecoration: "none" }}>+ Add</Link>
            </div>
            {profile?.teachSkills?.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {profile.teachSkills.map((s, i) => (
                  <span key={i} className="tag">{s.name} · {s.level}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No skills added yet</p>
            )}
          </div>
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ fontWeight: 600, color: "var(--terra)", marginBottom: "14px", display: "flex", justifyContent: "space-between" }}>
              📚 I Want to Learn
              <Link href="/profile" style={{ fontSize: "0.8rem", color: "var(--terra)", textDecoration: "none" }}>+ Add</Link>
            </div>
            {profile?.learnSkills?.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {profile.learnSkills.map((s, i) => (
                  <span key={i} className="tag tag-terra">{s.name} · {s.urgency}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No skills added yet</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--cream-dark)", borderRadius: "8px", padding: "4px", width: "fit-content" }}>
          {["matches", "requests", "swaps"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 20px", borderRadius: "6px", border: "none",
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "var(--forest)" : "var(--muted)",
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: "pointer", fontSize: "0.9rem", textTransform: "capitalize",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s"
            }}>
              {tab} {tab === "requests" && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>

        {/* Tab — Matches */}
        {activeTab === "matches" && (
          <div>
            {matches.length === 0 ? (
              <div className="card" style={{ padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
                <h3 style={{ color: "var(--forest)", marginBottom: "8px" }}>No matches yet</h3>
                <p style={{ color: "var(--muted)", marginBottom: "20px" }}>Add skills you want to learn to find matches</p>
                <Link href="/profile"><button className="btn-primary">Add Learn Skills</button></Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {matches.map((m) => (
                  <div key={m._id} className="card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: "var(--forest)", display: "flex", alignItems: "center",
                        justifyContent: "center", color: "white", fontWeight: 700
                      }}>
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>⭐ {m.rating} · {m.completedSwaps} swaps</div>
                      </div>
                      <div style={{ marginLeft: "auto", background: "#e8f5e8", color: "var(--forest)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600 }}>
                        {m.matchScore} match
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                      {m.teachSkills?.slice(0, 3).map((s, i) => (
                        <span key={i} className="tag" style={{ fontSize: "0.78rem" }}>{s.name}</span>
                      ))}
                    </div>
                    <Link href={`/explore?request=${m._id}`}>
                      <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "0.88rem" }}>
                        Request Swap <ChevronRight size={15}/>
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab — Requests */}
        {activeTab === "requests" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {incoming.length === 0 ? (
              <div className="card" style={{ padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
                <p style={{ color: "var(--muted)" }}>No incoming requests yet</p>
              </div>
            ) : incoming.map((r) => (
              <div key={r._id} className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", background: "var(--terra)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0
                }}>
                  {r.from?.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>{r.from?.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    Offers <strong style={{ color: "var(--forest)" }}>{r.offeredSkill}</strong> → wants <strong style={{ color: "var(--terra)" }}>{r.wantedSkill}</strong>
                  </div>
                  {r.message && <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "4px", fontStyle: "italic" }}>"{r.message}"</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {r.status === "pending" ? (
                    <>
                      <button onClick={() => handleReject(r._id)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Decline</button>
                      <button onClick={() => handleAccept(r._id)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Accept</button>
                    </>
                  ) : (
                    <span style={{
                      padding: "6px 14px", borderRadius: "20px", fontSize: "0.82rem", fontWeight: 600,
                      background: r.status === "accepted" ? "#e8f5e8" : "#fce8dc",
                      color: r.status === "accepted" ? "var(--forest)" : "var(--terra)"
                    }}>
                      {r.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab — My Swaps */}
        {activeTab === "swaps" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {outgoing.length === 0 ? (
              <div className="card" style={{ padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔄</div>
                <p style={{ color: "var(--muted)", marginBottom: "20px" }}>You haven't sent any swap requests yet</p>
                <Link href="/explore"><button className="btn-primary">Explore Skills</button></Link>
              </div>
            ) : outgoing.map((r) => (
              <div key={r._id} className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", background: "var(--forest)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0
                }}>
                  {r.to?.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>{r.to?.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    You offer <strong style={{ color: "var(--forest)" }}>{r.offeredSkill}</strong> → want <strong style={{ color: "var(--terra)" }}>{r.wantedSkill}</strong>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {r.status === "accepted" && (
                    <Link href={`/chat/${r._id}`}>
                      <button className="btn-primary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
                        <MessageCircle size={15}/> Chat
                      </button>
                    </Link>
                  )}
                  <span style={{
                    padding: "6px 14px", borderRadius: "20px", fontSize: "0.82rem", fontWeight: 600,
                    background: r.status === "accepted" ? "#e8f5e8" : r.status === "pending" ? "#fff8e8" : r.status === "completed" ? "#e8f5e8" : "#fce8dc",
                    color: r.status === "accepted" ? "var(--forest)" : r.status === "pending" ? "#b8860b" : r.status === "completed" ? "var(--forest)" : "var(--terra)"
                  }}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}