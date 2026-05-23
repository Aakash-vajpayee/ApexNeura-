// import { useState, useRef, useEffect } from "react";

// const API = "http://localhost:8000";

// const CHAT_CSS = `
// .chat-panel{
//   border:1px solid var(--border2);
//   border-radius:14px;
//   overflow:hidden;
//   background:rgba(7,18,38,0.85);
//   display:flex;
//   flex-direction:column;
//   height:420px;
//   position:relative;
// }
// .chat-panel::before{
//   content:'';position:absolute;top:0;left:0;right:0;height:2px;
//   background:linear-gradient(90deg,transparent,var(--c),var(--c),transparent);
//   animation:pulse 2s ease infinite;
// }
// .chat-header{
//   padding:14px 20px;
//   border-bottom:1px solid var(--border);
//   display:flex;align-items:center;gap:10px;
//   background:rgba(0,0,0,0.2);
//   flex-shrink:0;
// }
// .chat-avatar{
//   width:32px;height:32px;border-radius:50%;
//   background:linear-gradient(135deg,var(--c),#a78bfa);
//   display:flex;align-items:center;justify-content:center;
//   font-size:14px;flex-shrink:0;
//   box-shadow:0 0 12px var(--glow);
// }
// .chat-hdr-info{}
// .chat-hdr-name{
//   font-family:'Share Tech Mono',monospace;font-size:12px;
//   color:var(--bright);letter-spacing:.1em;
// }
// .chat-hdr-status{
//   font-family:'Share Tech Mono',monospace;font-size:9px;
//   color:var(--c);letter-spacing:.1em;opacity:.7;
//   display:flex;align-items:center;gap:5px;
// }
// .chat-hdr-dot{
//   width:5px;height:5px;border-radius:50%;
//   background:var(--c);animation:pulse 1.5s ease infinite;
// }
// .chat-turn-indicator{
//   margin-left:auto;
//   font-family:'Share Tech Mono',monospace;font-size:9px;
//   color:var(--muted);letter-spacing:.1em;
//   background:rgba(255,255,255,0.03);
//   border:1px solid var(--border);
//   padding:4px 10px;border-radius:4px;
// }
// .chat-messages{
//   flex:1;overflow-y:auto;padding:16px;
//   display:flex;flex-direction:column;gap:12px;
// }
// .chat-messages::-webkit-scrollbar{width:3px}
// .chat-messages::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
// .chat-bubble{
//   max-width:80%;padding:11px 15px;
//   border-radius:10px;font-size:13px;
//   line-height:1.65;animation:fadeUp 0.3s ease;
// }
// .chat-bubble.bot{
//   background:rgba(255,255,255,0.04);
//   border:1px solid var(--border2);
//   color:var(--text);align-self:flex-start;
//   border-bottom-left-radius:3px;
// }
// .chat-bubble.user{
//   background:rgba(0,0,0,0.35);
//   border:1px solid var(--border);
//   color:var(--bright);align-self:flex-end;
//   border-bottom-right-radius:3px;
//   text-align:right;
// }
// .chat-bubble.bot .bubble-sender{
//   font-family:'Share Tech Mono',monospace;font-size:9px;
//   color:var(--c);letter-spacing:.12em;margin-bottom:5px;opacity:.8;
// }
// .chat-bubble.user .bubble-sender{
//   font-family:'Share Tech Mono',monospace;font-size:9px;
//   color:var(--muted);letter-spacing:.12em;margin-bottom:5px;
// }
// .chat-typing{
//   align-self:flex-start;
//   background:rgba(255,255,255,0.04);
//   border:1px solid var(--border2);
//   border-radius:10px;border-bottom-left-radius:3px;
//   padding:12px 16px;display:flex;gap:5px;align-items:center;
// }
// .typing-dot{
//   width:6px;height:6px;border-radius:50%;
//   background:var(--c);opacity:0.4;
//   animation:blink 1.2s ease infinite;
// }
// .typing-dot:nth-child(2){animation-delay:.2s}
// .typing-dot:nth-child(3){animation-delay:.4s}
// .chat-input-wrap{
//   padding:12px 14px;
//   border-top:1px solid var(--border);
//   display:flex;gap:10px;align-items:flex-end;
//   background:rgba(0,0,0,0.15);flex-shrink:0;
// }
// .chat-input{
//   flex:1;background:rgba(0,0,0,0.3);
//   border:1px solid var(--border);border-radius:8px;
//   padding:10px 14px;color:var(--bright);
//   font-family:'Exo 2',sans-serif;font-size:13px;
//   outline:none;resize:none;max-height:100px;
//   line-height:1.5;transition:border-color .2s;
//   min-height:40px;
// }
// .chat-input:focus{border-color:var(--c);box-shadow:0 0 10px var(--glow)}
// .chat-input::placeholder{color:var(--muted);font-size:12px}
// .chat-send{
//   background:var(--c);border:none;
//   width:38px;height:38px;border-radius:8px;
//   cursor:pointer;display:flex;align-items:center;
//   justify-content:center;flex-shrink:0;
//   transition:all .2s;font-size:15px;color:#040d1a;font-weight:700;
// }
// .chat-send:hover{box-shadow:0 0 14px var(--glow);transform:scale(1.05)}
// .chat-send:disabled{opacity:.3;cursor:not-allowed;transform:none;box-shadow:none}
// .chat-done-btn{
//   width:100%;padding:15px;margin-top:0;
//   background:transparent;border:1px solid var(--c);
//   border-radius:0 0 14px 14px;
//   color:var(--c);font-family:'Rajdhani',sans-serif;
//   font-size:15px;font-weight:700;letter-spacing:.18em;
//   cursor:pointer;transition:all .3s;flex-shrink:0;
// }
// .chat-done-btn:hover{background:rgba(var(--c-rgb),0.06);box-shadow:0 0 20px var(--glow)}
// `;

