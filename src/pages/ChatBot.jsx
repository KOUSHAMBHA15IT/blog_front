import { useState, useRef, useEffect } from "react";

// ─── Matcha palette ───────────────────────────────────────────────────────────
const M = {
  50:  "#f2f7f0",
  100: "#dceedd",
  200: "#b8dbb8",
  300: "#8cc48c",
  400: "#6aaa6a",
  600: "#3d7a3d",
  700: "#2d5e2d",
  800: "#1e4a1e",
  900: "#0f2b0f",
};

// ─── Inline markdown parser ───────────────────────────────────────────────────
function parseInline(text, isUser) {
  const baseColor  = isUser ? "rgba(255,255,255,0.95)" : M[900];
  const codeColor  = isUser ? "rgba(255,255,255,0.9)"  : M[800];
  const codeBg     = isUser ? "rgba(255,255,255,0.18)" : "rgba(61,122,61,0.10)";
  const codeBorder = isUser ? "rgba(255,255,255,0.3)"  : M[300];
  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  return text.split(regex).map((part, i) => {
    if (part.startsWith("***") && part.endsWith("***"))
      return <strong key={i} style={{ fontStyle: "italic", color: baseColor }}>{part.slice(3, -3)}</strong>;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ fontWeight: 650, color: isUser ? "#fff" : M[800], letterSpacing: "-0.01em" }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} style={{ fontStyle: "italic", color: baseColor, opacity: 0.9 }}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} style={{ background: codeBg, border: `1px solid ${codeBorder}`, borderRadius: 4, padding: "1px 5px", fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace", fontSize: "0.85em", color: codeColor }}>{part.slice(1, -1)}</code>;
    return <span key={i} style={{ color: baseColor }}>{part}</span>;
  });
}

// ─── Full Markdown → JSX renderer ────────────────────────────────────────────
function MessageContent({ text, isUser }) {
  const lines = text.split("\n");
  const nodes = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim(); const codeLines = []; i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      nodes.push(<div key={`cb-${i}`} style={{ background: isUser ? "rgba(0,0,0,0.25)" : "rgba(15,43,15,0.06)", border: `1px solid ${isUser ? "rgba(255,255,255,0.2)" : M[200]}`, borderRadius: 8, overflow: "hidden", margin: "6px 0" }}>
        {lang && <div style={{ background: isUser ? "rgba(0,0,0,0.2)" : M[100], padding: "3px 10px", fontSize: 10, color: isUser ? "rgba(255,255,255,0.6)" : M[600], fontFamily: "monospace", letterSpacing: "0.05em", textTransform: "uppercase" }}>{lang}</div>}
        <pre style={{ margin: 0, padding: "10px 12px", fontSize: 12, lineHeight: 1.6, fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace", color: isUser ? "rgba(255,255,255,0.92)" : M[800], overflowX: "auto", whiteSpace: "pre" }}>{codeLines.join("\n")}</pre>
      </div>); i++; continue;
    }
    if (line.startsWith("### ")) { nodes.push(<p key={i} style={{ margin: "10px 0 3px", fontSize: 13, fontWeight: 650, color: isUser ? "rgba(255,255,255,0.85)" : M[700], letterSpacing: "-0.01em", lineHeight: 1.3 }}>{parseInline(line.slice(4), isUser)}</p>); i++; continue; }
    if (line.startsWith("## "))  { nodes.push(<p key={i} style={{ margin: "12px 0 4px", fontSize: 14, fontWeight: 700, color: isUser ? "#fff" : M[800], letterSpacing: "-0.02em", lineHeight: 1.3, borderBottom: isUser ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${M[200]}`, paddingBottom: 4 }}>{parseInline(line.slice(3), isUser)}</p>); i++; continue; }
    if (line.startsWith("# "))   { nodes.push(<p key={i} style={{ margin: "14px 0 5px", fontSize: 15.5, fontWeight: 750, color: isUser ? "#fff" : M[900], letterSpacing: "-0.03em", lineHeight: 1.25 }}>{parseInline(line.slice(2), isUser)}</p>); i++; continue; }
    if (line.startsWith("> "))   { nodes.push(<div key={i} style={{ borderLeft: `3px solid ${isUser ? "rgba(255,255,255,0.4)" : M[400]}`, paddingLeft: 10, margin: "4px 0", color: isUser ? "rgba(255,255,255,0.75)" : M[700], fontStyle: "italic", fontSize: 12.5 }}>{parseInline(line.slice(2), isUser)}</div>); i++; continue; }
    if (/^---+$/.test(line.trim())) { nodes.push(<hr key={i} style={{ border: "none", borderTop: `1px solid ${isUser ? "rgba(255,255,255,0.25)" : M[200]}`, margin: "8px 0" }} />); i++; continue; }
    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* ") || lines[i].startsWith("• "))) { items.push(lines[i].replace(/^[-*•]\s/, "")); i++; }
      nodes.push(<ul key={`ul-${i}`} style={{ margin: "4px 0", paddingLeft: 0, listStyle: "none" }}>
        {items.map((item, j) => <li key={j} style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 13, lineHeight: 1.55, marginBottom: 3 }}>
          <span style={{ marginTop: 5, width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: isUser ? "rgba(255,255,255,0.6)" : M[400] }} />
          <span style={{ color: isUser ? "rgba(255,255,255,0.9)" : M[900] }}>{parseInline(item, isUser)}</span>
        </li>)}
      </ul>); continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items = []; let num = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push({ n: num++, text: lines[i].replace(/^\d+\.\s/, "") }); i++; }
      nodes.push(<ol key={`ol-${i}`} style={{ margin: "4px 0", paddingLeft: 0, listStyle: "none" }}>
        {items.map((item, j) => <li key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, lineHeight: 1.55, marginBottom: 4 }}>
          <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: isUser ? "rgba(255,255,255,0.22)" : M[100], border: `1px solid ${isUser ? "rgba(255,255,255,0.3)" : M[300]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, marginTop: 1, color: isUser ? "rgba(255,255,255,0.85)" : M[700] }}>{item.n}</span>
          <span style={{ color: isUser ? "rgba(255,255,255,0.9)" : M[900] }}>{parseInline(item.text, isUser)}</span>
        </li>)}
      </ol>); continue;
    }
    if (line.trim() === "") { nodes.push(<div key={i} style={{ height: 5 }} />); i++; continue; }
    nodes.push(<p key={i} style={{ margin: 0, fontSize: 13, lineHeight: 1.62, color: isUser ? "rgba(255,255,255,0.93)" : M[900] }}>{parseInline(line, isUser)}</p>);
    i++;
  }
  return <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>{nodes}</div>;
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 4 }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: M[600], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>AI</div>
      <div style={{ background: "rgba(242,247,240,0.95)", border: `1px solid ${M[200]}`, borderRadius: "14px 14px 14px 3px", padding: "11px 16px", display: "flex", gap: 5, alignItems: "center" }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: M[600], display: "inline-block", animation: `bdot 1.2s ${i * 0.2}s infinite ease-in-out` }} />)}
      </div>
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  return (
    <button onClick={copy} style={{ background: "none", border: `1px solid ${copied ? M[400] : M[200]}`, borderRadius: 6, cursor: "pointer", padding: "2px 7px", fontSize: 10, color: copied ? M[800] : "#888", display: "flex", alignItems: "center", gap: 3, marginTop: 5, transition: "all 0.15s", alignSelf: "flex-start" }}>
      {copied
        ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>Copied</>
        : <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy</>
      }
    </button>
  );
}

