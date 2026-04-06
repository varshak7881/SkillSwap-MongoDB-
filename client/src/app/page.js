"use client";
import Link from "next/link";
import { ArrowRight, Repeat2, Star, Users, Zap } from "lucide-react";

const stats = [
  { value: "2,400+", label: "Skills Listed" },
  { value: "890+",   label: "Successful Swaps" },
  { value: "4.9",    label: "Avg. Rating" },
];

const features = [
  { icon: <Repeat2 size={24}/>, title: "Swap, Don't Pay", desc: "Exchange your expertise directly. No money changes hands — just pure knowledge sharing." },
  { icon: <Star size={24}/>,    title: "Verified Reviews", desc: "Every swap ends with honest ratings so you always know who you're learning from." },
  { icon: <Users size={24}/>,   title: "Smart Matching",  desc: "Our algorithm finds people whose skills perfectly complement yours." },
  { icon: <Zap size={24}/>,     title: "Instant Chat",    desc: "Real-time messaging with your swap partner to plan sessions easily." },
];

const skills = [
  { teach: "Python",       learn: "Spanish",    name: "Arjun M.",   avatar: "https://i.pravatar.cc/150?img=11", rating: 4.9 },
  { teach: "Watercolour",  learn: "Guitar",     name: "Sneha R.",   avatar: "https://i.pravatar.cc/150?img=47", rating: 5.0 },
  { teach: "Yoga",         learn: "JavaScript", name: "Kiran P.",   avatar: "https://i.pravatar.cc/150?img=32", rating: 4.8 },
  { teach: "Photography",  learn: "Cooking",    name: "Divya S.",   avatar: "https://i.pravatar.cc/150?img=25", rating: 4.7 },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 60px", borderBottom: "1px solid var(--cream-dark)",
        background: "rgba(245,240,232,0.95)", backdropFilter: "blur(10px)",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--forest)" }}>
          Skill<span style={{ color: "var(--terra)" }}>Barter</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link href="/explore" style={{ color: "var(--charcoal)", textDecoration: "none", fontWeight: 500 }}>Explore</Link>
          <Link href="/login"><button className="btn-secondary" style={{ padding: "8px 20px" }}>Log in</button></Link>
          <Link href="/register"><button className="btn-primary" style={{ padding: "8px 20px" }}>Get Started</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "100px 60px 80px", maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
        <div>
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#fce8dc", color: "var(--terra)", padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 600, marginBottom: "24px" }}>
            ✦ Peer-to-Peer Skill Exchange
          </div>
          <h1 className="fade-up fade-up-delay-1" style={{ fontSize: "clamp(2.5rem, 5vw, 3.8rem)", lineHeight: 1.15, color: "var(--forest)", marginBottom: "24px" }}>
            Teach what you know.<br />
            <em>Learn what you don't.</em>
          </h1>
          <p className="fade-up fade-up-delay-2" style={{ fontSize: "1.1rem", color: "var(--muted)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "480px" }}>
            SkillBarter connects people who want to exchange skills — no money, no courses, just genuine human knowledge sharing.
          </p>
          <div className="fade-up fade-up-delay-3" style={{ display: "flex", gap: "12px" }}>
            <Link href="/register"><button className="btn-primary">Start Swapping <ArrowRight size={16}/></button></Link>
            <Link href="/explore"><button className="btn-secondary">Browse Skills</button></Link>
          </div>

          {/* Stats */}
          <div className="fade-up fade-up-delay-4" style={{ display: "flex", gap: "36px", marginTop: "52px", paddingTop: "36px", borderTop: "1px solid var(--cream-dark)" }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--forest)" }}>{s.value}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Cards */}
        <div style={{ position: "relative", height: "480px" }}>
          {skills.slice(0, 3).map((s, i) => (
            <div key={i} className="card fade-up" style={{
              position: "absolute", padding: "20px 24px", width: "260px",
              top:  i === 0 ? "0px"   : i === 1 ? "160px" : "300px",
              left: i === 0 ? "60px"  : i === 1 ? "0px"   : "80px",
              animationDelay: `${0.2 + i * 0.15}s`, opacity: 0,
              zIndex: 3 - i
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <img src={s.avatar} alt={s.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}/>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>⭐ {s.rating}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className="tag">Teaches {s.teach}</span>
                <Repeat2 size={14} color="var(--muted)"/>
                <span className="tag tag-terra">Learns {s.learn}</span>
              </div>
            </div>
          ))}
          {/* Decorative blob */}
          <div style={{
            position: "absolute", width: "300px", height: "300px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,98,45,0.12) 0%, transparent 70%)",
            top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 0
          }}/>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: "var(--forest)", padding: "80px 60px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ color: "var(--cream)", textAlign: "center", fontSize: "2.4rem", marginBottom: "12px" }}>
            Why SkillBarter?
          </h2>
          <p style={{ color: "var(--sage)", textAlign: "center", marginBottom: "56px", fontSize: "1.05rem" }}>
            The better way to grow your skills
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.06)", borderRadius: "12px",
                padding: "32px 24px", border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s ease", cursor: "default"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              >
                <div style={{ color: "var(--terra-light)", marginBottom: "16px" }}>{f.icon}</div>
                <h3 style={{ color: "var(--cream)", fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", marginBottom: "10px" }}>{f.title}</h3>
                <p style={{ color: "var(--sage)", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Swappers */}
      <section style={{ padding: "80px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
          <div>
            <h2 style={{ fontSize: "2.2rem", color: "var(--forest)" }}>Featured Swappers</h2>
            <p style={{ color: "var(--muted)", marginTop: "8px" }}>People ready to exchange skills with you</p>
          </div>
          <Link href="/explore" style={{ color: "var(--terra)", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
            View all <ArrowRight size={16}/>
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {skills.map((s, i) => (
            <div key={i} className="card" style={{ padding: "24px", cursor: "pointer" }}>
              <img src={s.avatar} alt={s.name} style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }}/>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>{s.name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "12px" }}>⭐ {s.rating} rating</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <span className="tag">🎓 {s.teach}</span>
                <span className="tag tag-terra">📚 {s.learn}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--cream-dark)", padding: "80px 60px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.6rem", color: "var(--forest)", marginBottom: "16px" }}>
          Ready to start swapping?
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "1.05rem", marginBottom: "32px" }}>
          Join hundreds of people already exchanging skills every day.
        </p>
        <Link href="/register">
          <button className="btn-primary" style={{ fontSize: "1rem", padding: "14px 36px" }}>
            Create Free Account <ArrowRight size={16}/>
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--forest)", padding: "32px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: "var(--cream)" }}>
          Skill<span style={{ color: "var(--terra-light)" }}>Barter</span>
        </div>
        <div style={{ color: "var(--sage)", fontSize: "0.85rem" }}>
          © 2026 SkillBarter. Built with MongoDB + Next.js
        </div>
      </footer>
    </main>
  );
}