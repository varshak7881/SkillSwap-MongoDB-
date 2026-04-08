"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Star, Edit3, Save, X } from "lucide-react";
import api from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile]       = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText]       = useState("");
  const [activeTab, setActiveTab]   = useState("skills");

  // Add skill forms
  const [showTeachForm, setShowTeachForm] = useState(false);
  const [showLearnForm, setShowLearnForm] = useState(false);
  const [teachForm, setTeachForm] = useState({ name: "", level: "beginner", description: "" });
  const [learnForm, setLearnForm] = useState({ name: "", urgency: "medium" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const meRes = await api.get("/auth/me");
      setProfile(meRes.data);
      setBioText(meRes.data.bio || "");

      const [reviewsRes, statsRes] = await Promise.all([
        api.get(`/reviews/${meRes.data._id}`),
        api.get(`/reviews/stats/${meRes.data._id}`)
      ]);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const saveBio = async () => {
    try {
      await api.put("/users/profile", { name: profile.name, bio: bioText });
      setProfile(prev => ({ ...prev, bio: bioText }));
      setEditingBio(false);
      toast.success("Bio updated!");
    } catch { toast.error("Failed to update bio"); }
  };

  const addTeachSkill = async () => {
    if (!teachForm.name) return toast.error("Enter a skill name");
    try {
      const { data } = await api.post("/users/teach-skills", teachForm);
      setProfile(data);
      setTeachForm({ name: "", level: "beginner", description: "" });
      setShowTeachForm(false);
      toast.success("Skill added!");
    } catch { toast.error("Failed to add skill"); }
  };

  const addLearnSkill = async () => {
    if (!learnForm.name) return toast.error("Enter a skill name");
    try {
      const { data } = await api.post("/users/learn-skills", learnForm);
      setProfile(data);
      setLearnForm({ name: "", urgency: "medium" });
      setShowLearnForm(false);
      toast.success("Skill added!");
    } catch { toast.error("Failed to add skill"); }
  };

  const removeTeachSkill = async (skillId) => {
    try {
      const { data } = await api.delete(`/users/teach-skills/${skillId}`);
      setProfile(data);
      toast.success("Skill removed");
    } catch { toast.error("Failed to remove skill"); }
  };

  const removeLearnSkill = async (skillId) => {
    try {
      const { data } = await api.delete(`/users/learn-skills/${skillId}`);
      setProfile(data);
      toast.success("Skill removed");
    } catch { toast.error("Failed to remove skill"); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "var(--forest)" }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Toaster position="top-right"/>

      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px", background: "white",
        borderBottom: "1px solid var(--cream-dark)",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <button onClick={() => router.push("/dashboard")} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--muted)", display: "flex", alignItems: "center", gap: "8px",
          fontSize: "0.95rem"
        }}>
          <ArrowLeft size={18}/> Back to Dashboard
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "var(--forest)", fontWeight: 700 }}>
          My Profile
        </div>
        <div style={{ width: "140px" }}/>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Profile Header */}
        <div className="card" style={{ padding: "36px", marginBottom: "24px", display: "flex", gap: "28px", alignItems: "flex-start" }}>

          {/* Avatar */}
          <div style={{
            width: 88, height: 88, borderRadius: "50%", flexShrink: 0,
            background: "var(--forest)", display: "flex", alignItems: "center",
            justifyContent: "center", color: "white", fontWeight: 700,
            fontSize: "2.2rem", fontFamily: "'Playfair Display', serif"
          }}>
            {profile?.name?.[0]?.toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.8rem", color: "var(--forest)", marginBottom: "6px" }}>{profile?.name}</h1>
            <div style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: "12px" }}>{profile?.email}</div>

            {/* Bio */}
            {editingBio ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <textarea
                  className="input"
                  rows={3}
                  value={bioText}
                  onChange={e => setBioText(e.target.value)}
                  placeholder="Tell others about yourself..."
                  style={{ resize: "vertical" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.88rem" }} onClick={saveBio}>
                    <Save size={14}/> Save
                  </button>
                  <button className="btn-secondary" style={{ padding: "8px 18px", fontSize: "0.88rem" }} onClick={() => setEditingBio(false)}>
                    <X size={14}/> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <p style={{ color: profile?.bio ? "var(--charcoal)" : "var(--muted)", fontSize: "0.95rem", lineHeight: 1.6, flex: 1, fontStyle: profile?.bio ? "normal" : "italic" }}>
                  {profile?.bio || "No bio yet. Click edit to add one!"}
                </p>
                <button onClick={() => setEditingBio(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", flexShrink: 0 }}>
                  <Edit3 size={16}/>
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-end" }}>
            <div style={{ textAlign: "center", background: "var(--cream)", borderRadius: "12px", padding: "16px 24px" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "var(--forest)" }}>
                {profile?.completedSwaps || 0}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Swaps Done</div>
            </div>
            <div style={{ textAlign: "center", background: "var(--cream)", borderRadius: "12px", padding: "16px 24px" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "var(--terra)" }}>
                ⭐ {profile?.rating || 0}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Rating</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--cream-dark)", borderRadius: "8px", padding: "4px", width: "fit-content" }}>
          {["skills", "reviews"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "9px 24px", borderRadius: "6px", border: "none",
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "var(--forest)" : "var(--muted)",
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: "pointer", fontSize: "0.9rem", textTransform: "capitalize",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s"
            }}>
              {tab === "skills" ? "🎯 My Skills" : `⭐ Reviews (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* Tab — Skills */}
        {activeTab === "skills" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

            {/* Teach Skills */}
            <div className="card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ color: "var(--forest)", fontSize: "1.1rem" }}>🎓 I Teach</h3>
                <button onClick={() => setShowTeachForm(!showTeachForm)} style={{
                  background: "var(--forest)", color: "white", border: "none",
                  borderRadius: "6px", padding: "6px 14px", cursor: "pointer",
                  fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "5px"
                }}>
                  <Plus size={14}/> Add
                </button>
              </div>

              {/* Add form */}
              {showTeachForm && (
                <div style={{ background: "var(--cream)", borderRadius: "10px", padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input className="input" placeholder="Skill name (e.g. Guitar)" value={teachForm.name}
                    onChange={e => setTeachForm({ ...teachForm, name: e.target.value })}/>
                  <select className="input" value={teachForm.level}
                    onChange={e => setTeachForm({ ...teachForm, level: e.target.value })}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <input className="input" placeholder="Short description (optional)" value={teachForm.description}
                    onChange={e => setTeachForm({ ...teachForm, description: e.target.value })}/>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: "8px" }} onClick={() => setShowTeachForm(false)}>Cancel</button>
                    <button className="btn-primary" style={{ flex: 2, justifyContent: "center", padding: "8px" }} onClick={addTeachSkill}>Add Skill</button>
                  </div>
                </div>
              )}

              {/* Skills list */}
              {profile?.teachSkills?.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", fontStyle: "italic" }}>No teach skills yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {profile.teachSkills.map((s) => (
                    <div key={s._id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 14px", background: "var(--cream)", borderRadius: "8px"
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{s.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "capitalize" }}>{s.level} {s.description && `· ${s.description}`}</div>
                      </div>
                      <button onClick={() => removeTeachSkill(s._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e57373" }}>
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Learn Skills */}
            <div className="card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ color: "var(--terra)", fontSize: "1.1rem" }}>📚 I Want to Learn</h3>
                <button onClick={() => setShowLearnForm(!showLearnForm)} style={{
                  background: "var(--terra)", color: "white", border: "none",
                  borderRadius: "6px", padding: "6px 14px", cursor: "pointer",
                  fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "5px"
                }}>
                  <Plus size={14}/> Add
                </button>
              </div>

              {/* Add form */}
              {showLearnForm && (
                <div style={{ background: "var(--cream)", borderRadius: "10px", padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input className="input" placeholder="Skill name (e.g. Spanish)" value={learnForm.name}
                    onChange={e => setLearnForm({ ...learnForm, name: e.target.value })}/>
                  <select className="input" value={learnForm.urgency}
                    onChange={e => setLearnForm({ ...learnForm, urgency: e.target.value })}>
                    <option value="low">Low urgency</option>
                    <option value="medium">Medium urgency</option>
                    <option value="high">High urgency</option>
                  </select>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: "8px" }} onClick={() => setShowLearnForm(false)}>Cancel</button>
                    <button className="btn-primary" style={{ flex: 2, justifyContent: "center", padding: "8px" }} onClick={addLearnSkill}>Add Skill</button>
                  </div>
                </div>
              )}

              {/* Skills list */}
              {profile?.learnSkills?.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", fontStyle: "italic" }}>No learn skills yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {profile.learnSkills.map((s) => (
                    <div key={s._id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 14px", background: "#fce8dc", borderRadius: "8px"
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{s.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--terra)", textTransform: "capitalize" }}>{s.urgency} urgency</div>
                      </div>
                      <button onClick={() => removeLearnSkill(s._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e57373" }}>
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab — Reviews */}
        {activeTab === "reviews" && (
          <div>
            {/* Rating summary */}
            {stats && stats.totalReviews > 0 && (
              <div className="card" style={{ padding: "28px", marginBottom: "20px", display: "flex", gap: "32px", alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "3.5rem", fontWeight: 700, color: "var(--forest)", lineHeight: 1 }}>
                    {stats.averageRating}
                  </div>
                  <div style={{ color: "var(--terra)", fontSize: "1.2rem", margin: "6px 0" }}>
                    {"⭐".repeat(Math.round(stats.averageRating))}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{stats.totalReviews} reviews</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[5,4,3,2,1].map(star => (
                    <div key={star} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--muted)", width: "20px" }}>{star}⭐</span>
                      <div style={{ flex: 1, height: "8px", background: "var(--cream-dark)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: "4px", background: "var(--terra)",
                          width: `${stats.totalReviews ? (stats.breakdown?.[star] || 0) / stats.totalReviews * 100 : 0}%`,
                          transition: "width 0.6s ease"
                        }}/>
                      </div>
                      <span style={{ fontSize: "0.82rem", color: "var(--muted)", width: "20px" }}>
                        {stats.breakdown?.[star] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="card" style={{ padding: "48px", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⭐</div>
                <h3 style={{ color: "var(--forest)", marginBottom: "8px" }}>No reviews yet</h3>
                <p style={{ color: "var(--muted)" }}>Complete swaps to start receiving reviews!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {reviews.map((r) => (
                  <div key={r._id} className="card" style={{ padding: "22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%", background: "var(--forest)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: 700, flexShrink: 0
                      }}>
                        {r.from?.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{r.from?.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                        </div>
                      </div>
                      <div style={{ color: "var(--terra)", fontSize: "1.1rem" }}>
                        {"⭐".repeat(r.rating)}
                      </div>
                    </div>
                    {r.comment && (
                      <p style={{ color: "var(--charcoal)", fontSize: "0.92rem", lineHeight: 1.6, fontStyle: "italic", borderLeft: "3px solid var(--cream-dark)", paddingLeft: "14px" }}>
                        "{r.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}