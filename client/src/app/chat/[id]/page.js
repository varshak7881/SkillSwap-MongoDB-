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
  const [myName, setMyName]     = useState("");
  const [barter, setBarter]     = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [typing, setTyping]     = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    // Connect socket
    socket = io("http://localhost:5000");

    const init = async () => {
      try {
        // Get my profile
        const meRes = await api.get("/auth/me");
        const me = meRes.data;
        setMyId(me._id);
        setMyName(me.name);
        socket.emit("join", me._id);
        socket.emit("joinRoom", id);

        // Load messages
        const msgRes = await api.get(`/messages/${id}`);
        setMessages(msgRes.data);

        // Find barter from BOTH incoming and outgoing
        const [outRes, inRes] = await Promise.all([
          api.get("/barter/outgoing"),
          api.get("/barter/incoming")
        ]);

        const allBarters = [...outRes.data, ...inRes.data];
        const found = allBarters.find(r => r._id === id);

        if (found) {
          setBarter(found);
          // Figure out who the other person is
          const other = found.from?._id === me._id
            ? found.to
            : found.from;
          setOtherUser(other);
        }

        // Mark as seen
        await api.put(`/messages/${id}/seen`);

      } catch (err) {
        toast.error("Failed to load chat");
      }
    };

    init();

    // Real-time message listener
    socket.on("receiveMessage", (data) => {
      setMessages(prev => {
        // Avoid duplicate messages
        const exists = prev.some(m => m._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    // Typing indicator
    socket.on("userTyping", (data) => {
      if (data.senderId !== myId) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    const content = newMsg.trim();
    setNewMsg("");

    try {
      const { data } = await api.post("/messages", {
        barterRequestId: id,
        content
      });

      // Emit to socket room
      socket.emit("sendMessage", {
        ...data,
        barterRequestId: id
      });

      // Add to local messages immediately
      setMessages(prev => {
        const exists = prev.some(m => m._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { barterRequestId: id, senderId: myId });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isMe = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    return senderId === myId;
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

        {/* Other user avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: "50%", background: "var(--terra)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 700, fontSize: "1rem", flexShrink: 0
        }}>
          {otherUser?.name?.[0]?.toUpperCase() || "?"}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ color: "var(--cream)", fontWeight: 600, fontSize: "1rem" }}>
            {otherUser?.name || "Chat"}
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
      <div style={{
        flex: 1, overflowY: "auto", padding: "24px",
        display: "flex", flexDirection: "column", gap: "12px",
        minHeight: 0
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--muted)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>👋</div>
            <p>Say hello! Plan your first skill session here.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const mine = isMe(msg);
          return (
            <div key={msg._id || i} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "65%" }}>
                {!mine && (
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "4px", paddingLeft: "4px" }}>
                    {msg.sender?.name || otherUser?.name}
                  </div>
                )}
                <div style={{
                  padding: "12px 16px",
                  borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: mine ? "var(--forest)" : "white",
                  color: mine ? "var(--cream)" : "var(--charcoal)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  fontSize: "0.92rem", lineHeight: 1.5
                }}>
                  {msg.content}
                </div>
                <div style={{
                  fontSize: "0.72rem", color: "var(--muted)", marginTop: "4px",
                  textAlign: mine ? "right" : "left", paddingLeft: "4px"
                }}>
                  {msg.createdAt ? formatTime(msg.createdAt) : "just now"}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              background: "white", padding: "12px 16px",
              borderRadius: "16px 16px 16px 4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              display: "flex", gap: "4px", alignItems: "center"
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "var(--muted)",
                  animation: "fadeUp 0.8s ease infinite",
                  animationDelay: `${i * 0.2}s`
                }}/>
              ))}
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
          placeholder="Type a message... (Enter to send)"
          value={newMsg}
          rows={1}
          onChange={e => { setNewMsg(e.target.value); handleTyping(); }}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{ flex: 1, resize: "none", borderRadius: "24px", padding: "12px 20px" }}
        />
        <button
          onClick={handleSend}
          disabled={!newMsg.trim()}
          style={{
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