// export default function ChatPanel({ module, moduleColor, moduleGlow, moduleGrad, onChatComplete, sessionId }) {
//   const [messages,  setMessages]  = useState([]);
//   const [input,     setInput]     = useState("");
//   const [loading,   setLoading]   = useState(false);
//   const [turn,      setTurn]      = useState(0);
//   const [done,      setDone]      = useState(false);
//   const [started,   setStarted]   = useState(false);
//   const bottomRef = useRef(null);
//   const inputRef  = useRef(null);

//   // Auto-scroll
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   // Send greeting on mount
//   useEffect(() => {
//     const greeting = module === "deepdown"
//       ? "Namaskar! Main NeuraBot hoon — ApexNeura ka AI medical assistant. Aapki skin concern ke baare mein kuch important questions poochhna chahta hoon analysis se pehle.\n\nAapko yeh skin problem kitne time se hai? Aur kya aapne koi changes notice kiye hain — jaise size, color, ya shape mein?"
//       : "Namaskar! Main NeuraBot hoon — ApexNeura ka AI medical assistant. Brain MRI scan upload karne se pehle, kuch zaruri information lena chahta hoon.\n\nAap ya patient mein kaunse memory ya cognitive symptoms aa rahe hain? Yeh symptoms kab se shuru hue hain?";

//     setMessages([{ role: "bot", content: greeting }]);
//     setStarted(true);
//   }, [module]);

//   const sendMessage = async () => {
//     const text = input.trim();
//     if (!text || loading || done) return;

//     const userMsg = { role: "user", content: text };
//     setMessages(prev => [...prev, userMsg]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await fetch(`${API}/api/chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           session_id: sessionId,
//           message: text,
//           module: module,
//         }),
//       });
//       const data = await res.json();
//       const botMsg = { role: "bot", content: data.reply };
//       setMessages(prev => [...prev, botMsg]);
//       setTurn(data.turn);

