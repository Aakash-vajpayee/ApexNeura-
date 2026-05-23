import { useState, useRef, useCallback, useEffect } from "react";

const API = "https://grunt-congrats-kosher.ngrok-free.dev";

const MODS = {
  deepdown: {
    id: "deepdown",
    name: "DeepDown",
    sub: "Dermatological Analysis Engine",
    tag: "SKIN · CV · EfficientNet-B4",
    color: "#00ffaa",
    glow: "#00ffaa40",
    desc: "Upload a skin lesion image for AI-powered classification, malignancy detection, and risk stratification.",
    accepts: "image/jpeg,image/png,image/webp",
    hint: "JPG · PNG · WEBP · Max 10MB",
    icon: "◈",
    grad: "linear-gradient(135deg,#00ffaa15,#00ffaa05)",
  },
  alzmind: {
    id: "alzmind",
    name: "AlzMind",
    sub: "Neurological Imaging Engine",
    tag: "MRI · ViT · LOCAL MODEL",
    color: "#a78bfa",
    glow: "#a78bfa40",
    desc: "Upload a brain MRI scan for Alzheimer's staging, CDR scoring, and neurodegeneration analysis.",
    accepts: "image/jpeg,image/png,image/webp,.dcm",
    hint: "DICOM · JPG · PNG · Max 15MB",
    icon: "◉",
    grad: "linear-gradient(135deg,#a78bfa15,#a78bfa05)",
  },
};

const RISK_CFG = {
  LOW: { col: "#00ffaa", label: "LOW RISK", pulse: false },
  MODERATE: { col: "#fbbf24", label: "MODERATE", pulse: true },
  HIGH: { col: "#f87171", label: "HIGH RISK", pulse: true },
  CRITICAL: { col: "#ef4444", label: "⚠ CRITICAL", pulse: true },
};

const fmtSize = (b) =>
  b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return (
    d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );
};

// ── Particles Background ─────────────────────────────────────────
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.4,
      col: Math.random() > 0.5 ? "#00ffaa" : "#a78bfa",
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = c.width;
        if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height;
        if (p.y > c.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col + "55";
        ctx.fill();
      });
      pts.forEach((a, i) =>
        pts.slice(i + 1).forEach((b) => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(100,180,255,${0.12 * (1 - d / 110)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }),
      );
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.45,
      }}
    />
  );
}

// ── Chat Panel ───────────────────────────────────────────────────
const CHAT_CSS = `
.chat-panel{
  border:1px solid var(--border2);
  border-radius:14px 14px 0 0;
  overflow:hidden;
  background:rgba(7,18,38,0.85);
  display:flex;
  flex-direction:column;
  height:420px;
  position:relative;
}
.chat-panel::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,var(--c),var(--c),transparent);
  animation:pulse 2s ease infinite;
}
.chat-header{
  padding:14px 20px;
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:10px;
  background:rgba(0,0,0,0.2);
  flex-shrink:0;
}
.chat-avatar{
  width:32px;height:32px;border-radius:50%;
  background:linear-gradient(135deg,var(--c),#a78bfa);
  display:flex;align-items:center;justify-content:center;
  font-size:14px;flex-shrink:0;
  box-shadow:0 0 12px var(--glow);
}
.chat-hdr-name{
  font-family:'Share Tech Mono',monospace;font-size:12px;
  color:var(--bright);letter-spacing:.1em;
}
.chat-hdr-status{
  font-family:'Share Tech Mono',monospace;font-size:9px;
  color:var(--c);letter-spacing:.1em;opacity:.7;
  display:flex;align-items:center;gap:5px;
}
.chat-hdr-dot{
  width:5px;height:5px;border-radius:50%;
  background:var(--c);animation:pulse 1.5s ease infinite;
}
.chat-turn-indicator{
  margin-left:auto;
  font-family:'Share Tech Mono',monospace;font-size:9px;
  color:var(--muted);letter-spacing:.1em;
  background:rgba(255,255,255,0.03);
  border:1px solid var(--border);
  padding:4px 10px;border-radius:4px;
}
.chat-messages{
  flex:1;overflow-y:auto;padding:16px;
  display:flex;flex-direction:column;gap:12px;
}
.chat-messages::-webkit-scrollbar{width:3px}
.chat-messages::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
.chat-bubble{
  max-width:80%;padding:11px 15px;
  border-radius:10px;font-size:13px;
  line-height:1.65;animation:fadeUp 0.3s ease;
}
.chat-bubble.bot{
  background:rgba(255,255,255,0.04);
  border:1px solid var(--border2);
  color:var(--text);align-self:flex-start;
  border-bottom-left-radius:3px;
}
.chat-bubble.user{
  background:rgba(0,0,0,0.35);
  border:1px solid var(--border);
  color:var(--bright);align-self:flex-end;
  border-bottom-right-radius:3px;
}
.bubble-sender{
  font-family:'Share Tech Mono',monospace;font-size:9px;
  letter-spacing:.12em;margin-bottom:5px;opacity:.7;
}
.chat-bubble.bot .bubble-sender{ color:var(--c); }
.chat-bubble.user .bubble-sender{ color:var(--muted); text-align:right; }
.chat-typing{
  align-self:flex-start;
  background:rgba(255,255,255,0.04);
  border:1px solid var(--border2);
  border-radius:10px;border-bottom-left-radius:3px;
  padding:12px 16px;display:flex;gap:5px;align-items:center;
}
.typing-dot{
  width:6px;height:6px;border-radius:50%;
  background:var(--c);opacity:0.4;
  animation:blink 1.2s ease infinite;
}
.typing-dot:nth-child(2){animation-delay:.2s}
.typing-dot:nth-child(3){animation-delay:.4s}
.chat-input-wrap{
  padding:12px 14px;
  border-top:1px solid var(--border);
  display:flex;gap:10px;align-items:flex-end;
  background:rgba(0,0,0,0.15);flex-shrink:0;
}
.chat-input{
  flex:1;background:rgba(0,0,0,0.3);
  border:1px solid var(--border);border-radius:8px;
  padding:10px 14px;color:var(--bright);
  font-family:'Exo 2',sans-serif;font-size:13px;
  outline:none;resize:none;max-height:100px;
  line-height:1.5;transition:border-color .2s;
  min-height:40px;
}
.chat-input:focus{border-color:var(--c);box-shadow:0 0 10px var(--glow)}
.chat-input::placeholder{color:var(--muted);font-size:12px}
.chat-input:disabled{opacity:.4;cursor:not-allowed}
.chat-send{
  background:var(--c);border:none;
  width:38px;height:38px;border-radius:8px;
  cursor:pointer;display:flex;align-items:center;
  justify-content:center;flex-shrink:0;
  transition:all .2s;font-size:15px;color:#040d1a;font-weight:700;
}
.chat-send:hover{box-shadow:0 0 14px var(--glow);transform:scale(1.05)}
.chat-send:disabled{opacity:.3;cursor:not-allowed;transform:none;box-shadow:none}
.chat-done-btn{
  width:100%;padding:16px;
  background:rgba(0,0,0,0.2);
  border:1px solid var(--c);
  border-top:none;
  border-radius:0 0 14px 14px;
  color:var(--c);font-family:'Rajdhani',sans-serif;
  font-size:15px;font-weight:700;letter-spacing:.18em;
  cursor:pointer;transition:all .3s;
}
.chat-done-btn:hover{background:rgba(0,255,170,0.06);box-shadow:0 4px 20px var(--glow)}
`;

