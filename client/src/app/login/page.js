"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      setAuth(data, data.token);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
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
        {/* Decorative circles */}
        <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(196,98,45,0.15)", top: "-100px", right: "-100px" }}/>
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(122,158,122,0.1)", bottom: "60px", left: "-80px" }}/>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--cream)" }}>
            Skill<span style={{ color: "var(--terra-light)" }}>Barter</span>
          </div>
        </Link>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ color: "var(--cream)", fontSize: "2.6rem", lineHeight: 1.2, marginBottom: "20px" }}>
            Welcome<br />back. 👋
          </h2>
          <p style={{ color: "var(--sage)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "340px" }}>
            Your skill exchange community is waiting. Log in to connect, learn, and grow.
          </p>

          {/* Testimonial */}
          <div style={{ marginTop: "48px", background: "rgba(255,255,255,0.07)", borderRadius: "12px", padding: "24px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ color: "var(--cream)", fontSize: "0.95rem", lineHeight: 1.7, fontStyle: "italic", marginBottom: "16px" }}>
              "I traded my Excel skills for Spanish lessons. Best decision ever — and it cost me nothing!"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src="https://i.pravatar.cc/150?img=47" alt="user" style={{ width: 40, height: 40, borderRadius: "50%" }}/>
              <div>
                <div style={{ color: "var(--cream)", fontWeight: 600, fontSize: "0.9rem" }}>Sneha R.</div>
                <div style={{ color: "var(--sage)", fontSize: "0.8rem" }}>12 swaps completed</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ color: "var(--sage)", fontSize: "0.8rem" }}>© 2026 SkillBarter</div>
      </div>

      {/* Right — Form */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px", background: "var(--cream)" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h1 style={{ fontSize: "2rem", color: "var(--forest)", marginBottom: "8px" }}>Log in</h1>
          <p style={{ color: "var(--muted)", marginBottom: "36px" }}>Don't have an account?{" "}
            <Link href="/register" style={{ color: "var(--terra)", fontWeight: 600, textDecoration: "none" }}>Sign up free</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: "8px", fontSize: "0.9rem" }}>Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: "8px", fontSize: "0.9rem" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: "44px" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--muted)"
                }}>
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}>
              {loading ? "Logging in..." : <> Log in <ArrowRight size={16}/> </>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}