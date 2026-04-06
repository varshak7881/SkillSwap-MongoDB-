"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Repeat2, X, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";

const LEVELS    = ["all", "beginner", "intermediate", "advanced"];
const SKILL_SUGGESTIONS = ["Guitar", "Python", "Yoga", "Spanish", "Photography", "Cooking", "JavaScript", "Drawing", "Piano", "React"];

export default function ExplorePage() {
  const router  = useRouter();
  const [users, setUsers]             = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [level, setLevel]             = useState("all");
  const [showModal, setShowModal]     = useState(false);
  const [selected, setSelected]       = useState(null);
  const [myProfile, setMyProfile]     = useState(null);
  const [requestForm, setRequestForm] = useState({ offeredSkill: "", wantedSkill: "", message: "" });
  const [sending, setSending]         = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchData();
  }, []);

  useEffect(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.teachSkills?.some(s => s.name.toLowerCase().includes(q)) ||
        u.name.toLowerCase().includes(q)
      );
    }
    if (level !== "all") {
      result = result.filter(u =>
        u.teachSkills?.some(s => s.level === level)
      );
    }
    setFiltered(result);
  }, [search, level, users]);

  const fetchData = async () => {
    try {
      const [meRes, usersRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/users/match").catch(() => ({ data: [] }))
      ]);
      setMyProfile(meRes.data);

      // If no matches, fetch all users differently
      if (usersRes.data.length === 0) {
        // Show empty state with suggestions
        setUsers([]);
      } else {
        setUsers(usersRes.data);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openRequest = (user) => {
    setSelected(user);
    setShowModal(true);
    setRequestForm({ offeredSkill: "", wantedSkill: "", message: "" });
  };

  const sendRequest = async () => {
    if (!requestForm.offeredSkill || !requestForm.wantedSkill) {
      return toast.error("Fill in both skills");
    }
    setSending(true);
    try {
      await api.post("/barter", {
        to: selected._id,
        offeredSkill: requestForm.offeredSkill,
        wantedSkill:  requestForm.wantedSkill,
        message:      requestForm.message
      });
      toast.success("Swap request sent! 🎉");
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={18}/> Dashboard
          </button>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "var(--forest)", fontWeight: 700 }}>
            Explore Skills
          </div>
        </div>
        <Link href="/dashboard">
          <button className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.9rem" }}>My Dashboard</button>
        </Link>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Search & Filter */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, position: "relative", minWidth: "240px" }}>
            <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}/>
            <input
              className="input"
              placeholder="Search by skill or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: "44px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)} style={{
                padding: "10px 18px", borderRadius: "6px", border: "1.5px solid",
                borderColor: level === l ? "var(--forest)" : "var(--cream-dark)",
                background: level === l ? "var(--forest)" : "white",
                color: level === l ? "var(--cream)" : "var(--charcoal)",
                cursor: "pointer", fontSize: "0.88rem", fontWeight: 500,
                textTransform: "capitalize", transition: "all 0.2s"
              }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Skill suggestion chips */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)", alignSelf: "center" }}>Try:</span>
          {SKILL_SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setSearch(s)} style={{
              padding: "5px 14px", borderRadius: "20px", border: "1px solid var(--cream-dark)",
              background: search === s ? "var(--forest)" : "white",
              color: search === s ? "var(--cream)" : "var(--charcoal)",
              cursor: "pointer", fontSize: "0.82rem", transition: "all 0.2s"
            }}>
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "var(--muted)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: "64px", textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "20px" }}>🔍</div>
            <h3 style={{ color: "var(--forest)", fontSize: "1.4rem", marginBottom: "10px" }}>No matches found</h3>
            <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
              Add more skills you want to learn in your profile to see matches here!
            </p>
            <Link href="/profile"><button className="btn-primary">Update Profile</button></Link>
          </div>
        ) : (
          <>
            <p style={{ color: "var(--muted)", marginBottom: "20px", fontSize: "0.9rem" }}>
              Showing <strong>{filtered.length}</strong> people who can teach what you want to learn
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {filtered.map((u) => (
                <div key={u._id} className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

                  {/* User header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                      background: `hsl(${u.name.charCodeAt(0) * 5}, 50%, 35%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 700, fontSize: "1.2rem"
                    }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem" }}>{u.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                        ⭐ {u.rating || 0} · {u.completedSwaps || 0} swaps completed
                      </div>
                    </div>
                    {u.matchScore && (
                      <div style={{ background: "#e8f5e8", color: "var(--forest)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700 }}>
                        {u.matchScore} match
                      </div>
                    )}
                  </div>

                  {/* Teach skills */}
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "8px", fontWeight: 500 }}>🎓 TEACHES</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {u.teachSkills?.slice(0, 4).map((s, i) => (
                        <span key={i} className="tag" style={{ fontSize: "0.78rem" }}>{s.name} · {s.level}</span>
                      ))}
                    </div>
                  </div>

                  {/* Learn skills */}
                  {u.learnSkills?.length > 0 && (
                    <div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "8px", fontWeight: 500 }}>📚 WANTS TO LEARN</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {u.learnSkills?.slice(0, 3).map((s, i) => (
                          <span key={i} className="tag tag-terra" style={{ fontSize: "0.78rem" }}>{s.name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <button onClick={() => openRequest(u)} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}>
                    <Repeat2 size={16}/> Request Swap
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Request Modal */}
      {showModal && selected && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 200, padding: "20px"
        }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.4rem", color: "var(--forest)" }}>Request Swap</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
                <X size={20}/>
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", background: "var(--cream)", borderRadius: "10px", padding: "14px" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: `hsl(${selected.name.charCodeAt(0) * 5}, 50%, 35%)`,
                display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700
              }}>
                {selected.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{selected.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>⭐ {selected.rating || 0}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontWeight: 500, marginBottom: "8px", fontSize: "0.9rem" }}>
                  🎓 I will teach them...
                </label>
                <select className="input" value={requestForm.offeredSkill}
                  onChange={e => setRequestForm({ ...requestForm, offeredSkill: e.target.value })}>
                  <option value="">Select a skill you teach</option>
                  {myProfile?.teachSkills?.map((s, i) => (
                    <option key={i} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 500, marginBottom: "8px", fontSize: "0.9rem" }}>
                  📚 I want to learn...
                </label>
                <select className="input" value={requestForm.wantedSkill}
                  onChange={e => setRequestForm({ ...requestForm, wantedSkill: e.target.value })}>
                  <option value="">Select a skill they teach</option>
                  {selected?.teachSkills?.map((s, i) => (
                    <option key={i} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 500, marginBottom: "8px", fontSize: "0.9rem" }}>
                  Message (optional)
                </label>
                <textarea className="input" rows={3} placeholder="Introduce yourself and why you want to swap..."
                  value={requestForm.message}
                  onChange={e => setRequestForm({ ...requestForm, message: e.target.value })}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2, justifyContent: "center" }}
                  onClick={sendRequest} disabled={sending}>
                  {sending ? "Sending..." : "Send Swap Request 🤝"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}