function ChatPanel({
  module,
  moduleColor,
  moduleGlow,
  moduleGrad,
  sessionId,
  onChatComplete,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turn, setTurn] = useState(0);
  const [done, setDone] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Greeting on mount
  useEffect(() => {
    const greeting =
      module === "deepdown"
        ? "Namaskar! Main NeuraBot hoon — ApexNeura ka AI medical assistant.\n\nAnalysis se pehle aapki skin concern ke baare mein kuch important questions poochhna chahta hoon.\n\nAapko yeh skin problem kitne time se hai? Aur kya aapne koi changes notice kiye hain — jaise size, color, ya shape mein?"
        : "Namaskar! Main NeuraBot hoon — ApexNeura ka AI medical assistant.\n\nBrain MRI scan upload karne se pehle, kuch zaruri information lena chahta hoon.\n\nAap ya patient mein kaunse memory ya cognitive symptoms aa rahe hain? Yeh symptoms kab se shuru hue hain?";
    setMessages([{ role: "bot", content: greeting }]);
  }, [module]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || done) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text, module }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
      const newTurn = turn + 1;
      setTurn(newTurn);
      if (newTurn >= 3) setTimeout(() => setDone(true), 2000);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠ Network error. Backend running hai?" },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{CHAT_CSS}</style>
      <div
        style={{
          "--c": moduleColor,
          "--glow": moduleGlow,
          "--grad": moduleGrad,
        }}
      >
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-avatar">🧠</div>
            <div>
              <div className="chat-hdr-name">NEURABOT</div>
              <div className="chat-hdr-status">
                <div className="chat-hdr-dot" /> AI MEDICAL ASSISTANT · ACTIVE
              </div>
            </div>
            <div className="chat-turn-indicator">
              {done ? "✓ COMPLETE" : `Q ${Math.min(turn + 1, 3)} / 3`}
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-bubble ${m.role === "bot" ? "bot" : "user"}`}
              >
                <div className="bubble-sender">
                  {m.role === "bot" ? "NEURABOT" : "YOU"}
                </div>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="chat-typing">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!done && (
            <div className="chat-input-wrap">
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder="Type your response... (Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                disabled={loading}
              />
              <button
                className="chat-send"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
              >
                ↑
              </button>
            </div>
          )}
        </div>

        {/* Proceed button after 3 questions */}
        {done && (
          <button className="chat-done-btn" onClick={onChatComplete}>
            ⬆ PROCEED TO IMAGE UPLOAD →
          </button>
        )}
      </div>
    </>
  );
}

// ── CSS ──────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#040d1a;--bg2:#071226;--bg3:#0a1930;
  --border:#0f2a4a;--border2:#1a3a60;
  --text:#7ab3d4;--bright:#c8e8ff;--muted:#2a4a6a;
  --dd:#00ffaa;--az:#a78bfa;--warn:#fbbf24;--danger:#f87171;
}
body{background:var(--bg);color:var(--text);font-family:'Exo 2',sans-serif;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--muted);border-radius:2px}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 8px currentColor}50%{box-shadow:0 0 24px currentColor,0 0 48px currentColor}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes scanbar{0%{top:-4px}100%{top:100%}}
@keyframes blink{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes cornerBlink{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes scanlines{0%{background-position:0 0}100%{background-position:0 100px}}

.hdr{position:fixed;top:0;left:0;right:0;z-index:100;padding:14px 32px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,rgba(4,13,26,.97) 0%,rgba(4,13,26,.8) 100%);backdrop-filter:blur(16px);border-bottom:1px solid rgba(15,42,74,.6)}
.hdr-logo{font-family:'Share Tech Mono',monospace;font-size:17px;color:var(--bright);letter-spacing:.2em;display:flex;align-items:center;gap:10px;flex-shrink:0;cursor:pointer}
.hdr-dot{width:8px;height:8px;border-radius:50%;background:var(--dd);animation:pulseGlow 2s ease infinite}
.hdr-center{display:flex;align-items:center;gap:6px}
.hdr-tab{font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.12em;padding:7px 18px;border-radius:6px;border:1px solid transparent;cursor:pointer;background:transparent;transition:all .2s;color:var(--muted);display:flex;align-items:center;gap:7px}
.hdr-tab:hover{color:var(--text);border-color:var(--border)}
.hdr-tab.active{color:var(--bright);border-color:var(--border2);background:rgba(255,255,255,.03)}
.hdr-tab.active.dd{color:var(--dd);border-color:rgba(0,255,170,.3);background:rgba(0,255,170,.04)}
.hdr-tab.active.hist{color:var(--az);border-color:rgba(167,139,250,.3);background:rgba(167,139,250,.04)}
.tab-badge{font-family:'Share Tech Mono',monospace;font-size:9px;padding:1px 6px;border-radius:3px;background:rgba(167,139,250,.15);color:var(--az);border:1px solid rgba(167,139,250,.2)}
.hdr-right{display:flex;align-items:center;gap:14px;flex-shrink:0}
.hdr-status{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);display:flex;align-items:center;gap:14px}
.hdr-si{display:flex;align-items:center;gap:5px}
.hdr-sd{width:5px;height:5px;border-radius:50%}
.hdr-sd.on{background:var(--dd);animation:pulse 2s ease infinite}
.user-chip{display:flex;align-items:center;gap:8px;padding:5px 12px;border:1px solid var(--border);border-radius:7px;background:rgba(255,255,255,.02)}
.user-avatar{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,var(--dd),var(--az));display:flex;align-items:center;justify-content:center;font-family:'Share Tech Mono',monospace;font-size:10px;font-weight:700;color:#040d1a;flex-shrink:0}
.user-name{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.logout-btn{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.1em;color:#f87171;background:transparent;border:1px solid rgba(248,113,113,.22);padding:6px 12px;border-radius:6px;cursor:pointer;transition:all .2s}
.logout-btn:hover{background:rgba(248,113,113,.07);border-color:rgba(248,113,113,.45)}
.save-toast{position:fixed;bottom:28px;right:28px;z-index:999;padding:12px 20px;background:#071226;border:1px solid var(--dd);border-radius:10px;font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--dd);letter-spacing:.1em;animation:fadeUp .3s ease;box-shadow:0 0 20px rgba(0,255,170,.15)}
.save-toast.err{border-color:var(--danger);color:var(--danger);box-shadow:0 0 20px rgba(248,113,113,.15)}
.warn-strip{position:fixed;top:52px;left:0;right:0;z-index:99;padding:5px 32px;display:flex;align-items:center;gap:10px;font-family:'Share Tech Mono',monospace;font-size:10px;color:#fbbf2450;letter-spacing:.1em;background:linear-gradient(90deg,transparent,#fbbf2406,transparent);border-bottom:1px solid #fbbf2410}
.scanlines-overlay{position:fixed;inset:0;z-index:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,170,.012) 2px,rgba(0,255,170,.012) 4px);animation:scanlines 6s linear infinite;opacity:.8}
.main-wrap{position:relative;z-index:1;padding:110px 24px 40px;display:flex;flex-direction:column;align-items:center}
.eyebrow{font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.28em;color:var(--muted);margin-bottom:20px;text-align:center;animation:fadeUp .6s ease .2s both}
.hero-title{font-family:'Rajdhani',sans-serif;font-size:clamp(52px,8vw,90px);font-weight:700;color:var(--bright);line-height:1;text-align:center;margin-bottom:12px;animation:fadeUp .6s ease .3s both}
.hero-title .dd{color:var(--dd);text-shadow:0 0 30px var(--dd)}
.hero-title .az{color:var(--az);text-shadow:0 0 30px var(--az)}
.hero-sub-line{font-family:'Rajdhani',sans-serif;font-size:clamp(16px,2.5vw,22px);font-weight:300;color:var(--text);text-align:center;opacity:.6;margin-bottom:12px;letter-spacing:.08em;animation:fadeUp .6s ease .4s both}
.hero-desc{font-size:14px;color:var(--text);text-align:center;max-width:500px;line-height:1.8;margin-bottom:52px;opacity:.6;animation:fadeUp .6s ease .5s both}
.stats-row{display:flex;gap:0;margin-bottom:60px;animation:fadeUp .6s ease .6s both;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--bg2)}
.stat{text-align:center;padding:20px 36px}.stat+.stat{border-left:1px solid var(--border)}
.stat-n{font-family:'Rajdhani',sans-serif;font-size:30px;font-weight:700;color:var(--bright);display:block;line-height:1}
.stat-n.c-dd{color:var(--dd)}.stat-n.c-az{color:var(--az)}
.stat-l{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:.15em;margin-top:4px}
.mod-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;width:100%;max-width:880px;margin-bottom:36px;animation:fadeUp .6s ease .7s both}
.mod-card{position:relative;border-radius:14px;padding:30px;cursor:pointer;overflow:hidden;transition:transform .25s,box-shadow .25s;border:1px solid var(--border);background:var(--bg2);animation:floatY 7s ease infinite}
.mod-card:last-child{animation-delay:3.5s}
.mod-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .3s;background:var(--grad)}
.mod-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--c),transparent);opacity:0;transition:opacity .3s}
.mod-card:hover::before,.mod-card.sel::before,.mod-card:hover::after,.mod-card.sel::after{opacity:1}
.mod-card:hover{transform:translateY(-5px) scale(1.01);box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 50px var(--glow)}
.mod-card.sel{border-color:var(--c);box-shadow:0 0 50px var(--glow)}
.corner{position:absolute;width:12px;height:12px;animation:cornerBlink 3s ease infinite}
.corner.tl{top:8px;left:8px;border-top:1.5px solid var(--c);border-left:1.5px solid var(--c)}
.corner.tr{top:8px;right:8px;border-top:1.5px solid var(--c);border-right:1.5px solid var(--c);animation-delay:1s}
.corner.bl{bottom:8px;left:8px;border-bottom:1.5px solid var(--c);border-left:1.5px solid var(--c);animation-delay:.5s}
.corner.br{bottom:8px;right:8px;border-bottom:1.5px solid var(--c);border-right:1.5px solid var(--c);animation-delay:1.5s}
.mod-icon{font-size:38px;color:var(--c);margin-bottom:14px;display:block;text-shadow:0 0 20px var(--c)}
.mod-tag{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.16em;color:var(--c);opacity:.7;margin-bottom:8px}
.mod-name{font-family:'Rajdhani',sans-serif;font-size:32px;font-weight:700;color:var(--bright);margin-bottom:4px;line-height:1}
.mod-sub{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);margin-bottom:14px}
.mod-desc{font-size:13px;color:var(--text);line-height:1.7;opacity:.75}
.panel{width:100%;max-width:880px;background:var(--bg2);border:1px solid var(--border);border-radius:16px;overflow:hidden;animation:fadeUp .4s ease}
.panel-bar{height:2px;background:linear-gradient(90deg,transparent,var(--c),var(--c),transparent);animation:pulse 2s ease infinite}
.panel-hdr{padding:22px 30px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.panel-tag{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--c);letter-spacing:.16em;margin-bottom:4px}
.panel-name{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:var(--bright)}
.back-btn{font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.1em;color:var(--muted);background:transparent;border:1px solid var(--border);padding:8px 16px;border-radius:6px;cursor:pointer;transition:all .2s}
.back-btn:hover{color:var(--bright);border-color:var(--border2)}
.panel-body{padding:30px}
.upload-zone{border:1px dashed var(--border2);border-radius:12px;padding:60px 32px;text-align:center;cursor:pointer;transition:all .3s;position:relative;overflow:hidden}
.upload-zone:hover,.upload-zone.over{border-color:var(--c);background:var(--grad);box-shadow:0 0 30px var(--glow)}
.upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.upload-icon{font-size:46px;color:var(--c);margin-bottom:18px;display:block;text-shadow:0 0 20px var(--c)}
.upload-title{font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:600;color:var(--bright);margin-bottom:8px}
.upload-hint{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:.1em}
.prev-wrap{display:flex;gap:26px;align-items:flex-start}
.prev-img-wrap{position:relative;flex-shrink:0;border-radius:10px;overflow:hidden;border:1px solid var(--border)}
.prev-img{width:170px;height:170px;object-fit:cover;display:block}
.prev-scan{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,var(--c),transparent);animation:scanbar 2s linear infinite;box-shadow:0 0 10px var(--c)}
.prev-corners::before,.prev-corners::after{content:'';position:absolute;width:16px;height:16px}
.prev-corners::before{top:6px;left:6px;border-top:2px solid var(--c);border-left:2px solid var(--c)}
.prev-corners::after{bottom:6px;right:6px;border-bottom:2px solid var(--c);border-right:2px solid var(--c)}
.prev-info{flex:1}
.prev-fname{font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:600;color:var(--bright);margin-bottom:4px;word-break:break-all}
.prev-size{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--muted);margin-bottom:18px}
.field-lbl{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.18em;color:var(--muted);margin-bottom:8px}
.field-ta{width:100%;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:8px;padding:13px 15px;color:var(--text);font-family:'Exo 2',sans-serif;font-size:13px;resize:vertical;min-height:78px;line-height:1.6;outline:none;transition:border-color .2s}
.field-ta:focus{border-color:var(--c);box-shadow:0 0 15px var(--glow)}
.field-ta::placeholder{color:var(--muted)}
.btn-analyze{width:100%;padding:17px;margin-top:22px;background:transparent;border:1px solid var(--c);border-radius:10px;color:var(--c);font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;letter-spacing:.2em;cursor:pointer;position:relative;overflow:hidden;transition:all .3s}
.btn-analyze:hover{box-shadow:0 0 30px var(--glow);transform:translateY(-1px)}
.btn-analyze:disabled{opacity:.3;cursor:not-allowed;transform:none}
.btn-sm{background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:8px 16px;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.1em;cursor:pointer;transition:all .2s}
.btn-sm:hover{color:var(--bright);border-color:var(--border2)}
.btn-save{background:transparent;border:1px solid rgba(0,255,170,.3);color:var(--dd);border-radius:6px;padding:8px 16px;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.1em;cursor:pointer;transition:all .2s}
.btn-save:hover{background:rgba(0,255,170,.06);border-color:var(--dd)}
.btn-save:disabled{opacity:.4;cursor:not-allowed}
.loading-wrap{padding:60px;text-align:center}
.scanner-ring{width:76px;height:76px;border-radius:50%;border:2px solid var(--border);border-top-color:var(--c);margin:0 auto 22px;animation:spin 1s linear infinite;box-shadow:0 0 20px var(--glow);position:relative}
.scanner-ring::before{content:'';position:absolute;inset:6px;border-radius:50%;border:1.5px solid var(--border);border-top-color:var(--c);animation:spin .6s linear infinite reverse;opacity:.5}
.scan-txt{font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--c);letter-spacing:.18em;animation:blink 1.2s ease infinite}
.scan-sub{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);margin-top:8px;letter-spacing:.12em}
.res-wrap{animation:fadeUp .5s ease;border-top:1px solid var(--border);padding-top:34px;margin-top:4px}
.res-hdr{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:22px}
.res-clf{font-family:'Rajdhani',sans-serif;font-size:38px;font-weight:700;color:var(--bright);line-height:1}
.res-icd{font-family:'Share Tech Mono',monospace;font-size:11px;padding:4px 12px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:4px;color:var(--muted);margin-top:8px;display:inline-block}
.risk-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:8px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;letter-spacing:.12em;border:1px solid currentColor}
.risk-badge.pulsing{animation:pulseGlow 2s ease infinite}
.risk-dot{width:8px;height:8px;border-radius:50%;background:currentColor}
.conf-wrap{margin-bottom:22px}
.conf-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.conf-lbl{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.16em;color:var(--muted)}
.conf-val{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:var(--c)}
.conf-track{height:6px;background:rgba(255,255,255,.05);border-radius:3px;overflow:hidden}
.conf-fill{height:100%;border-radius:3px;transition:width .9s cubic-bezier(.4,0,.2,1) .4s}
.sec-lbl{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.2em;color:var(--muted);margin-bottom:12px;margin-top:26px;display:flex;align-items:center;gap:8px}
.sec-lbl::before{content:'';width:14px;height:1px;background:var(--c);flex-shrink:0}
.sec-lbl::after{content:'';flex:1;height:1px;background:var(--border)}
.finding{display:flex;gap:12px;align-items:flex-start;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px;color:var(--text);line-height:1.6}
.finding:last-child{border-bottom:none}
.finding-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:6px}
.prob-bar-wrap{display:flex;flex-direction:column;gap:10px;margin-top:4px}
.prob-bar-row{display:flex;align-items:center;gap:12px}
.prob-bar-lbl{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--text);width:88px;flex-shrink:0}
.prob-bar-track{flex:1;height:5px;background:rgba(255,255,255,.05);border-radius:3px;overflow:hidden}
.prob-bar-fill{height:100%;border-radius:3px;transition:width 1s cubic-bezier(.4,0,.2,1) .5s}
.prob-bar-pct{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--muted);width:38px;text-align:right}
.mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px}
.mini-card{background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:10px;padding:16px 18px}
.mini-k{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:.14em;margin-bottom:6px}
.mini-v{font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:600;color:var(--bright)}
.tag{font-family:'Share Tech Mono',monospace;font-size:11px;padding:4px 12px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:4px;color:var(--muted);display:inline-block;margin:4px 4px 0 0}
.rec-box{background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:10px;padding:18px 20px;font-size:13px;color:var(--text);line-height:1.8;position:relative;overflow:hidden}
.rec-box::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--c);box-shadow:0 0 8px var(--c)}
.disc{margin-top:22px;padding:12px 16px;background:rgba(251,191,36,.04);border:1px solid rgba(251,191,36,.15);border-radius:8px;font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(251,191,36,.45);letter-spacing:.07em;line-height:1.7}
.actions{display:flex;gap:10px;margin-top:22px;flex-wrap:wrap}
.err-box{margin-top:18px;padding:14px 18px;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.22);border-radius:8px;color:#f87171;font-family:'Share Tech Mono',monospace;font-size:12px;line-height:1.7;animation:fadeIn .3s ease}
.footer{text-align:center;padding:36px 24px;font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:.1em;border-top:1px solid var(--border);position:relative;z-index:1}

/* HISTORY */
.hist-wrap{position:relative;z-index:1;padding:110px 24px 60px;max-width:960px;margin:0 auto;animation:fadeUp .4s ease}
.hist-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:14px}
.hist-title{font-family:'Rajdhani',sans-serif;font-size:36px;font-weight:700;color:var(--bright)}
.hist-title span{color:var(--az)}
.hist-meta{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:.1em;margin-top:6px}
.hist-stats{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}
.hist-stat{padding:10px 18px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);display:flex;align-items:center;gap:8px;letter-spacing:.1em}
.hist-stat-dot{width:6px;height:6px;border-radius:50%}
.hist-stat-val{font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:var(--bright)}
.hist-filters{display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap}
.hist-filter{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.12em;padding:6px 14px;border-radius:5px;border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;transition:all .2s}
.hist-filter:hover{color:var(--text);border-color:var(--border2)}
.hist-filter.on{border-color:rgba(167,139,250,.4);color:var(--az);background:rgba(167,139,250,.06)}
.hist-empty{text-align:center;padding:80px 24px;border:1px dashed var(--border);border-radius:16px}
.hist-empty-icon{font-size:44px;margin-bottom:16px;opacity:.3}
.hist-empty-txt{font-family:'Rajdhani',sans-serif;font-size:22px;color:var(--muted);margin-bottom:8px}
.hist-empty-sub{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--muted);opacity:.5;letter-spacing:.1em;margin-bottom:20px}
.hist-loading{text-align:center;padding:80px;font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:.12em;animation:blink 1.4s ease infinite}
.hist-err{text-align:center;padding:40px;font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--danger);letter-spacing:.1em;border:1px solid rgba(248,113,113,.15);border-radius:12px}
.hist-grid{display:grid;gap:14px}
.hist-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px 24px;cursor:pointer;transition:all .25s;animation:fadeUp .3s ease both;position:relative;overflow:hidden}
.hist-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--hc);box-shadow:0 0 8px var(--hc)}
.hist-card:hover{border-color:var(--border2);transform:translateX(4px);box-shadow:0 8px 32px rgba(0,0,0,.3)}
.hist-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
.hist-mod-badge{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.14em;padding:3px 9px;border-radius:3px;border:1px solid var(--hc);color:var(--hc);display:inline-block;margin-bottom:8px;opacity:.8}
.hist-clf{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:var(--bright);line-height:1.1}
.hist-icd{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);margin-top:4px}
.hist-risk{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:6px;font-family:'Share Tech Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.1em;border:1px solid currentColor;flex-shrink:0}
.hist-risk-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.hist-card-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.hist-conf-row{display:flex;align-items:center;gap:10px;flex:1;min-width:140px}
.hist-conf-lbl{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:.12em;white-space:nowrap}
.hist-conf-bar{flex:1;height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;max-width:100px}
.hist-conf-fill{height:100%;border-radius:2px}
.hist-conf-val{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--hc)}
.hist-date{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:.08em;opacity:.6}
.hist-actions{display:flex;gap:8px;align-items:center;margin-top:10px}
.hist-del{background:transparent;border:1px solid rgba(248,113,113,.15);color:rgba(248,113,113,.4);border-radius:5px;padding:5px 10px;font-family:'Share Tech Mono',monospace;font-size:9px;cursor:pointer;transition:all .2s;letter-spacing:.08em}
.hist-del:hover{border-color:rgba(248,113,113,.5);color:#f87171;background:rgba(248,113,113,.06)}
.hist-del:disabled{opacity:.3;cursor:not-allowed}
.hist-expand-hint{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:.1em;opacity:.5}
.hist-expand{margin-top:14px;padding-top:14px;border-top:1px solid var(--border);animation:fadeUp .25s ease}
.hist-expand-lbl{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.14em;color:var(--muted);margin-bottom:4px;margin-top:10px}
.hist-expand-lbl:first-child{margin-top:0}
.hist-expand-row{font-size:12px;color:var(--text);opacity:.7;line-height:1.7;margin-bottom:4px}
.hist-finding-item{display:flex;gap:8px;align-items:flex-start;font-size:12px;color:var(--text);opacity:.65;padding:3px 0}
.hist-finding-dot{width:4px;height:4px;border-radius:50%;background:var(--hc);flex-shrink:0;margin-top:6px}

@media(max-width:640px){
  .mod-grid{grid-template-columns:1fr}
  .hero-title{font-size:48px}
  .stats-row{flex-wrap:wrap}.stat{padding:16px 24px}
  .prev-wrap{flex-direction:column}.prev-img{width:100%;height:200px}
  .mini-grid{grid-template-columns:1fr}
  .hdr{padding:10px 14px}.hdr-status{display:none}
  .panel-body{padding:20px}.main-wrap{padding:100px 16px 40px}
  .user-name{display:none}.hdr-center{gap:3px}
  .hdr-tab{padding:6px 10px;font-size:9px}
  .hist-stats{gap:8px}.hist-stat{padding:8px 12px}
}
`;