//       // After 3 turns, mark done
//       if (data.turn >= 3) {
//         setDone(true);
//       }
//     } catch (e) {
//       setMessages(prev => [...prev, {
//         role: "bot",
//         content: "Network error. Please check if backend is running.",
//       }]);
//     } finally {
//       setLoading(false);
//       setTimeout(() => inputRef.current?.focus(), 100);
//     }
//   };

//   const handleKey = e => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const cssVars = {
//     "--c":    moduleColor,
//     "--glow": moduleGlow,
//     "--grad": moduleGrad,
//   };

//   return (
//     <>
//       <style>{CHAT_CSS}</style>
//       <div style={cssVars}>
//         <div className="chat-panel">
//           {/* Header */}
//           <div className="chat-header">
//             <div className="chat-avatar">🧠</div>
//             <div className="chat-hdr-info">
//               <div className="chat-hdr-name">NEURABOT</div>
//               <div className="chat-hdr-status">
//                 <div className="chat-hdr-dot"/>
//                 AI MEDICAL ASSISTANT · ACTIVE
//               </div>
//             </div>
//             <div className="chat-turn-indicator">
//               {done ? "✓ COMPLETE" : `Q ${Math.min(turn + 1, 3)} / 3`}
//             </div>
//           </div>

//           {/* Messages */}
//           <div className="chat-messages">
//             {messages.map((m, i) => (
//               <div key={i} className={`chat-bubble ${m.role === "bot" ? "bot" : "user"}`}>
//                {m.role === "bot" && <div className="bubble-sender">NEURABOT</div>}
// {m.role === "user" && <div className="bubble-sender">YOU</div>}
//               </div>
//             ))}

//             {loading && (
//               <div className="chat-typing">
//                 <div className="typing-dot"/>
//                 <div className="typing-dot"/>
//                 <div className="typing-dot"/>
//               </div>
//             )}
//             <div ref={bottomRef}/>
//           </div>

//           {/* Input */}
//           {!done && (
//             <div className="chat-input-wrap">
//               <textarea
//                 ref={inputRef}
//                 className="chat-input"
//                 placeholder="Type your response..."
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 onKeyDown={handleKey}
//                 rows={1}
//                 disabled={loading}
//               />
//               <button
//                 className="chat-send"
//                 onClick={sendMessage}
//                 disabled={!input.trim() || loading}
//                 style={{ color: "#040d1a" }}
//               >
//                 ↑
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Proceed button — appears after 3 questions */}
//         {done && (
//           <button
//             className="chat-done-btn"
//             onClick={onChatComplete}
//           >
//             ⬆ PROCEED TO IMAGE UPLOAD →
//           </button>
//         )}
//       </div>
//     </>
//   );
// }

import { useState, useRef, useEffect, useCallback } from "react";

const API = "http://localhost:8000";