// ─── Spinning UFO Canvas (top-down, centered, behind the FAB) ─────────────────
// The saucer is stationary — it spins in-place like a top.
// Proximity (cursor distance) controls spin speed only.
function SpinningUFO({ fabRef }) {
  const canvasRef = useRef(null);
  const spinRef   = useRef(0);   // current angular velocity
  const targetRef = useRef(0);   // proximity 0→1

  // Proximity detection
  useEffect(() => {
    const onMove = (e) => {
      const el = fabRef.current; if (!el) return;
      const r  = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      targetRef.current = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 200);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    let angle = 0, last = performance.now(), raf;

    const render = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;

      // Lerp spin speed: idle ~0.8 rad/s → near ~6.5 rad/s
      spinRef.current += (targetRef.current - spinRef.current) * 0.05;
      const spd = spinRef.current;
      angle += (0.8 + spd * 5.7) * dt;

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const rx = 38, ry = 13.5; // wide flat saucer ellipse

      // ── outer engine glow ring (pulsing, brightens with speed) ──
      const pulse = 0.22 + 0.14 * Math.sin(now / 180);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx + 5, ry + 4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,145,20,${pulse + spd * 0.25})`;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // second softer glow
      ctx.beginPath();
      ctx.ellipse(0, 0, rx + 9, ry + 7, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,100,0,${(pulse * 0.5) + spd * 0.12})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── drop shadow ──
      ctx.beginPath();
      ctx.ellipse(1.5, 2.5, rx - 3, ry - 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fill();

      // ── main saucer body ──
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#c85608";
      ctx.fill();

      // ── upper face band (lighter centre) ──
      ctx.beginPath();
      ctx.ellipse(0, -1.5, rx * 0.78, ry * 0.58, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#e8720f";
      ctx.fill();

      // ── rim highlight ──
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff9d40";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // ── panel lines (radiating spoke marks on the disc) ──
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.8;
      for (let s = 0; s < 8; s++) {
        const sa = (s / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * 13, Math.sin(sa) * 5);
        ctx.lineTo(Math.cos(sa) * (rx - 4), Math.sin(sa) * (ry - 2));
        ctx.stroke();
      }

      // ── dome (centre viewed from above) ──
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#ff8c2a";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,180,60,0.5)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      // dome glare
      ctx.beginPath();
      ctx.ellipse(-3.5, -2.5, 5.5, 3, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,225,140,0.3)";
      ctx.fill();

      // ── 6 rotating window lights on the inner rim ──
      for (let w = 0; w < 6; w++) {
        const wa = (w / 6) * Math.PI * 2;
        const wx = Math.cos(wa) * (rx * 0.62);
        const wy = Math.sin(wa) * (ry * 0.62);
        const blink = 0.35 + 0.55 * Math.sin(now / 260 + w * 1.05);
        ctx.beginPath();
        ctx.arc(wx, wy, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,240,130,${blink})`;
        ctx.fill();
      }

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={90}
      height={90}
      style={{
        position: "absolute",
        // centre behind the FAB, pushed slightly down so saucer peeks out below
        top: "50%", left: "50%",
        transform: "translate(-50%, -44%)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ─── Space Loader FAB ─────────────────────────────────────────────────────────
function SpaceLoaderFAB({ onClick, open, unread }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative", zIndex: 1,
        width: 56, height: 56, borderRadius: "50%",
        border: "none", cursor: "pointer", padding: 0,
        background: "transparent", overflow: "hidden",
        flexShrink: 0,
      }}
      aria-label="Open AI Chat"
    >
      {open ? (
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#1a1a2e", border: "1.5px solid #3d7a3d", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
      ) : (
        <div className="space-loader-fab">
          <div className="fab-stars fab-stars-near" />
          <div className="fab-stars fab-stars-mid" />
          <div className="fab-astronaut">
            <div className="fab-helmet">
              <div className="fab-visor" />
              <div className="fab-antenna" />
            </div>
            <div className="fab-body" />
            <div className="fab-arm fab-arm-l" />
            <div className="fab-arm fab-arm-r" />
          </div>
          <div className="fab-meteor fab-meteor-1" />
          <div className="fab-meteor fab-meteor-2" />
        </div>
      )}
      {!open && unread > 0 && (
        <span style={{ position: "absolute", top: -2, right: -2, background: M[600], color: "#fff", fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", zIndex: 2 }}>{unread}</span>
      )}
    </button>
  );
}

const SUGGESTIONS = ["What is Spring AI?", "How does React routing work?", "Explain REST APIs simply", "Best CSS layout techniques?"];

// ─── Main ChatBot ─────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "Hey there! 👋 I'm your **AI assistant**.\n\nAsk me anything about code, design, or writing — I'm here to help!", time: new Date() }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [unread,  setUnread]  = useState(0);
  const bottomRef = useRef(null), inputRef = useRef(null), fabRef = useRef(null);

  useEffect(() => { if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 150); } }, [open]);
  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, open]);

  const sendMessage = async (text) => {
    const msg = text || input.trim(); if (!msg || loading) return;
    setInput("");
    setMessages(p => [...p, { role: "user", text: msg, time: new Date() }]);
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:8081/ai/chat?message=${encodeURIComponent(msg)}`);
      if (!res.ok) throw new Error();
      const data = await res.text();
      setMessages(p => [...p, { role: "bot", text: data, time: new Date() }]);
      if (!open) setUnread(u => u + 1);
    } catch {
      setMessages(p => [...p, { role: "bot", text: "⚠️ Couldn't reach the AI server.", time: new Date(), error: true }]);
    } finally { setLoading(false); }
  };

  const fmt = d => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        @keyframes bdot     { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes fadeup   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulsedot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fabSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fabFloat { 0%,100%{transform:translate(-50%,-54%) rotate(-3deg)} 50%{transform:translate(-50%,-48%) rotate(3deg)} }
        @keyframes fabMeteor{ 0%{transform:translate(0,0) rotate(45deg);opacity:0} 20%{opacity:1} 80%{opacity:1} 100%{transform:translate(58px,58px) rotate(45deg);opacity:0} }
        @keyframes fabBlink { 0%,100%{opacity:0.3} 50%{opacity:1} }

        .space-loader-fab {
          width:56px;height:56px;border-radius:50%;
          background:radial-gradient(circle at 35% 30%,#1a1a2e,#080810);
          border:1.5px solid rgba(61,122,61,0.55);
          position:relative;overflow:hidden;
          box-shadow:0 0 18px rgba(0,0,0,0.5);
        }
        .fab-stars { position:absolute;inset:0;border-radius:50%;
          background-image:
            radial-gradient(1px 1px at 18% 22%,#fff 100%,transparent),
            radial-gradient(1px 1px at 72% 14%,#fff 100%,transparent),
            radial-gradient(1px 1px at 44% 68%,#fff 100%,transparent),
            radial-gradient(1px 1px at 83% 58%,#fff 100%,transparent),
            radial-gradient(1px 1px at 27% 82%,#fff 100%,transparent),
            radial-gradient(1px 1px at 62% 38%,#fff 100%,transparent),
            radial-gradient(1px 1px at 10% 50%,#fff 100%,transparent),
            radial-gradient(1px 1px at 90% 32%,#fff 100%,transparent);
        }
        .fab-stars-near { animation:fabSpin 14s linear infinite;opacity:.85; }
        .fab-stars-mid  { animation:fabSpin 22s linear infinite reverse;opacity:.45; }
        .fab-astronaut  { position:absolute;left:50%;top:44%;animation:fabFloat 3s ease-in-out infinite; }
        .fab-helmet     { position:absolute;width:13px;height:13px;background:linear-gradient(145deg,#fff,#e6e6e6);border-radius:50%;top:-13px;left:-6.5px;box-shadow:inset -1px -1px 3px rgba(0,0,0,.2); }
        .fab-visor      { position:absolute;width:8px;height:6px;background:linear-gradient(135deg,rgba(0,210,220,.3),rgba(0,80,220,.15));border-radius:50% 50% 45% 45%;top:3.5px;left:2.5px; }
        .fab-antenna    { position:absolute;width:2px;height:5px;background:#bbb;top:-5px;left:5.5px; }
        .fab-antenna::after { content:"";position:absolute;width:3px;height:3px;background:#ff3333;border-radius:50%;top:-2px;left:-0.5px;animation:fabBlink 1s ease-in-out infinite; }
        .fab-body       { position:absolute;width:13px;height:15px;background:linear-gradient(145deg,#fff,#f0f0f0);border-radius:6px;top:0;left:-6.5px;box-shadow:inset -2px -2px 4px rgba(0,0,0,.15); }
        .fab-arm        { position:absolute;width:5px;height:10px;background:#fff;border-radius:3px;top:2px; }
        .fab-arm-l      { left:-11px;transform:rotate(20deg); }
        .fab-arm-r      { left:6px;transform:rotate(-20deg); }
        .fab-meteor     { position:absolute;width:1.5px;height:1.5px;background:white;border-radius:50%; }
        .fab-meteor::after { content:"";position:absolute;top:50%;right:0;width:10px;height:0.5px;background:linear-gradient(to left,white,transparent);transform:translateY(-50%); }
        .fab-meteor-1   { animation:fabMeteor 2.4s linear infinite;top:25%;left:8%; }
        .fab-meteor-2   { animation:fabMeteor 3.6s linear infinite 1.3s;top:60%;left:6%; }

        .cb-msg    { animation:fadeup 0.22s ease; }
        .cb-scroll::-webkit-scrollbar       { width:3px; }
        .cb-scroll::-webkit-scrollbar-thumb { background:${M[200]};border-radius:2px; }
        .cb-inp:focus  { border-color:${M[400]} !important;outline:none; }
        .cb-inp::placeholder { color:#aaa; }
        .cb-sug:hover  { background:${M[600]} !important;color:#fff !important;border-color:${M[600]} !important; }
        .cb-hbtn:hover { background:${M[50]}; }
      `}</style>

      {/* ── FAB area: UFO spins behind, astronaut button on top ── */}
      <div
        ref={fabRef}
        style={{
          position: "fixed", bottom: 22, right: 22,
          width: 72, height: 72,          // larger wrapper so UFO saucer peeks out
          zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Spinning UFO — z-index 0, behind the FAB */}
        <SpinningUFO fabRef={fabRef} />
        {/* Astronaut FAB — z-index 1, on top of UFO */}
        <SpaceLoaderFAB onClick={() => setOpen(o => !o)} open={open} unread={unread} />
      </div>

      {/* ── Chat Window ── */}
      <div style={{
        position: "fixed", bottom: 104, right: 22, width: 378, maxHeight: 575,
        background: "rgba(242,247,240,0.45)",
        backdropFilter: "blur(28px) saturate(180%)", WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(184,219,184,0.55)", borderRadius: 20,
        display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 9998,
        boxShadow: "0 20px 56px rgba(30,74,30,0.14),0 0 0 0.5px rgba(61,122,61,0.12),inset 0 1px 0 rgba(255,255,255,0.6)",
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0) scale(1)" : "translateY(18px) scale(0.96)",
        pointerEvents: open ? "all" : "none",
        transition: "opacity 0.24s ease, transform 0.24s ease",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", background: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(184,219,184,0.5)", flexShrink: 0, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 35, height: 35, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%,#2a2a4e,#0f0f1e)", border: `1.5px solid ${M[400]}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 8px rgba(61,122,61,0.3),inset 0 0 8px rgba(255,255,255,0.05)`, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", backgroundImage: "radial-gradient(1px 1px at 20% 30%,white 100%,transparent),radial-gradient(1px 1px at 75% 20%,white 100%,transparent),radial-gradient(1px 1px at 50% 70%,white 100%,transparent),radial-gradient(1px 1px at 80% 65%,white 100%,transparent)", opacity: 0.7 }} />
              <span style={{ fontSize: 14, position: "relative", zIndex: 1 }}>🚀</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: M[900] }}>Blog Assistant</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: M[600], marginTop: 1 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulsedot 2s infinite" }} />
                AI-powered · Spring AI
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <button className="cb-hbtn" title="Clear chat" onClick={() => setMessages([{ role: "bot", text: "Chat cleared! How can I help? 🚀", time: new Date() }])} style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: `1px solid ${M[200]}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: M[600], transition: "all 0.15s" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
            </button>
            <button className="cb-hbtn" onClick={() => setOpen(false)} style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: `1px solid ${M[200]}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: M[600], transition: "all 0.15s" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="cb-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 14px 6px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "thin", scrollbarColor: `${M[200]} transparent` }}>
          {messages.map((msg, i) => (
            <div key={i} className="cb-msg" style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: msg.role === "user" ? "#1a1a1a" : M[600], fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 4 }}>
                {msg.role === "user" ? "Me" : "AI"}
              </div>
              <div style={{ maxWidth: "86%", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ padding: "10px 13px", borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px", background: msg.role === "user" ? "#111" : msg.error ? "rgba(254,226,226,0.95)" : "rgba(242,247,240,0.96)", border: msg.role === "user" ? "none" : msg.error ? "1px solid #fca5a5" : `1px solid ${M[200]}`, boxShadow: msg.role === "bot" && !msg.error ? `0 1px 6px rgba(61,122,61,0.08),inset 0 1px 0 rgba(255,255,255,0.7)` : "0 1px 4px rgba(0,0,0,0.07)" }}>
                  <MessageContent text={msg.text} isUser={msg.role === "user"} />
                  <div style={{ fontSize: 10, color: msg.role === "user" ? "rgba(255,255,255,0.45)" : M[400], marginTop: 6, textAlign: "right" }}>{fmt(msg.time)}</div>
                </div>
                {msg.role === "bot" && !msg.error && <CopyBtn text={msg.text} />}
              </div>
            </div>
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && !loading && (
          <div style={{ padding: "4px 12px 8px", display: "flex", flexWrap: "wrap", gap: 5, flexShrink: 0 }}>
            {SUGGESTIONS.map((s, i) => <button key={i} className="cb-sug" onClick={() => sendMessage(s)} style={{ background: "rgba(255,255,255,0.75)", border: `1px solid ${M[200]}`, borderRadius: 20, padding: "4px 11px", fontSize: 11, color: M[700], cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>{s}</button>)}
          </div>
        )}

        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderTop: "1px solid rgba(184,219,184,0.4)", background: "rgba(255,255,255,0.55)", flexShrink: 0, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
          <textarea ref={inputRef} className="cb-inp" placeholder="Ask me anything..." value={input} rows={1}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            style={{ flex: 1, background: "rgba(255,255,255,0.7)", border: `1px solid ${M[200]}`, borderRadius: 10, padding: "8px 11px", fontSize: 13, color: M[900], resize: "none", fontFamily: "inherit", lineHeight: 1.4, transition: "border-color 0.15s" }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{ width: 34, height: 34, borderRadius: 9, background: input.trim() && !loading ? M[600] : "rgba(255,255,255,0.6)", border: input.trim() && !loading ? "none" : `1px solid ${M[200]}`, cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", color: input.trim() && !loading ? "#fff" : M[300], flexShrink: 0, transition: "all 0.15s", boxShadow: input.trim() && !loading ? "0 2px 10px rgba(61,122,61,0.3)" : "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 10, color: M[400], padding: "3px 0 7px", flexShrink: 0 }}>
          Powered by Spring AI · Enter to send
        </div>
      </div>
    </>
  );
}




// import { useState, useRef, useEffect } from "react";

// // ─── Matcha palette ───────────────────────────────────────────────────────────
// const M = {
//   50:  "#f2f7f0",
//   100: "#dceedd",
//   200: "#b8dbb8",
//   300: "#8cc48c",
//   400: "#6aaa6a",
//   600: "#3d7a3d",
//   700: "#2d5e2d",
//   800: "#1e4a1e",
//   900: "#0f2b0f",
// };

// // ─── Inline markdown parser: **bold**, *italic*, `code`, ***bold-italic*** ────
// function parseInline(text, isUser) {
//   const baseColor = isUser ? "rgba(255,255,255,0.95)" : M[900];
//   const codeColor = isUser ? "rgba(255,255,255,0.9)" : M[800];
//   const codeBg    = isUser ? "rgba(255,255,255,0.18)" : "rgba(61,122,61,0.10)";
//   const codeBorder= isUser ? "rgba(255,255,255,0.3)"  : M[300];

//   // Split on bold-italic, bold, italic, inline-code
//   const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
//   const parts = text.split(regex);

//   return parts.map((part, i) => {
//     if (part.startsWith("***") && part.endsWith("***"))
//       return <strong key={i} style={{ fontStyle: "italic", color: baseColor }}>{part.slice(3, -3)}</strong>;
//     if (part.startsWith("**") && part.endsWith("**"))
//       return <strong key={i} style={{ fontWeight: 650, color: isUser ? "#fff" : M[800], letterSpacing: "-0.01em" }}>{part.slice(2, -2)}</strong>;
//     if (part.startsWith("*") && part.endsWith("*"))
//       return <em key={i} style={{ fontStyle: "italic", color: baseColor, opacity: 0.9 }}>{part.slice(1, -1)}</em>;
//     if (part.startsWith("`") && part.endsWith("`"))
//       return (
//         <code key={i} style={{
//           background: codeBg, border: `1px solid ${codeBorder}`,
//           borderRadius: 4, padding: "1px 5px",
//           fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
//           fontSize: "0.85em", color: codeColor, letterSpacing: 0,
//         }}>{part.slice(1, -1)}</code>
//       );
//     return <span key={i} style={{ color: baseColor }}>{part}</span>;
//   });
// }

// // ─── Full Markdown → JSX renderer ────────────────────────────────────────────
// function MessageContent({ text, isUser }) {
//   const lines = text.split("\n");
//   const nodes = [];
//   let i = 0;

//   while (i < lines.length) {
//     const line = lines[i];

//     // Fenced code block
//     if (line.startsWith("```")) {
//       const lang = line.slice(3).trim();
//       const codeLines = [];
//       i++;
//       while (i < lines.length && !lines[i].startsWith("```")) {
//         codeLines.push(lines[i]);
//         i++;
//       }
//       nodes.push(
//         <div key={`cb-${i}`} style={{
//           background: isUser ? "rgba(0,0,0,0.25)" : "rgba(15,43,15,0.06)",
//           border: `1px solid ${isUser ? "rgba(255,255,255,0.2)" : M[200]}`,
//           borderRadius: 8, overflow: "hidden", margin: "6px 0",
//         }}>
//           {lang && (
//             <div style={{
//               background: isUser ? "rgba(0,0,0,0.2)" : M[100],
//               padding: "3px 10px", fontSize: 10, color: isUser ? "rgba(255,255,255,0.6)" : M[600],
//               fontFamily: "monospace", letterSpacing: "0.05em", textTransform: "uppercase",
//             }}>{lang}</div>
//           )}
//           <pre style={{
//             margin: 0, padding: "10px 12px", fontSize: 12, lineHeight: 1.6,
//             fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
//             color: isUser ? "rgba(255,255,255,0.92)" : M[800],
//             overflowX: "auto", whiteSpace: "pre",
//           }}>{codeLines.join("\n")}</pre>
//         </div>
//       );
//       i++;
//       continue;
//     }

//     // Headings
//     if (line.startsWith("### ")) {
//       nodes.push(
//         <p key={i} style={{
//           margin: "10px 0 3px", fontSize: 13, fontWeight: 650,
//           color: isUser ? "rgba(255,255,255,0.85)" : M[700],
//           letterSpacing: "-0.01em", lineHeight: 1.3,
//         }}>{parseInline(line.slice(4), isUser)}</p>
//       );
//       i++; continue;
//     }
//     if (line.startsWith("## ")) {
//       nodes.push(
//         <p key={i} style={{
//           margin: "12px 0 4px", fontSize: 14, fontWeight: 700,
//           color: isUser ? "#fff" : M[800],
//           letterSpacing: "-0.02em", lineHeight: 1.3,
//           borderBottom: isUser ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${M[200]}`,
//           paddingBottom: 4,
//         }}>{parseInline(line.slice(3), isUser)}</p>
//       );
//       i++; continue;
//     }
//     if (line.startsWith("# ")) {
//       nodes.push(
//         <p key={i} style={{
//           margin: "14px 0 5px", fontSize: 15.5, fontWeight: 750,
//           color: isUser ? "#fff" : M[900],
//           letterSpacing: "-0.03em", lineHeight: 1.25,
//         }}>{parseInline(line.slice(2), isUser)}</p>
//       );
//       i++; continue;
//     }

//     // Blockquote
//     if (line.startsWith("> ")) {
//       nodes.push(
//         <div key={i} style={{
//           borderLeft: `3px solid ${isUser ? "rgba(255,255,255,0.4)" : M[400]}`,
//           paddingLeft: 10, margin: "4px 0",
//           color: isUser ? "rgba(255,255,255,0.75)" : M[700],
//           fontStyle: "italic", fontSize: 12.5,
//         }}>{parseInline(line.slice(2), isUser)}</div>
//       );
//       i++; continue;
//     }

//     // Horizontal rule
//     if (/^---+$/.test(line.trim())) {
//       nodes.push(
//         <hr key={i} style={{
//           border: "none",
//           borderTop: `1px solid ${isUser ? "rgba(255,255,255,0.25)" : M[200]}`,
//           margin: "8px 0",
//         }} />
//       );
//       i++; continue;
//     }

//     // Unordered list — collect consecutive bullet lines
//     if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
//       const items = [];
//       while (
//         i < lines.length &&
//         (lines[i].startsWith("- ") || lines[i].startsWith("* ") || lines[i].startsWith("• "))
//       ) {
//         items.push(lines[i].replace(/^[-*•]\s/, ""));
//         i++;
//       }
//       nodes.push(
//         <ul key={`ul-${i}`} style={{ margin: "4px 0", paddingLeft: 0, listStyle: "none" }}>
//           {items.map((item, j) => (
//             <li key={j} style={{
//               display: "flex", gap: 7, alignItems: "flex-start",
//               fontSize: 13, lineHeight: 1.55, marginBottom: 3,
//               color: isUser ? "rgba(255,255,255,0.9)" : M[900],
//             }}>
//               <span style={{
//                 marginTop: 5, width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
//                 background: isUser ? "rgba(255,255,255,0.6)" : M[400],
//               }} />
//               <span>{parseInline(item, isUser)}</span>
//             </li>
//           ))}
//         </ul>
//       );
//       continue;
//     }

//     // Ordered list — collect consecutive numbered lines
//     if (/^\d+\.\s/.test(line)) {
//       const items = [];
//       let num = 1;
//       while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
//         items.push({ n: num++, text: lines[i].replace(/^\d+\.\s/, "") });
//         i++;
//       }
//       nodes.push(
//         <ol key={`ol-${i}`} style={{ margin: "4px 0", paddingLeft: 0, listStyle: "none" }}>
//           {items.map((item, j) => (
//             <li key={j} style={{
//               display: "flex", gap: 8, alignItems: "flex-start",
//               fontSize: 13, lineHeight: 1.55, marginBottom: 4,
//             }}>
//               <span style={{
//                 flexShrink: 0, width: 18, height: 18, borderRadius: "50%",
//                 background: isUser ? "rgba(255,255,255,0.22)" : M[100],
//                 border: `1px solid ${isUser ? "rgba(255,255,255,0.3)" : M[300]}`,
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 fontSize: 9, fontWeight: 700, marginTop: 1,
//                 color: isUser ? "rgba(255,255,255,0.85)" : M[700],
//               }}>{item.n}</span>
//               <span style={{ color: isUser ? "rgba(255,255,255,0.9)" : M[900] }}>
//                 {parseInline(item.text, isUser)}
//               </span>
//             </li>
//           ))}
//         </ol>
//       );
//       continue;
//     }

//     // Empty line → spacer
//     if (line.trim() === "") {
//       nodes.push(<div key={i} style={{ height: 5 }} />);
//       i++; continue;
//     }

//     // Normal paragraph
//     nodes.push(
//       <p key={i} style={{
//         margin: 0, fontSize: 13, lineHeight: 1.62,
//         color: isUser ? "rgba(255,255,255,0.93)" : M[900],
//       }}>
//         {parseInline(line, isUser)}
//       </p>
//     );
//     i++;
//   }

//   return <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>{nodes}</div>;
// }

// // ─── Typing Indicator ─────────────────────────────────────────────────────────
// function TypingIndicator() {
//   return (
//     <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 4 }}>
//       <div style={{
//         width: 26, height: 26, borderRadius: "50%", background: M[600],
//         display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0,
//       }}>AI</div>
//       <div style={{
//         background: "rgba(242,247,240,0.95)", border: `1px solid ${M[200]}`,
//         borderRadius: "14px 14px 14px 3px", padding: "11px 16px",
//         display: "flex", gap: 5, alignItems: "center",
//       }}>
//         {[0, 1, 2].map(i => (
//           <span key={i} style={{
//             width: 6, height: 6, borderRadius: "50%", background: M[600],
//             display: "inline-block",
//             animation: `bdot 1.2s ${i * 0.2}s infinite ease-in-out`,
//           }} />
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── Copy Button ──────────────────────────────────────────────────────────────
// function CopyBtn({ text }) {
//   const [copied, setCopied] = useState(false);
//   const copy = () => {
//     navigator.clipboard?.writeText(text).then(() => {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1500);
//     });
//   };
//   return (
//     <button onClick={copy} style={{
//       background: "none", border: `1px solid ${copied ? M[400] : M[200]}`,
//       borderRadius: 6, cursor: "pointer", padding: "2px 7px", fontSize: 10,
//       color: copied ? M[800] : "#888",
//       display: "flex", alignItems: "center", gap: 3,
//       marginTop: 5, transition: "all 0.15s", alignSelf: "flex-start",
//     }}>
//       {copied ? (
//         <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>Copied</>
//       ) : (
//         <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy</>
//       )}
//     </button>
//   );
// }

// // ─── Proximity Ring ───────────────────────────────────────────────────────────
// function ProximityRing({ fabRef }) {
//   const canvasRef = useRef(null);
//   const speedRef  = useRef(0);
//   const targetRef = useRef(0);
//   const angleRef  = useRef(0);

//   useEffect(() => {
//     const onMove = (e) => {
//       const el = fabRef.current; if (!el) return;
//       const r = el.getBoundingClientRect();
//       const dx = e.clientX - (r.left + r.width / 2);
//       const dy = e.clientY - (r.top  + r.height / 2);
//       targetRef.current = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 200);
//     };
//     window.addEventListener("mousemove", onMove);
//     return () => window.removeEventListener("mousemove", onMove);
//   }, []);

//   useEffect(() => {
//     const canvas = canvasRef.current; if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, radius = 36;
//     let last = performance.now(), raf;

//     const render = (now) => {
//       const dt = Math.min((now - last) / 1000, 0.05); last = now;
//       speedRef.current += (targetRef.current - speedRef.current) * 0.06;
//       const spd = speedRef.current;
//       angleRef.current += (0.4 + spd * 5.5) * dt;
//       ctx.clearRect(0, 0, W, H);

//       ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
//       ctx.strokeStyle = `rgba(61,122,61,${0.18 + spd * 0.12})`; ctx.lineWidth = 1.5; ctx.stroke();

//       const arcLen = (0.3 + spd * 0.55) * Math.PI * 2;
//       ctx.beginPath(); ctx.arc(cx, cy, radius, angleRef.current, angleRef.current + arcLen);
//       ctx.strokeStyle = `rgba(61,122,61,${0.55 + spd * 0.45})`; ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.stroke();

//       const dotX = cx + Math.cos(angleRef.current + arcLen) * radius;
//       const dotY = cy + Math.sin(angleRef.current + arcLen) * radius;
//       ctx.beginPath(); ctx.arc(dotX, dotY, 2.8, 0, Math.PI * 2);
//       ctx.fillStyle = `rgba(61,122,61,${0.75 + spd * 0.25})`; ctx.fill();

//       raf = requestAnimationFrame(render);
//     };
//     raf = requestAnimationFrame(render);
//     return () => cancelAnimationFrame(raf);
//   }, []);

//   return (
//     <canvas ref={canvasRef} width={100} height={100} style={{
//       position: "absolute", top: "50%", left: "50%",
//       transform: "translate(-50%,-50%)", pointerEvents: "none",
//     }} />
//   );
// }

// // ─── Suggestion chips ─────────────────────────────────────────────────────────
// const SUGGESTIONS = [
//   "What is Spring AI?",
//   "How does React routing work?",
//   "Explain REST APIs simply",
//   "Best CSS layout techniques?",
// ];

// // ─── Main ChatBot ─────────────────────────────────────────────────────────────
// export default function ChatBot() {
//   const [open,     setOpen]     = useState(false);
//   const [messages, setMessages] = useState([{
//     role: "bot",
//     text: "Hey there! 👋 I'm your **AI assistant**.\n\nAsk me anything about code, design, or writing — I'm here to help!",
//     time: new Date(),
//   }]);
//   const [input,   setInput]   = useState("");
//   const [loading, setLoading] = useState(false);
//   const [unread,  setUnread]  = useState(0);
//   const bottomRef = useRef(null), inputRef = useRef(null), fabRef = useRef(null);

//   useEffect(() => {
//     if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 150); }
//   }, [open]);

//   useEffect(() => {
//     if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading, open]);

//   const sendMessage = async (text) => {
//     const msg = text || input.trim();
//     if (!msg || loading) return;
//     setInput("");
//     setMessages(p => [...p, { role: "user", text: msg, time: new Date() }]);
//     setLoading(true);
//     try {
//       const res = await fetch(`http://localhost:8081/ai/chat?message=${encodeURIComponent(msg)}`);
//       if (!res.ok) throw new Error();
//       const data = await res.text();
//       setMessages(p => [...p, { role: "bot", text: data, time: new Date() }]);
//       if (!open) setUnread(u => u + 1);
//     } catch {
//       setMessages(p => [...p, {
//         role: "bot", text: "⚠️ Couldn't reach the AI server.", time: new Date(), error: true,
//       }]);
//     } finally { setLoading(false); }
//   };

//   const fmt = d => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

//   return (
//     <>
//       <style>{`
//         @keyframes bdot {
//           0%,80%,100% { transform:scale(0.6); opacity:0.4; }
//           40%          { transform:scale(1);   opacity:1;   }
//         }
//         @keyframes fadeup {
//           from { opacity:0; transform:translateY(8px); }
//           to   { opacity:1; transform:translateY(0);   }
//         }
//         @keyframes pulsedot {
//           0%,100% { opacity:1;   }
//           50%      { opacity:0.3; }
//         }
//         .cb-msg    { animation: fadeup 0.22s ease; }
//         .cb-scroll::-webkit-scrollbar       { width: 3px; }
//         .cb-scroll::-webkit-scrollbar-thumb { background: ${M[200]}; border-radius: 2px; }
//         .cb-inp:focus  { border-color: ${M[400]} !important; outline: none; }
//         .cb-inp::placeholder { color: #aaa; }
//         .cb-sug:hover  { background: ${M[600]} !important; color: #fff !important; border-color: ${M[600]} !important; }
//         .cb-hbtn:hover { background: ${M[50]}; }
//       `}</style>

//       {/* ── FAB ── */}
//       <div ref={fabRef} style={{
//         position: "fixed", bottom: 28, right: 28, width: 56, height: 56,
//         zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
//       }}>
//         <ProximityRing fabRef={fabRef} />
//         <button onClick={() => setOpen(o => !o)} style={{
//           position: "relative", zIndex: 1, width: 52, height: 52, borderRadius: "50%",
//           background: open ? M[800] : "#fff", border: `1.5px solid ${M[600]}`,
//           cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
//           color: open ? "#fff" : M[600], boxShadow: `0 2px 14px rgba(61,122,61,0.2)`,
//           transition: "all 0.2s", flexShrink: 0,
//         }}>
//           {open
//             ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//                 <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
//               </svg>
//             : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={M[600]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//                 <circle cx="9" cy="10" r="1" fill={M[600]} />
//                 <circle cx="12" cy="10" r="1" fill={M[600]} />
//                 <circle cx="15" cy="10" r="1" fill={M[600]} />
//               </svg>
//           }
//           {!open && unread > 0 && (
//             <span style={{
//               position: "absolute", top: -2, right: -2,
//               background: M[600], color: "#fff", fontSize: 9, fontWeight: 700,
//               width: 16, height: 16, borderRadius: "50%",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               border: "2px solid #fff",
//             }}>{unread}</span>
//           )}
//         </button>
//       </div>

//       {/* ── Chat Window ── */}
//       <div style={{
//         position: "fixed", bottom: 96, right: 28, width: 378, maxHeight: 575,
//         background: "rgba(242,247,240,0.45)",
//         backdropFilter: "blur(28px) saturate(180%)",
//         WebkitBackdropFilter: "blur(28px) saturate(180%)",
//         border: "1px solid rgba(184,219,184,0.55)", borderRadius: 20,
//         display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 9998,
//         boxShadow: `0 20px 56px rgba(30,74,30,0.14), 0 0 0 0.5px rgba(61,122,61,0.12), inset 0 1px 0 rgba(255,255,255,0.6)`,
//         opacity: open ? 1 : 0,
//         transform: open ? "translateY(0) scale(1)" : "translateY(18px) scale(0.96)",
//         pointerEvents: open ? "all" : "none",
//         transition: "opacity 0.24s ease, transform 0.24s ease",
//       }}>

//         {/* Header */}
//         <div style={{
//           display: "flex", alignItems: "center", justifyContent: "space-between",
//           padding: "13px 14px", background: "rgba(255,255,255,0.55)",
//           borderBottom: "1px solid rgba(184,219,184,0.5)", flexShrink: 0,
//           backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
//         }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{
//               width: 35, height: 35, borderRadius: "50%", background: M[600],
//               display: "flex", alignItems: "center", justifyContent: "center",
//               flexShrink: 0, boxShadow: `0 2px 8px rgba(61,122,61,0.3)`,
//             }}>
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
//               </svg>
//             </div>
//             <div>
//               <div style={{ fontSize: 13, fontWeight: 600, color: M[900] }}>Blog Assistant</div>
//               <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: M[600], marginTop: 1 }}>
//                 <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulsedot 2s infinite" }} />
//                 AI-powered · Spring AI
//               </div>
//             </div>
//           </div>
//           <div style={{ display: "flex", gap: 5 }}>
//             <button className="cb-hbtn" title="Clear chat"
//               onClick={() => setMessages([{ role: "bot", text: "Chat cleared! How can I help? 🚀", time: new Date() }])}
//               style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: `1px solid ${M[200]}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: M[600], transition: "all 0.15s" }}>
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//                 <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
//               </svg>
//             </button>
//             <button className="cb-hbtn" onClick={() => setOpen(false)}
//               style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: `1px solid ${M[200]}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: M[600], transition: "all 0.15s" }}>
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//                 <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Messages */}
//         <div className="cb-scroll" style={{
//           flex: 1, overflowY: "auto", padding: "14px 14px 6px",
//           display: "flex", flexDirection: "column", gap: 10,
//           scrollbarWidth: "thin", scrollbarColor: `${M[200]} transparent`,
//         }}>
//           {messages.map((msg, i) => (
//             <div key={i} className="cb-msg" style={{
//               display: "flex", alignItems: "flex-end", gap: 8,
//               flexDirection: msg.role === "user" ? "row-reverse" : "row",
//             }}>
//               <div style={{
//                 width: 26, height: 26, borderRadius: "50%",
//                 background: msg.role === "user" ? "#1a1a1a" : M[600],
//                 fontSize: 9, fontWeight: 700, color: "#fff",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 flexShrink: 0, marginBottom: 4,
//               }}>
//                 {msg.role === "user" ? "Me" : "AI"}
//               </div>
//               <div style={{
//                 maxWidth: "86%", display: "flex", flexDirection: "column",
//                 alignItems: msg.role === "user" ? "flex-end" : "flex-start",
//               }}>
//                 <div style={{
//                   padding: "10px 13px",
//                   borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
//                   background: msg.role === "user" ? "#111" : msg.error ? "rgba(254,226,226,0.95)" : "rgba(242,247,240,0.96)",
//                   border: msg.role === "user" ? "none" : msg.error ? "1px solid #fca5a5" : `1px solid ${M[200]}`,
//                   boxShadow: msg.role === "bot" && !msg.error
//                     ? `0 1px 6px rgba(61,122,61,0.08), inset 0 1px 0 rgba(255,255,255,0.7)`
//                     : "0 1px 4px rgba(0,0,0,0.07)",
//                 }}>
//                   <MessageContent text={msg.text} isUser={msg.role === "user"} />
//                   <div style={{
//                     fontSize: 10,
//                     color: msg.role === "user" ? "rgba(255,255,255,0.45)" : M[400],
//                     marginTop: 6, textAlign: "right",
//                   }}>{fmt(msg.time)}</div>
//                 </div>
//                 {msg.role === "bot" && !msg.error && <CopyBtn text={msg.text} />}
//               </div>
//             </div>
//           ))}
//           {loading && <TypingIndicator />}
//           <div ref={bottomRef} />
//         </div>

//         {/* Suggestions */}
//         {messages.length === 1 && !loading && (
//           <div style={{ padding: "4px 12px 8px", display: "flex", flexWrap: "wrap", gap: 5, flexShrink: 0 }}>
//             {SUGGESTIONS.map((s, i) => (
//               <button key={i} className="cb-sug" onClick={() => sendMessage(s)}
//                 style={{ background: "rgba(255,255,255,0.75)", border: `1px solid ${M[200]}`, borderRadius: 20, padding: "4px 11px", fontSize: 11, color: M[700], cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
//                 {s}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Input */}
//         <div style={{
//           display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
//           borderTop: "1px solid rgba(184,219,184,0.4)",
//           background: "rgba(255,255,255,0.55)", flexShrink: 0,
//           backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
//         }}>
//           <textarea ref={inputRef} className="cb-inp" placeholder="Ask me anything..."
//             value={input} rows={1}
//             onChange={e => setInput(e.target.value)}
//             onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
//             style={{
//               flex: 1, background: "rgba(255,255,255,0.7)", border: `1px solid ${M[200]}`,
//               borderRadius: 10, padding: "8px 11px", fontSize: 13, color: M[900],
//               resize: "none", fontFamily: "inherit", lineHeight: 1.4, transition: "border-color 0.15s",
//             }}
//           />
//           <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
//             width: 34, height: 34, borderRadius: 9,
//             background: input.trim() && !loading ? M[600] : "rgba(255,255,255,0.6)",
//             border: input.trim() && !loading ? "none" : `1px solid ${M[200]}`,
//             cursor: input.trim() && !loading ? "pointer" : "default",
//             display: "flex", alignItems: "center", justifyContent: "center",
//             color: input.trim() && !loading ? "#fff" : M[300],
//             flexShrink: 0, transition: "all 0.15s",
//             boxShadow: input.trim() && !loading ? `0 2px 10px rgba(61,122,61,0.3)` : "none",
//           }}>
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//               <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
//             </svg>
//           </button>
//         </div>

//         <div style={{ textAlign: "center", fontSize: 10, color: M[400], padding: "3px 0 7px", flexShrink: 0 }}>
//           Powered by Spring AI · Enter to send
//         </div>
//       </div>
//     </>
//   );
// }