// ── History Dashboard ─────────────────────────────────────────────
function HistoryDashboard({ token, onGoHome, onSessionExpired }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [histErr, setHistErr] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const RISK_COL = {
    LOW: "#00ffaa",
    MODERATE: "#fbbf24",
    HIGH: "#f87171",
    CRITICAL: "#ef4444",
  };
  const MOD_COL = { deepdown: "#00ffaa", alzmind: "#a78bfa" };

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setHistErr(null);
    try {
      const res = await fetch(`${API}/api/reports/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        onSessionExpired?.();
        return;
      }
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (e) {
      setHistErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, onSessionExpired]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const deleteReport = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Is report ko delete karna chahte hain?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/api/reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        onSessionExpired?.();
        return;
      }
      setReports((r) => r.filter((x) => x.id !== id));
      if (expanded === id) setExpanded(null);
    } catch {
    } finally {
      setDeleting(null);
    }
  };

  const filtered =
    filter === "ALL"
      ? reports
      : reports.filter((r) =>
          filter === "DEEPDOWN"
            ? r.module === "deepdown"
            : filter === "ALZMIND"
              ? r.module === "alzmind"
              : r.riskLevel === filter,
        );

  const ddCount = reports.filter((r) => r.module === "deepdown").length;
  const azCount = reports.filter((r) => r.module === "alzmind").length;
  const highCount = reports.filter(
    (r) => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL",
  ).length;

  return (
    <div className="hist-wrap">
      <div className="hist-hdr">
        <div>
          <div className="hist-title">
            Report <span>History</span>
          </div>
          <div className="hist-meta">
            {loading
              ? "FETCHING..."
              : `${reports.length} TOTAL REPORTS · LAST 20 SHOWN`}
          </div>
        </div>
        <button className="btn-sm" onClick={fetchHistory}>
          ↻ REFRESH
        </button>
      </div>

      {!loading && reports.length > 0 && (
        <div className="hist-stats">
          <div className="hist-stat">
            <div
              className="hist-stat-dot"
              style={{ background: "var(--bright)" }}
            />
            <span>TOTAL</span>
            <span className="hist-stat-val">{reports.length}</span>
          </div>
          <div className="hist-stat">
            <div
              className="hist-stat-dot"
              style={{ background: "var(--dd)" }}
            />
            <span>DEEPDOWN</span>
            <span className="hist-stat-val" style={{ color: "var(--dd)" }}>
              {ddCount}
            </span>
          </div>
          <div className="hist-stat">
            <div
              className="hist-stat-dot"
              style={{ background: "var(--az)" }}
            />
            <span>ALZMIND</span>
            <span className="hist-stat-val" style={{ color: "var(--az)" }}>
              {azCount}
            </span>
          </div>
          {highCount > 0 && (
            <div
              className="hist-stat"
              style={{ borderColor: "rgba(248,113,113,.2)" }}
            >
              <div
                className="hist-stat-dot"
                style={{ background: "var(--danger)" }}
              />
              <span>HIGH/CRITICAL</span>
              <span
                className="hist-stat-val"
                style={{ color: "var(--danger)" }}
              >
                {highCount}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="hist-filters">
        {[
          "ALL",
          "DEEPDOWN",
          "ALZMIND",
          "LOW",
          "MODERATE",
          "HIGH",
          "CRITICAL",
        ].map((f) => (
          <button
            key={f}
            className={`hist-filter${filter === f ? " on" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="hist-loading">⟳ LOADING REPORTS FROM DATABASE...</div>
      ) : histErr ? (
        <div className="hist-err">
          ⚠ COULD NOT LOAD REPORTS — {histErr}
          <br />
          <br />
          <button className="btn-sm" onClick={fetchHistory}>
            ↻ RETRY
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="hist-empty">
          <div className="hist-empty-icon">◎</div>
          <div className="hist-empty-txt">No reports found</div>
          <div className="hist-empty-sub">
            {reports.length === 0
              ? "RUN A DIAGNOSIS AND SAVE YOUR FIRST REPORT"
              : "NO REPORTS MATCH THIS FILTER"}
          </div>
          {reports.length === 0 && (
            <button
              className="btn-save"
              style={{ margin: "0 auto" }}
              onClick={onGoHome}
            >
              ◈ START DIAGNOSIS
            </button>
          )}
        </div>
      ) : (
        <div className="hist-grid">
          {filtered.map((r, i) => {
            const rc = RISK_COL[r.riskLevel] || "#7ab3d4";
            const mc = MOD_COL[r.module] || "#7ab3d4";
            const exp = expanded === r.id;
            return (
              <div
                key={r.id}
                className="hist-card"
                style={{ "--hc": mc, animationDelay: `${i * 0.06}s` }}
                onClick={() => setExpanded(exp ? null : r.id)}
              >
                <div className="hist-card-top">
                  <div>
                    <div className="hist-mod-badge">
                      {r.module === "deepdown" ? "◈ DEEPDOWN" : "◉ ALZMIND"}
                    </div>
                    <div className="hist-clf">{r.classification}</div>
                    {r.icd10Code && (
                      <div className="hist-icd">{r.icd10Code}</div>
                    )}
                  </div>
                  <div className="hist-risk" style={{ color: rc }}>
                    <div className="hist-risk-dot" />
                    {r.riskLevel}
                  </div>
                </div>
                <div className="hist-card-bottom">
                  <div className="hist-conf-row">
                    <span className="hist-conf-lbl">CONFIDENCE</span>
                    <div className="hist-conf-bar">
                      <div
                        className="hist-conf-fill"
                        style={{ width: `${r.confidence}%`, background: mc }}
                      />
                    </div>
                    <span className="hist-conf-val">{r.confidence}%</span>
                  </div>
                  <span className="hist-date">{fmtDate(r.createdAt)}</span>
                </div>
                <div
                  className="hist-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="hist-expand-hint">
                    {exp ? "▲ COLLAPSE" : "▼ DETAILS"}
                  </span>
                  <button
                    className="hist-del"
                    onClick={(e) => deleteReport(r.id, e)}
                    disabled={deleting === r.id}
                  >
                    {deleting === r.id ? "DELETING..." : "✕ DELETE"}
                  </button>
                </div>
                {exp && (
                  <div className="hist-expand">
                    {r.symptoms && (
                      <>
                        <div className="hist-expand-lbl">SYMPTOMS</div>
                        <div className="hist-expand-row">{r.symptoms}</div>
                      </>
                    )}
                    {r.findings?.length > 0 && (
                      <>
                        <div className="hist-expand-lbl">FINDINGS</div>
                        {r.findings.map((f, fi) => (
                          <div key={fi} className="hist-finding-item">
                            <div className="hist-finding-dot" />
                            {f}
                          </div>
                        ))}
                      </>
                    )}
                    <div className="hist-expand-lbl">RECOMMENDATION</div>
                    <div className="hist-expand-row">{r.recommendation}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function ApexNeuraApp({ user, token, onLogout }) {
  const [page, setPage] = useState("home");
  const [activeId, setActiveId] = useState(null);
  const [chatDone, setChatDone] = useState(false); // ← NEW
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiErr, setApiErr] = useState(null);
  const [time, setTime] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [histCount, setHistCount] = useState(null);

  const inputRef = useRef(null);
  const sessionId = useRef(
    `session_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  ); // ← NEW

  const mod = activeId ? MODS[activeId] : null;
  const riskCfg = result?.riskLevel
    ? (RISK_CFG[result.riskLevel] ?? RISK_CFG.LOW)
    : null;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSessionExpired = useCallback(() => {
    setToast({ msg: "⚠ SESSION EXPIRED — PLEASE LOGIN AGAIN", err: true });
    setTimeout(() => {
      localStorage.removeItem("apexneura_token");
      localStorage.removeItem("apexneura_user");
      if (onLogout) onLogout();
    }, 1500);
  }, [onLogout]);

  const loadFile = useCallback((f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setApiErr(null);
    const r = new FileReader();
    r.onload = (e) => setPreview(e.target.result);
    r.readAsDataURL(f);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    loadFile(e.dataTransfer.files?.[0]);
  };

  const selectMod = (id) => {
    setActiveId(id);
    setFile(null);
    setPreview(null);
    setResult(null);
    setApiErr(null);
    setSymptoms("");
    setChatDone(false); // ← NEW: reset chat on module change
    sessionId.current = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`; // ← NEW: fresh session
    if (inputRef.current) inputRef.current.value = "";
  };

  const analyze = async () => {
    if (!file || !mod) return;
    setLoading(true);
    setResult(null);
    setApiErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (symptoms) fd.append("symptoms", symptoms);
      const res = await fetch(`${API}/api/${activeId}/analyze`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setApiErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (!result || !token) return;
    setSaving(true);
    try {
      const findings =
        result.dermoscopyFindings ?? result.neuroimagingFindings ?? [];
      const res = await fetch(`${API}/api/reports/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          module: activeId,
          classification: result.classification,
          riskLevel: result.riskLevel,
          confidence: result.confidence,
          recommendation: result.recommendation,
          icd10Code: result.icd10Code ?? "",
          findings,
          symptoms: symptoms || "",
        }),
      });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!res.ok) throw new Error("Save failed");
      setToast({ msg: "✓ REPORT SAVED TO HISTORY", err: false });
      setHistCount((c) => (c ?? 0) + 1);
    } catch (e) {
      setToast({ msg: "⚠ SAVE FAILED — " + e.message, err: true });
    } finally {
      setSaving(false);
    }
  };

  const downloadPDF = async () => {
    if (!result || !token) return;
    try {
      const res = await fetch(`${API}/api/reports/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          module: activeId,
          classification: result.classification,
          riskLevel: result.riskLevel,
          confidence: result.confidence,
          recommendation: result.recommendation,
          icd10Code: result.icd10Code,
          findings:
            result.dermoscopyFindings ?? result.neuroimagingFindings ?? [],
          symptoms: symptoms || null,
        }),
      });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `apexneura_${activeId}_report.pdf`;
      a.click();
    } catch (e) {
      setApiErr("PDF failed: " + e.message);
    }
  };

  const exportReport = () => {
    const blob = new Blob(
      [JSON.stringify({ module: activeId, ...result }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${activeId}_report_${Date.now()}.json`;
    a.click();
  };

  const handleLogout = () => {
    localStorage.removeItem("apexneura_token");
    localStorage.removeItem("apexneura_user");
    if (onLogout) onLogout();
  };

  const cssVars = mod
    ? { "--c": mod.color, "--glow": mod.glow, "--grad": mod.grad }
    : {};
  const findings =
    result?.dermoscopyFindings ?? result?.neuroimagingFindings ?? [];
  const allProbs = result?.allProbabilities;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <>
      <style>{CSS}</style>
      <Particles />
      <div className="scanlines-overlay" />
      {toast && (
        <div className={`save-toast${toast.err ? " err" : ""}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="hdr">
        <div
          className="hdr-logo"
          onClick={() => {
            setPage("home");
            selectMod(null);
          }}
        >
          <div className="hdr-dot" />
          APEX<span style={{ color: "var(--dd)" }}>NEURA</span>
          <span style={{ color: "var(--muted)", fontSize: 11 }}>_AI</span>
        </div>
        <div className="hdr-center">
          <button
            className={`hdr-tab${page === "home" ? " active dd" : ""}`}
            onClick={() => {
              setPage("home");
              selectMod(null);
            }}
          >
            ◈ DIAGNOSE
          </button>
          <button
            className={`hdr-tab${page === "history" ? " active hist" : ""}`}
            onClick={() => {
              setPage("history");
              setHistCount(null);
            }}
          >
            ◎ HISTORY
            {histCount !== null && histCount > 0 && (
              <span className="tab-badge">{histCount}</span>
            )}
          </button>
        </div>
        <div className="hdr-right">
          <div className="hdr-status">
            <div className="hdr-si">
              <div className="hdr-sd on" />
              <span>ONLINE</span>
            </div>
            <div className="hdr-si">
              <div className="hdr-sd" style={{ background: "var(--az)" }} />
              <span>ALZMIND</span>
            </div>
            <div className="hdr-si">
              <div className="hdr-sd" style={{ background: "var(--dd)" }} />
              <span>DEEPDOWN</span>
            </div>
            <span
              style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: 10,
                color: "var(--muted)",
              }}
            >
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </span>
          </div>
          {user && (
            <div className="user-chip">
              <div className="user-avatar">{initials}</div>
              <span className="user-name">{user.name}</span>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            ⏻ LOGOUT
          </button>
        </div>
      </header>

      <div className="warn-strip">
        <span style={{ color: "var(--warn)" }}>⚠</span> RESEARCH PROTOTYPE — NOT
        FOR CLINICAL USE
      </div>

      {/* History Page */}
      {page === "history" && (
        <HistoryDashboard
          token={token}
          onGoHome={() => {
            setPage("home");
            selectMod(null);
          }}
          onSessionExpired={handleSessionExpired}
        />
      )}

      {/* Home Page */}
      {page === "home" && (
        <main className="main-wrap">
          <p className="eyebrow">
            MULTIMODAL AI · MEDICAL IMAGING · CLINICAL DECISION SUPPORT
          </p>
          <h1 className="hero-title">
            <span className="dd">Apex</span>
            <span className="az">Neura</span>
          </h1>
          <p className="hero-sub-line">
            AI-POWERED MEDICAL DIAGNOSTIC PLATFORM
          </p>
          <p className="hero-desc">
            Upload medical imaging data. Receive real-time AI diagnostic
            analysis powered by locally trained deep learning models.
          </p>

          <div className="stats-row">
            <div className="stat">
              <span className="stat-n c-dd">25K+</span>
              <div className="stat-l">ISIC IMAGES</div>
            </div>
            <div className="stat">
              <span className="stat-n" style={{ color: "var(--bright)" }}>
                79.5%
              </span>
              <div className="stat-l">DEEPDOWN ACC.</div>
            </div>
            <div className="stat">
              <span className="stat-n c-az">44K+</span>
              <div className="stat-l">MRI IMAGES</div>
            </div>
            <div className="stat">
              <span className="stat-n" style={{ color: "var(--bright)" }}>
                99.8%
              </span>
              <div className="stat-l">ALZMIND ACC.</div>
            </div>
          </div>

          <div className="mod-grid">
            {Object.values(MODS).map((m) => (
              <div
                key={m.id}
                className={`mod-card${activeId === m.id ? " sel" : ""}`}
                style={{ "--c": m.color, "--glow": m.glow, "--grad": m.grad }}
                onClick={() => selectMod(m.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && selectMod(m.id)}
              >
                <div className="corner tl" />
                <div className="corner tr" />
                <div className="corner bl" />
                <div className="corner br" />
                <span className="mod-icon">{m.icon}</span>
                <div className="mod-tag">{m.tag}</div>
                <div className="mod-name">{m.name}</div>
                <div className="mod-sub">{m.sub}</div>
                <div className="mod-desc">{m.desc}</div>
              </div>
            ))}
          </div>

          {/* ── Panel (shows after module select) ── */}
          {mod && (
            <div className="panel" style={cssVars}>
              <div className="panel-bar" />
              <div className="panel-hdr">
                <div>
                  <div className="panel-tag">{mod.tag}</div>
                  <div className="panel-name">{mod.name}</div>
                </div>
                <button className="back-btn" onClick={() => selectMod(null)}>
                  ← BACK
                </button>
              </div>
              <div className="panel-body">
                {/* ── STEP 1: CHATBOT (shows until 3 questions done) ── */}
                {!chatDone && (
                  <ChatPanel
                    module={activeId}
                    moduleColor={mod.color}
                    moduleGlow={mod.glow}
                    moduleGrad={mod.grad}
                    sessionId={sessionId.current}
                    onChatComplete={() => setChatDone(true)}
                  />
                )}

                {/* ── STEP 2: IMAGE UPLOAD (shows after chat done) ── */}
                {chatDone && (
                  <>
                    {!preview ? (
                      <div
                        className={`upload-zone${drag ? " over" : ""}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDrag(true);
                        }}
                        onDragLeave={() => setDrag(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                      >
                        <input
                          ref={inputRef}
                          type="file"
                          accept={mod.accepts}
                          onChange={(e) => loadFile(e.target.files?.[0])}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="upload-icon">⬆</span>
                        <div className="upload-title">
                          Drop medical image here
                        </div>
                        <div className="upload-hint">{mod.hint}</div>
                      </div>
                    ) : (
                      <div className="prev-wrap">
                        <div className="prev-img-wrap prev-corners">
                          <img src={preview} alt="scan" className="prev-img" />
                          <div className="prev-scan" />
                        </div>
                        <div className="prev-info">
                          <div className="prev-fname">{file.name}</div>
                          <div className="prev-size">{fmtSize(file.size)}</div>
                          <div className="field-lbl">
                            PATIENT SYMPTOMS / HISTORY (OPTIONAL)
                          </div>
                          <textarea
                            className="field-ta"
                            placeholder={
                              activeId === "deepdown"
                                ? "e.g. lesion present for 6 months, itching, changing border..."
                                : "e.g. memory loss, confusion, family history of AD..."
                            }
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                          />
                          <div style={{ marginTop: 12 }}>
                            <button
                              className="btn-sm"
                              onClick={() => {
                                setFile(null);
                                setPreview(null);
                                setResult(null);
                                if (inputRef.current)
                                  inputRef.current.value = "";
                              }}
                            >
                              REMOVE FILE
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {preview && !loading && !result && (
                      <button className="btn-analyze" onClick={analyze}>
                        ⟶ RUN {mod.name.toUpperCase()} ANALYSIS
                      </button>
                    )}

                    {loading && (
                      <div className="loading-wrap">
                        <div className="scanner-ring" />
                        <div className="scan-txt">
                          ANALYZING MEDICAL IMAGE...
                        </div>
                        <div className="scan-sub">
                          {mod.tag} · LOCAL INFERENCE
                        </div>
                      </div>
                    )}

                    {apiErr && <div className="err-box">⚠ {apiErr}</div>}
                    {result?.error && (
                      <div className="err-box">⚠ {result.error}</div>
                    )}

                    {result && !result.error && (
                      <div className="res-wrap">
                        <div className="res-hdr">
                          <div>
                            <div className="sec-lbl" style={{ marginTop: 0 }}>
                              CLASSIFICATION
                            </div>
                            <div className="res-clf">
                              {result.classification}
                            </div>
                            {result.icd10Code && (
                              <span className="res-icd">
                                {result.icd10Code}
                              </span>
                            )}
                          </div>
                          {riskCfg && (
                            <div
                              className={`risk-badge${riskCfg.pulse ? " pulsing" : ""}`}
                              style={{ color: riskCfg.col }}
                            >
                              <div className="risk-dot" />
                              {riskCfg.label}
                            </div>
                          )}
                        </div>

                        <div className="conf-wrap">
                          <div className="conf-meta">
                            <span className="conf-lbl">MODEL CONFIDENCE</span>
                            <span className="conf-val">
                              {result.confidence}%
                            </span>
                          </div>
                          <div className="conf-track">
                            <div
                              className="conf-fill"
                              style={{
                                width: `${result.confidence}%`,
                                background: mod.color,
                              }}
                            />
                          </div>
                        </div>

                        {allProbs && (
                          <>
                            <div className="sec-lbl">CLASS PROBABILITIES</div>
                            <div className="prob-bar-wrap">
                              {Object.entries(allProbs).map(([k, v]) => (
                                <div key={k} className="prob-bar-row">
                                  <span className="prob-bar-lbl">{k}</span>
                                  <div className="prob-bar-track">
                                    <div
                                      className="prob-bar-fill"
                                      style={{
                                        width: `${v}%`,
                                        background:
                                          k === "Malignant"
                                            ? "#f87171"
                                            : k === "Benign"
                                              ? "#00ffaa"
                                              : "#fbbf24",
                                      }}
                                    />
                                  </div>
                                  <span className="prob-bar-pct">{v}%</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {findings.length > 0 && (
                          <>
                            <div className="sec-lbl">
                              {activeId === "deepdown"
                                ? "DERMOSCOPY FINDINGS"
                                : "NEUROIMAGING FINDINGS"}
                            </div>
                            <div>
                              {findings.map((f, i) => (
                                <div key={i} className="finding">
                                  <div
                                    className="finding-dot"
                                    style={{
                                      background: mod.color,
                                      boxShadow: `0 0 6px ${mod.color}`,
                                    }}
                                  />
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {activeId === "alzmind" && (
                          <>
                            {result.cdrScore !== undefined && (
                              <>
                                <div className="sec-lbl">CLINICAL SCORES</div>
                                <div className="mini-grid">
                                  <div className="mini-card">
                                    <div className="mini-k">CDR SCORE</div>
                                    <div
                                      className="mini-v"
                                      style={{ fontSize: 26 }}
                                    >
                                      {result.cdrScore}
                                    </div>
                                  </div>
                                  {result.atrophyIndex && (
                                    <div className="mini-card">
                                      <div className="mini-k">
                                        ATROPHY INDEX
                                      </div>
                                      <div className="mini-v">
                                        {result.atrophyIndex}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                            {result.brainRegionsAffected?.length > 0 && (
                              <>
                                <div className="sec-lbl">AFFECTED REGIONS</div>
                                <div>
                                  {result.brainRegionsAffected.map((r, i) => (
                                    <span key={i} className="tag">
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        )}

                        <div className="sec-lbl">CLINICAL RECOMMENDATION</div>
                        <div className="rec-box">{result.recommendation}</div>
                        {result.disclaimer && (
                          <div className="disc">⚠ {result.disclaimer}</div>
                        )}

                        <div className="actions">
                          <button
                            className="btn-sm"
                            onClick={() => {
                              setResult(null);
                              setFile(null);
                              setPreview(null);
                              setSymptoms("");
                              if (inputRef.current) inputRef.current.value = "";
                            }}
                          >
                            NEW SCAN
                          </button>
                          <button className="btn-sm" onClick={exportReport}>
                            EXPORT JSON ↓
                          </button>
                          {token && (
                            <button className="btn-sm" onClick={downloadPDF}>
                              DOWNLOAD PDF ↓
                            </button>
                          )}
                          {token && (
                            <button
                              className="btn-save"
                              onClick={saveReport}
                              disabled={saving}
                            >
                              {saving ? "SAVING..." : "⊕ SAVE REPORT"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      <footer className="footer">
        APEXNEURA AI · PROTOTYPE v0.5 · RESEARCH &amp; DEMO ONLY
        <br />
        <span
          style={{ color: "var(--border2)", marginTop: 6, display: "block" }}
        >
          DeepDown EfficientNet-B4 (79.5%) · AlzMind ViT (99.8%) · Local
          Inference · NeuraBot Powered by Gemini
        </span>
      </footer>
    </>
  );
}