const CHAT_CSS = `
.chat-panel{
  border:1px solid var(--border2);
  border-radius:14px;
  overflow:hidden;
  background:rgba(7,18,38,0.9);
  display:flex;
  flex-direction:column;
  height:440px;
  position:relative;
  width:100%;
}
.chat-panel::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,var(--c),var(--c),transparent);
  animation:pulse 2s ease infinite;z-index:1;
}
.chat-header{
  padding:14px 20px;
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:10px;
  background:rgba(0,0,0,0.25);
  flex-shrink:0;
}
.chat-avatar{
  width:34px;height:34px;border-radius:50%;
  background:linear-gradient(135deg,var(--c),#a78bfa);
  display:flex;align-items:center;justify-content:center;
  font-size:15px;flex-shrink:0;
  box-shadow:0 0 12px var(--glow);
}
.chat-hdr-name{
  font-family:'Share Tech Mono',monospace;font-size:12px;
  color:var(--bright);letter-spacing:.1em;
}
.chat-hdr-status{
  font-family:'Share Tech Mono',monospace;font-size:9px;
  color:var(--c);letter-spacing:.1em;opacity:.7;
  display:flex;align-items:center;gap:5px;margin-top:2px;
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
  flex-shrink:0;
}
.chat-turn-indicator.done{
  color:var(--c);border-color:rgba(0,255,170,.3);
  background:rgba(0,255,170,.05);
}
.chat-messages{
  flex:1;overflow-y:auto;padding:16px;
  display:flex;flex-direction:column;gap:12px;
  scroll-behavior:smooth;
}
.chat-messages::-webkit-scrollbar{width:3px}
.chat-messages::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
.chat-bubble{
  max-width:82%;padding:11px 15px;
  border-radius:10px;font-size:13px;
  line-height:1.65;animation:fadeUp 0.3s ease;
  white-space:pre-wrap;word-break:break-word;
}
.chat-bubble.bot{
  background:rgba(255,255,255,0.04);
  border:1px solid var(--border2);
  color:var(--text);align-self:flex-start;
  border-bottom-left-radius:3px;
}
.chat-bubble.user{
  background:rgba(0,0,0,0.4);
  border:1px solid var(--border);
  color:var(--bright);align-self:flex-end;
  border-bottom-right-radius:3px;
}
.bubble-sender{
  font-family:'Share Tech Mono',monospace;font-size:9px;
  letter-spacing:.12em;margin-bottom:5px;opacity:.7;
}
.chat-bubble.bot .bubble-sender{color:var(--c);}
.chat-bubble.user .bubble-sender{color:var(--muted);text-align:right;}
.chat-typing{
  align-self:flex-start;
  background:rgba(255,255,255,0.04);
  border:1px solid var(--border2);
  border-radius:10px;border-bottom-left-radius:3px;
  padding:13px 18px;display:flex;gap:5px;align-items:center;
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
  background:rgba(0,0,0,0.2);flex-shrink:0;
}
.chat-input{
  flex:1;background:rgba(0,0,0,0.35);
  border:1px solid var(--border);border-radius:8px;
  padding:10px 14px;color:var(--bright);
  font-family:'Exo 2',sans-serif;font-size:13px;
  outline:none;resize:none;max-height:100px;
  line-height:1.5;transition:border-color .2s;
  min-height:40px;
}
.chat-input:focus{border-color:var(--c);box-shadow:0 0 10px var(--glow)}
.chat-input::placeholder{color:var(--muted);font-size:12px}
.chat-input:disabled{opacity:.5;cursor:not-allowed}
.chat-send{
  background:var(--c);border:none;
  width:40px;height:40px;border-radius:8px;
  cursor:pointer;display:flex;align-items:center;
  justify-content:center;flex-shrink:0;
  transition:all .2s;font-size:16px;color:#040d1a;font-weight:700;
}
.chat-send:hover{box-shadow:0 0 14px var(--glow);transform:scale(1.05)}
.chat-send:disabled{opacity:.3;cursor:not-allowed;transform:none;box-shadow:none}

/* BUG FIX: removed rgba(var(--c-rgb)) — not valid CSS */
.chat-done-btn{
  width:100%;padding:16px;
  background:transparent;
  border:1px solid var(--c);
  border-top:none;
  border-radius:0 0 14px 14px;
  color:var(--c);font-family:'Rajdhani',sans-serif;
  font-size:15px;font-weight:700;letter-spacing:.18em;
  cursor:pointer;transition:all .3s;
}
.chat-done-btn:hover{
  background:rgba(0,0,0,0.2);
  box-shadow:0 0 20px var(--glow);
  letter-spacing:.22em;
}

.chat-err{
  margin:8px 16px;padding:10px 14px;
  background:rgba(248,113,113,.07);
  border:1px solid rgba(248,113,113,.2);
  border-radius:8px;font-family:'Share Tech Mono',monospace;
  font-size:11px;color:#f87171;letter-spacing:.08em;
  animation:fadeUp .3s ease;
}

/* Skip button */
.chat-skip{
  background:transparent;border:none;
  font-family:'Share Tech Mono',monospace;font-size:9px;
  color:var(--muted);letter-spacing:.1em;cursor:pointer;
  padding:4px 8px;transition:color .2s;margin-left:auto;
  flex-shrink:0;
}
.chat-skip:hover{color:var(--text)}
`;

