"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import api from "@/lib/axios";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

let socket;

export default function ChatPage() {
  const { id } = useParams();
  const router  = useRouter();

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg]     = useState("");
  const [myId, setMyId]         = useState(null);
  const [barter, setBarter]     = useState(null);
  const [typing, setTyping]     = useState(false);
  const bottomRef               = useRef(null);
  const typingTimer             = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    // Connect socket
    socket = io("http://localhost:5000");

    // Get my profile
    api.get("/auth/me").then(res => {
      setMyId(res.data._id);
      socket.emit("join", res.data._id);
    });

    // Join this chat room
    socket.emit("joinRoom", id);

    // Load messages
    api.get(`/messages/${id}`)
      .then(res => setMessages(res.data))
      .catch(() => toast.error("Failed to load messages"));

    // Load barter info
    api.get("/barter/outgoing")
      .then(res => {
        const found = res.data.find(r => r._id === id);
        if (found) setBarter(found);
      });

    // Real-time message
    socket.on("receiveMessage", (data) => {
      setMessages(prev => [...prev, data]);
    });

    // Typing indicator
    socket.on("userTyping", () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    });

    // Mark as seen
    api.put(`/messages/${id}/seen`).catch(() => {});

    return () => socket.disconnect();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    const content = newMsg.trim();
    setNewMsg("");

    try {
      const { data } = await api.post("/messages", { barterRequestId: id, content });
      socket.emit("sendMessage", { ...data, barterRequestId: id });
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { barterRequestId: id });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column" }}>
      <Toaster position="top-right"/>

      {/* Header */}
      <div style={{
        background: "var(--forest)", padding: "16px 24px",
        display: "flex", alignItems: "center", gap: "16px",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <button onClick={() => router.push("/dashboard")} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--sage)", display: "flex", alignItems: "center", gap: "6px"
        }}>
          <ArrowLeft size={20}/>
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "var(--cream)", fontWeight: 600 }}>
            Skill Swap Chat
          </div>
          {barter && (
            <div style={{ fontSize: "0.78rem", color: "var(--sage)" }}>
              {barter.offeredSkill} ↔ {barter.wantedSkill}
            </div>
          )}
        </div>

        <div style={{ background: "rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: "20px" }}>
          <span style={{ color: "var(--sage)", fontSize: "0.8rem" }}>🟢 Active Swap</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--muted)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>👋</div>
            <p>Start the conversation! Introduce yourself and plan your first session.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender?._id === myId || msg.sender === myId;
          return (
            <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "65%" }}>
                {!isMe && (
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "4px", paddingLeft: "4px" }}>
                    {msg.sender?.name}
                  </div>
                )}
                <div style={{
                  padding: "12px 16px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: isMe ? "var(--forest)" : "white",
                  color: isMe ? "var(--cream)" : "var(--charcoal)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  fontSize: "0.92rem", lineHeight: 1.5
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "4px", textAlign: isMe ? "right" : "left", paddingLeft: "4px" }}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: "white", padding: "10px 16px", borderRadius: "16px 16px 16px 4px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "var(--muted)",
                    animation: "fadeUp 0.6s ease infinite", animationDelay: `${i * 0.15}s`
                  }}/>
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{
        padding: "16px 24px", background: "white",
        borderTop: "1px solid var(--cream-dark)",
        display: "flex", gap: "12px", alignItems: "flex-end",
        position: "sticky", bottom: 0
      }}>
        <textarea
          className="input"
          placeholder="Type a message..."
          value={newMsg}
          rows={1}
          onChange={e => { setNewMsg(e.target.value); handleTyping(); }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          style={{ flex: 1, resize: "none", borderRadius: "24px", padding: "12px 20px" }}
        />
        <button onClick={handleSend} disabled={!newMsg.trim()} style={{
          background: newMsg.trim() ? "var(--forest)" : "var(--cream-dark)",
          color: newMsg.trim() ? "white" : "var(--muted)",
          border: "none", borderRadius: "50%", width: 46, height: 46,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: newMsg.trim() ? "pointer" : "default",
          transition: "all 0.2s", flexShrink: 0
        }}>
          <Send size={18}/>
        </button>
      </div>
    </div>
  );
}