"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import toast, { Toaster } from "react-hot-toast";

const steps = ["Account", "Skills", "Done"];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    teachSkill: "", teachLevel: "beginner", teachDesc: "",
    learnSkill: "", learnUrgency: "medium"
  });

  const handleRegister = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password
      });

      setAuth(data, data.token);

      // Add teach skill if provided
      if (form.teachSkill) {
        await api.post("/users/teach-skills", {
          name: form.teachSkill,
          level: form.teachLevel,
          description: form.teachDesc
        });
      }

      // Add learn skill if provided
      if (form.learnSkill) {
        await api.post("/users/learn-skills", {
          name: form.learnSkill,
          urgency: form.learnUrgency
        });
      }

      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <Toaster position="top-right"/>

      {/* Left — Decorative */}
      <div style={{
        background: "var(--forest)", display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "48px", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(196,98,45,0.15)", top: "-100px", right: "-100px" }}/>
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(122,158,122,0.1)", bottom: "60px", left: "-80px" }}/>

        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--cream)" }}>
            Skill<span style={{ color: "var(--terra-light)" }}>Barter</span>
          </div>
        </Link>

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ color: "var(--cream)", fontSize: "2.6rem", lineHeight: 1.2, marginBottom: "20px" }}>
            Join the skill<br />economy. 🌱
          </h2>
          <p style={{ color: "var(--sage)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "340px" }}>
            Share what you know, learn what you need. No money required — just your knowledge.
          </p>

          {/* Steps indicator */}
          <div style={{ marginTop: "48px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: i <= step ? "var(--terra)" : "rgba(255,255,255,0.1)",
                  color: "white", fontSize: "0.85rem", fontWeight: 600, transition: "all 0.3s"
                }}>
                  {i < step ? <Check size={16}/> : i + 1}
                </div>
                <span style={{ color: i <= step ? "var(--cream)" : "var(--sage)", fontWeight: i === step ? 600 : 400 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ color: "var(--sage)", fontSize: "0.8rem" }}>© 2026 SkillBarter</div>
      </div>

      {/* Right — Form */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px", background: "var(--cream)" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Step 0 — Account */}
          {step === 0 && (
            <div className="fade-up">
              <h1 style={{ fontSize: "2rem", color: "var(--forest)", marginBottom: "8px" }}>Create account</h1>
              <p style={{ color: "var(--muted)", marginBottom: "32px" }}>
                Already have one?{" "}
                <Link href="/login" style={{ color: "var(--terra)", fontWeight: 600, textDecoration: "none" }}>Log in</Link>
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: "8px", fontSize: "0.9rem" }}>Full Name</label>
                  <input className="input" placeholder="Ravi Kumar" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}/>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: "8px", fontSize: "0.9rem" }}>Email</label>
                  <input className="input" type="email" placeholder="you@example.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}/>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: "8px", fontSize: "0.9rem" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input className="input" type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                      style={{ paddingRight: "44px" }}/>
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                      position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "var(--muted)"
                    }}>
                      {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
                  onClick={() => {
                    if (!form.name || !form.email || !form.password) return toast.error("Fill all fields");
                    if (form.password.length < 6) return toast.error("Password too short");
                    setStep(1);
                  }}>
                  Continue <ArrowRight size={16}/>
                </button>
              </div>
            </div>
          )}

          {/* Step 1 — Skills */}
          {step === 1 && (
            <div className="fade-up">
              <h1 style={{ fontSize: "2rem", color: "var(--forest)", marginBottom: "8px" }}>Your Skills</h1>
              <p style={{ color: "var(--muted)", marginBottom: "32px" }}>Tell us what you teach and what you want to learn</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Teach */}
                <div style={{ background: "white", borderRadius: "12px", padding: "20px", border: "1.5px solid var(--cream-dark)" }}>
                  <div style={{ fontWeight: 600, color: "var(--forest)", marginBottom: "14px" }}>🎓 I can teach...</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input className="input" placeholder="e.g. Guitar, Python, Yoga" value={form.teachSkill}
                      onChange={e => setForm({ ...form, teachSkill: e.target.value })}/>
                    <select className="input" value={form.teachLevel}
                      onChange={e => setForm({ ...form, teachLevel: e.target.value })}>
                      <option value="beginner">Beginner level</option>
                      <option value="intermediate">Intermediate level</option>
                      <option value="advanced">Advanced level</option>
                    </select>
                    <input className="input" placeholder="Brief description (optional)" value={form.teachDesc}
                      onChange={e => setForm({ ...form, teachDesc: e.target.value })}/>
                  </div>
                </div>

                {/* Learn */}
                <div style={{ background: "white", borderRadius: "12px", padding: "20px", border: "1.5px solid var(--cream-dark)" }}>
                  <div style={{ fontWeight: 600, color: "var(--terra)", marginBottom: "14px" }}>📚 I want to learn...</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input className="input" placeholder="e.g. Spanish, Photography" value={form.learnSkill}
                      onChange={e => setForm({ ...form, learnSkill: e.target.value })}/>
                    <select className="input" value={form.learnUrgency}
                      onChange={e => setForm({ ...form, learnUrgency: e.target.value })}>
                      <option value="low">Low urgency</option>
                      <option value="medium">Medium urgency</option>
                      <option value="high">High urgency</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(0)}>Back</button>
                  <button className="btn-primary" style={{ flex: 2, justifyContent: "center" }}
                    onClick={handleRegister} disabled={loading}>
                    {loading ? "Creating account..." : <> Create Account <ArrowRight size={16}/> </>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Done */}
          {step === 2 && (
            <div className="fade-up" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🎉</div>
              <h1 style={{ fontSize: "2rem", color: "var(--forest)", marginBottom: "12px" }}>You're in!</h1>
              <p style={{ color: "var(--muted)", marginBottom: "32px", lineHeight: 1.7 }}>
                Welcome to SkillBarter! Your account is ready. Start exploring people to swap skills with.
              </p>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => router.push("/dashboard")}>
                Go to Dashboard <ArrowRight size={16}/>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}