export default function ChatPanel({
  module,
  moduleColor,
  moduleGlow,
  moduleGrad,
  onChatComplete,
  sessionId,
  token,
}) {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [turn,     setTurn]     = useState(0);   // BUG FIX: always a number
  const [done,     setDone]     = useState(false);
  const [chatErr,  setChatErr]  = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Greeting on mount
  useEffect(() => {
    const greeting = module === "deepdown"
      ? "Namaskar! Main NeuraBot hoon — ApexNeura ka AI medical assistant. 🩺\n\nAapki skin concern ke baare mein kuch important questions poochhna chahta hoon analysis se pehle.\n\nAapko yeh skin problem kitne time se hai? Aur kya aapne koi changes notice kiye hain — jaise size, color, ya shape mein?"
      : "Namaskar! Main NeuraBot hoon — ApexNeura ka AI medical assistant. 🧠\n\nBrain MRI scan upload karne se pehle, kuch zaruri information lena chahta hoon.\n\nAap ya patient mein kaunse memory ya cognitive symptoms aa rahe hain? Yeh symptoms kab se shuru hue hain?";

    setMessages([{ role: "bot", content: greeting }]);
    setTurn(0);
    setDone(false);
    setChatErr(null);
  }, [module, sessionId]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || done) return;

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setChatErr(null);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          session_id: sessionId,
          message:    text,
          module:     module,
        }),
      });

      // BUG FIX: check for non-ok response before parsing
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();

      // BUG FIX: safe number parse — prevent NaN
      const newTurn = typeof data.turn === "number" ? data.turn : parseInt(data.turn, 10) || 0;

      setMessages(prev => [...prev, { role: "bot", content: data.reply }]);
      setTurn(newTurn);

      if (newTurn >= 3) {
        setDone(true);
      }
    } catch(e) {
      setChatErr(e.message || "Network error. Backend running hai?");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, done, sessionId, module, token]);

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // BUG FIX: safe turn display — prevent NaN
  const displayTurn = isNaN(turn) ? 1 : Math.min(turn + 1, 3);

  const cssVars = { "--c": moduleColor, "--glow": moduleGlow, "--grad": moduleGrad };

  return (
    <>
      <style>{CHAT_CSS}</style>
      <div style={cssVars}>
        <div className="chat-panel">

          {/* Header */}
          <div className="chat-header">
            <div className="chat-avatar">🧠</div>
            <div>
              <div className="chat-hdr-name">NEURABOT</div>
              <div className="chat-hdr-status">
                <div className="chat-hdr-dot"/>
                AI MEDICAL ASSISTANT · ACTIVE
              </div>
            </div>
            <div className={`chat-turn-indicator${done ? " done" : ""}`}>
              {done ? "✓ COMPLETE" : `Q ${displayTurn} / 3`}
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role === "bot" ? "bot" : "user"}`}>
                <div className="bubble-sender">
                  {m.role === "bot" ? "NEURABOT" : "YOU"}
                </div>
                {m.content || "..."}
              </div>
            ))}

            {loading && (
              <div className="chat-typing">
                <div className="typing-dot"/>
                <div className="typing-dot"/>
                <div className="typing-dot"/>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* Error */}
          {chatErr && <div className="chat-err">⚠ {chatErr}</div>}

          {/* Input area */}
          {!done && (
            <div className="chat-input-wrap">
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder="Apna jawab yahan likhein... (Enter to send)"
                value={input}
                onChange={e => setInput(e.target.value)}
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