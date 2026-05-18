import { useState, useRef, useCallback, useEffect } from "react";

const MODS = {
  deepdown: {
    id: "deepdown", name: "DeepDown", sub: "Dermatological Analysis Engine",
    tag: "SKIN · CV · EfficientNet-B4", color: "#00ffaa", glow: "#00ffaa40",
    desc: "Upload a skin lesion image for AI-powered classification, malignancy detection, and risk stratification.",
    accepts: "image/jpeg,image/png,image/webp", hint: "JPG · PNG · WEBP · Max 10MB",
    icon: "◈", grad: "linear-gradient(135deg,#00ffaa15,#00ffaa05)",
  },
  alzmind: {
    id: "alzmind", name: "AlzMind", sub: "Neurological Imaging Engine",
    tag: "MRI · ViT · LOCAL MODEL", color: "#a78bfa", glow: "#a78bfa40",
    desc: "Upload a brain MRI scan for Alzheimer's staging, CDR scoring, and neurodegeneration analysis.",
    accepts: "image/jpeg,image/png,image/webp,.dcm", hint: "DICOM · JPG · PNG · Max 15MB",
    icon: "◉", grad: "linear-gradient(135deg,#a78bfa15,#a78bfa05)",
  },
};

const RISK_CFG = {
  LOW:      { col: "#00ffaa", label: "LOW RISK",   pulse: false },
  MODERATE: { col: "#fbbf24", label: "MODERATE",   pulse: true  },
  HIGH:     { col: "#f87171", label: "HIGH RISK",  pulse: true  },
  CRITICAL: { col: "#ef4444", label: "⚠ CRITICAL", pulse: true  },
};

const fmtSize = b => b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${Math.round(b/1024)} KB`;

function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    const pts = Array.from({length:55},()=>({
      x:Math.random()*c.width, y:Math.random()*c.height,
      vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25,
      r:Math.random()*1.5+.4,
      col:Math.random()>.5?"#00ffaa":"#a78bfa",
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=c.width; if(p.x>c.width)p.x=0;
        if(p.y<0)p.y=c.height; if(p.y>c.height)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.col+"55"; ctx.fill();
      });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<110){
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(100,180,255,${.12*(1-d/110)})`; ctx.lineWidth=.4; ctx.stroke();
        }
      }));
      raf=requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize",resize);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:.45}}/>;
}

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
@keyframes slideIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 8px currentColor}50%{box-shadow:0 0 24px currentColor,0 0 48px currentColor}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes scanbar{0%{top:-4px}100%{top:100%}}
@keyframes blink{0%,100%{opacity:.2}50%{opacity:1}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes cornerBlink{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes scanlines{0%{background-position:0 0}100%{background-position:0 100px}}
.hdr{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,rgba(4,13,26,.96) 0%,transparent 100%);backdrop-filter:blur(16px);border-bottom:1px solid rgba(15,42,74,.6)}
.hdr-logo{font-family:'Share Tech Mono',monospace;font-size:18px;color:var(--bright);letter-spacing:.2em;display:flex;align-items:center;gap:10px}
.hdr-dot{width:8px;height:8px;border-radius:50%;background:var(--dd);animation:pulseGlow 2s ease infinite;color:var(--dd)}
.hdr-status{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);display:flex;align-items:center;gap:18px}
.hdr-si{display:flex;align-items:center;gap:6px}
.hdr-sd{width:5px;height:5px;border-radius:50%}
.hdr-sd.on{background:var(--dd);animation:pulse 2s ease infinite}
.warn-strip{position:fixed;top:54px;left:0;right:0;z-index:99;padding:6px 40px;display:flex;align-items:center;gap:10px;font-family:'Share Tech Mono',monospace;font-size:10px;color:#fbbf2455;letter-spacing:.1em;background:linear-gradient(90deg,transparent,#fbbf2406,transparent);border-bottom:1px solid #fbbf2412;animation:fadeIn .5s ease .5s both}
.scanlines-overlay{position:fixed;inset:0;z-index:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,170,.012) 2px,rgba(0,255,170,.012) 4px);animation:scanlines 6s linear infinite;opacity:.8}
.main-wrap{position:relative;z-index:1;padding:120px 24px 40px;display:flex;flex-direction:column;align-items:center}
.eyebrow{font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.28em;color:var(--muted);margin-bottom:20px;text-align:center;animation:fadeUp .6s ease .2s both}
.hero-title{font-family:'Rajdhani',sans-serif;font-size:clamp(52px,8vw,90px);font-weight:700;color:var(--bright);line-height:1;text-align:center;margin-bottom:12px;animation:fadeUp .6s ease .3s both;text-shadow:0 0 80px rgba(0,255,170,.15),0 0 160px rgba(167,139,250,.08)}
.hero-title .dd{color:var(--dd);text-shadow:0 0 30px var(--dd)}
.hero-title .az{color:var(--az);text-shadow:0 0 30px var(--az)}
.hero-sub-line{font-family:'Rajdhani',sans-serif;font-size:clamp(16px,2.5vw,22px);font-weight:300;color:var(--text);text-align:center;opacity:.6;margin-bottom:12px;letter-spacing:.08em;animation:fadeUp .6s ease .4s both}
.hero-desc{font-size:14px;color:var(--text);text-align:center;max-width:500px;line-height:1.8;margin-bottom:52px;opacity:.6;animation:fadeUp .6s ease .5s both}
.stats-row{display:flex;gap:0;margin-bottom:60px;animation:fadeUp .6s ease .6s both;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--bg2)}
.stat{text-align:center;padding:20px 36px;position:relative}
.stat+.stat{border-left:1px solid var(--border)}
.stat-n{font-family:'Rajdhani',sans-serif;font-size:30px;font-weight:700;color:var(--bright);display:block;line-height:1}
.stat-n.c-dd{color:var(--dd)}
.stat-n.c-az{color:var(--az)}
.stat-l{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:.15em;margin-top:4px}
.mod-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;width:100%;max-width:880px;margin-bottom:36px;animation:fadeUp .6s ease .7s both}
.mod-card{position:relative;border-radius:14px;padding:30px;cursor:pointer;overflow:hidden;transition:transform .25s,box-shadow .25s;border:1px solid var(--border);background:var(--bg2);animation:floatY 7s ease infinite}
.mod-card:last-child{animation-delay:3.5s}
.mod-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .3s;background:var(--grad)}
.mod-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--c),transparent);opacity:0;transition:opacity .3s}
.mod-card:hover::before,.mod-card.sel::before{opacity:1}
.mod-card:hover::after,.mod-card.sel::after{opacity:1}
.mod-card:hover{transform:translateY(-5px) scale(1.01);box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 50px var(--glow)}
.mod-card.sel{border-color:var(--c);box-shadow:0 0 50px var(--glow),inset 0 0 40px rgba(0,0,0,.2)}
.corner{position:absolute;width:12px;height:12px;animation:cornerBlink 3s ease infinite}
.corner.tl{top:8px;left:8px;border-top:1.5px solid var(--c);border-left:1.5px solid var(--c)}
.corner.tr{top:8px;right:8px;border-top:1.5px solid var(--c);border-right:1.5px solid var(--c);animation-delay:1s}
.corner.bl{bottom:8px;left:8px;border-bottom:1.5px solid var(--c);border-left:1.5px solid var(--c);animation-delay:.5s}
.corner.br{bottom:8px;right:8px;border-bottom:1.5px solid var(--c);border-right:1.5px solid var(--c);animation-delay:1.5s}
.mod-icon{font-size:38px;color:var(--c);margin-bottom:14px;display:block;text-shadow:0 0 20px var(--c);animation:floatY 4s ease infinite}
.mod-tag{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.16em;color:var(--c);opacity:.7;margin-bottom:8px}
.mod-name{font-family:'Rajdhani',sans-serif;font-size:32px;font-weight:700;color:var(--bright);margin-bottom:4px;line-height:1}
.mod-sub{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);margin-bottom:14px;letter-spacing:.05em}
.mod-desc{font-size:13px;color:var(--text);line-height:1.7;opacity:.75}
.panel{width:100%;max-width:880px;background:var(--bg2);border:1px solid var(--border);border-radius:16px;overflow:hidden;animation:fadeUp .4s ease;position:relative}
.panel-bar{height:2px;background:linear-gradient(90deg,transparent,var(--c),var(--c),transparent);animation:pulse 2s ease infinite}
.panel-hdr{padding:22px 30px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.panel-tag{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--c);letter-spacing:.16em;margin-bottom:4px}
.panel-name{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:var(--bright)}
.back-btn{font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.1em;color:var(--muted);background:transparent;border:1px solid var(--border);padding:8px 16px;border-radius:6px;cursor:pointer;transition:all .2s}
.back-btn:hover{color:var(--bright);border-color:var(--border2);background:rgba(255,255,255,.03)}
.panel-body{padding:30px}
.upload-zone{border:1px dashed var(--border2);border-radius:12px;padding:60px 32px;text-align:center;cursor:pointer;transition:all .3s;position:relative;overflow:hidden}
.upload-zone:hover,.upload-zone.over{border-color:var(--c);background:var(--grad);box-shadow:0 0 30px var(--glow)}
.upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}
.upload-icon{font-size:46px;color:var(--c);margin-bottom:18px;display:block;animation:floatY 3s ease infinite;text-shadow:0 0 20px var(--c)}
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
.prev-fname{font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:600;color:var(--bright);margin-bottom:4px}
.prev-size{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--muted);margin-bottom:18px}
.field-lbl{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.18em;color:var(--muted);margin-bottom:8px}
.field-ta{width:100%;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:8px;padding:13px 15px;color:var(--text);font-family:'Exo 2',sans-serif;font-size:13px;resize:vertical;min-height:78px;line-height:1.6;outline:none;transition:border-color .2s,box-shadow .2s}
.field-ta:focus{border-color:var(--c);box-shadow:0 0 15px var(--glow)}
.field-ta::placeholder{color:var(--muted)}
.btn-analyze{width:100%;padding:17px;margin-top:22px;background:transparent;border:1px solid var(--c);border-radius:10px;color:var(--c);font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;position:relative;overflow:hidden;transition:all .3s}
.btn-analyze::before{content:'';position:absolute;inset:0;background:var(--c);opacity:0;transition:opacity .3s}
.btn-analyze:hover::before{opacity:.08}
.btn-analyze:hover{box-shadow:0 0 30px var(--glow),0 0 60px var(--glow);text-shadow:0 0 10px var(--c);transform:translateY(-1px)}
.btn-analyze:disabled{opacity:.3;cursor:not-allowed;transform:none;box-shadow:none}
.btn-sm{background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:8px 16px;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.1em;cursor:pointer;transition:all .2s}
.btn-sm:hover{color:var(--bright);border-color:var(--border2)}
.loading-wrap{padding:60px;text-align:center;animation:fadeIn .3s ease}
.scanner-ring{width:76px;height:76px;border-radius:50%;border:2px solid var(--border);border-top-color:var(--c);margin:0 auto 22px;animation:spin 1s linear infinite;box-shadow:0 0 20px var(--glow);position:relative}
.scanner-ring::before{content:'';position:absolute;inset:6px;border-radius:50%;border:1.5px solid var(--border);border-top-color:var(--c);animation:spin .6s linear infinite reverse;opacity:.5}
.scan-txt{font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--c);letter-spacing:.18em;animation:blink 1.2s ease infinite}
.scan-sub{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);margin-top:8px;letter-spacing:.12em}
.res-wrap{animation:fadeUp .5s ease;border-top:1px solid var(--border);padding-top:34px;margin-top:4px}
.res-hdr{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:22px}
.res-clf{font-family:'Rajdhani',sans-serif;font-size:38px;font-weight:700;color:var(--bright);line-height:1;animation:fadeUp .4s ease .1s both}
.res-icd{font-family:'Share Tech Mono',monospace;font-size:11px;padding:4px 12px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:4px;color:var(--muted);margin-top:8px;display:inline-block}
.risk-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:8px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;letter-spacing:.12em;border:1px solid currentColor;animation:fadeIn .4s ease .2s both}
.risk-badge.pulsing{animation:pulseGlow 2s ease infinite}
.risk-dot{width:8px;height:8px;border-radius:50%;background:currentColor}
.conf-wrap{margin-bottom:22px;animation:fadeUp .4s ease .3s both}
.conf-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.conf-lbl{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.16em;color:var(--muted)}
.conf-val{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:var(--c)}
.conf-track{height:6px;background:rgba(255,255,255,.05);border-radius:3px;overflow:hidden;position:relative}
.conf-fill{height:100%;border-radius:3px;transition:width .9s cubic-bezier(.4,0,.2,1) .4s;position:relative}
.conf-fill::after{content:'';position:absolute;right:0;top:-3px;bottom:-3px;width:3px;background:white;border-radius:2px;box-shadow:0 0 8px var(--c),0 0 16px var(--c)}
.sec-lbl{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.2em;color:var(--muted);margin-bottom:12px;margin-top:26px;display:flex;align-items:center;gap:8px}
.sec-lbl::before{content:'';width:14px;height:1px;background:var(--c);flex-shrink:0}
.sec-lbl::after{content:'';flex:1;height:1px;background:var(--border)}
.finding{display:flex;gap:12px;align-items:flex-start;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px;color:var(--text);line-height:1.6;animation:slideIn .3s ease both}
.finding:last-child{border-bottom:none}
.finding-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:6px}
.prob-bar-wrap{display:flex;flex-direction:column;gap:10px;margin-top:4px}
.prob-bar-row{display:flex;align-items:center;gap:12px;animation:slideIn .3s ease both}
.prob-bar-lbl{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--text);width:88px;flex-shrink:0}
.prob-bar-track{flex:1;height:5px;background:rgba(255,255,255,.05);border-radius:3px;overflow:hidden}
.prob-bar-fill{height:100%;border-radius:3px;transition:width 1s cubic-bezier(.4,0,.2,1) .5s}
.prob-bar-pct{font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--muted);width:38px;text-align:right;flex-shrink:0}
.mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px}
.mini-card{background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:10px;padding:16px 18px;animation:fadeUp .3s ease both;transition:all .2s}
.mini-card:hover{border-color:var(--border2)}
.mini-k{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:.14em;margin-bottom:6px}
.mini-v{font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:600;color:var(--bright)}
.tag{font-family:'Share Tech Mono',monospace;font-size:11px;padding:4px 12px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:4px;color:var(--muted);display:inline-block;margin:4px 4px 0 0;transition:all .2s;cursor:default}
.tag:hover{border-color:var(--c);color:var(--c)}
.rec-box{background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:10px;padding:18px 20px;font-size:13px;color:var(--text);line-height:1.8;position:relative;overflow:hidden}
.rec-box::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--c);box-shadow:0 0 8px var(--c)}
.disc{margin-top:22px;padding:12px 16px;background:rgba(251,191,36,.04);border:1px solid rgba(251,191,36,.15);border-radius:8px;font-family:'Share Tech Mono',monospace;font-size:10px;color:rgba(251,191,36,.45);letter-spacing:.07em;line-height:1.7}
.actions{display:flex;gap:10px;margin-top:22px}
.err-box{margin-top:18px;padding:14px 18px;background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.22);border-radius:8px;color:#f87171;font-family:'Share Tech Mono',monospace;font-size:12px;line-height:1.7;animation:fadeIn .3s ease}
.footer{text-align:center;padding:36px 24px;font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:.1em;border-top:1px solid var(--border);position:relative;z-index:1}
@media(max-width:640px){
  .mod-grid{grid-template-columns:1fr}
  .hero-title{font-size:48px}
  .stats-row{flex-wrap:wrap}
  .stat{padding:16px 24px}
  .prev-wrap{flex-direction:column}
  .prev-img{width:100%;height:200px}
  .mini-grid{grid-template-columns:1fr}
  .hdr{padding:12px 16px}
  .hdr-status{display:none}
  .panel-body{padding:20px}
  .main-wrap{padding:100px 16px 40px}
}
`;

export default function ApexNeuraApp() {
  const [activeId, setActiveId] = useState(null);
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [drag,     setDrag]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [apiErr,   setApiErr]   = useState(null);
  const [time,     setTime]     = useState(new Date());
  const inputRef = useRef(null);

  const mod     = activeId ? MODS[activeId] : null;
  const riskCfg = result?.riskLevel ? (RISK_CFG[result.riskLevel] ?? RISK_CFG.LOW) : null;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadFile = useCallback(f => {
    if (!f) return;
    setFile(f); setResult(null); setApiErr(null);
    const r = new FileReader();
    r.onload = e => setPreview(e.target.result);
    r.readAsDataURL(f);
  }, []);

  const handleDrop = e => { e.preventDefault(); setDrag(false); loadFile(e.dataTransfer.files?.[0]); };
  const selectMod  = id => { setActiveId(id); setFile(null); setPreview(null); setResult(null); setApiErr(null); setSymptoms(""); };

  const analyze = async () => {
    if (!file || !mod) return;
    setLoading(true); setResult(null); setApiErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (symptoms) fd.append("symptoms", symptoms);
      const res = await fetch(`http://127.0.0.1:8000/api/${activeId}/analyze`, { method:"POST", body:fd });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setResult(await res.json());
    } catch(e) {
      setApiErr("Analysis failed: " + e.message + " — Backend running? Run: uvicorn main:app --reload --port 8000");
    } finally { setLoading(false); }
  };

  const exportReport = () => {
    const blob = new Blob([JSON.stringify({module:activeId,...result},null,2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${activeId}_report_${Date.now()}.json`;
    a.click();
  };

  const cssVars = mod ? {"--c":mod.color,"--glow":mod.glow,"--grad":mod.grad} : {};
  const findings = result?.dermoscopyFindings ?? result?.neuroimagingFindings ?? [];
  const allProbs = result?.allProbabilities;

  return (
    <>
      <style>{CSS}</style>
      <Particles />
      <div className="scanlines-overlay"/>

      {/* Header */}
      <header className="hdr">
        <div className="hdr-logo">
          <div className="hdr-dot"/>
          APEX<span style={{color:"var(--dd)"}}>NEURA</span>
          <span style={{color:"var(--muted)",fontSize:12,letterSpacing:".1em"}}>_AI</span>
        </div>
        <div className="hdr-status">
          <div className="hdr-si"><div className="hdr-sd on"/><span>SYSTEM ONLINE</span></div>
          <div className="hdr-si"><div className="hdr-sd" style={{background:"var(--az)"}}/><span>ALZMIND</span></div>
          <div className="hdr-si"><div className="hdr-sd" style={{background:"var(--dd)"}}/><span>DEEPDOWN</span></div>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"var(--muted)"}}>
            {time.toLocaleTimeString("en-US",{hour12:false})}
          </span>
        </div>
      </header>

      <div className="warn-strip">
        <span style={{color:"var(--warn)"}}>⚠</span>
        RESEARCH PROTOTYPE — NOT FOR CLINICAL USE
      </div>

      <main className="main-wrap">
        <p className="eyebrow">MULTIMODAL AI · MEDICAL IMAGING · CLINICAL DECISION SUPPORT</p>

        <h1 className="hero-title">
          <span className="dd">Apex</span><span className="az">Neura</span>
        </h1>
        <p className="hero-sub-line">AI-POWERED MEDICAL DIAGNOSTIC PLATFORM</p>
        <p className="hero-desc">
          Upload medical imaging data. Receive real-time AI diagnostic analysis powered by locally trained deep learning models.
        </p>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat"><span className="stat-n c-dd">25K+</span><div className="stat-l">ISIC IMAGES</div></div>
          <div className="stat"><span className="stat-n" style={{color:"var(--bright)"}}>79.5%</span><div className="stat-l">DEEPDOWN ACC.</div></div>
          <div className="stat"><span className="stat-n c-az">44K+</span><div className="stat-l">MRI IMAGES</div></div>
          <div className="stat"><span className="stat-n" style={{color:"var(--bright)"}}>99.8%</span><div className="stat-l">ALZMIND ACC.</div></div>
        </div>

        {/* Module cards */}
        <div className="mod-grid">
          {Object.values(MODS).map(m => (
            <div
              key={m.id}
              className={`mod-card${activeId===m.id?" sel":""}`}
              style={{"--c":m.color,"--glow":m.glow,"--grad":m.grad}}
              onClick={() => selectMod(m.id)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key==="Enter" && selectMod(m.id)}
            >
              <div className="corner tl"/><div className="corner tr"/>
              <div className="corner bl"/><div className="corner br"/>
              <span className="mod-icon">{m.icon}</span>
              <div className="mod-tag">{m.tag}</div>
              <div className="mod-name">{m.name}</div>
              <div className="mod-sub">{m.sub}</div>
              <div className="mod-desc">{m.desc}</div>
            </div>
          ))}
        </div>

        {/* Analysis panel */}
        {mod && (
          <div className="panel" style={cssVars}>
            <div className="panel-bar"/>
            <div className="panel-hdr">
              <div>
                <div className="panel-tag">{mod.tag}</div>
                <div className="panel-name">{mod.name}</div>
              </div>
              <button className="back-btn" onClick={() => selectMod(null)}>← BACK</button>
            </div>

            <div className="panel-body">
              {!preview ? (
                <div
                  className={`upload-zone${drag?" over":""}`}
                  onDragOver={e=>{e.preventDefault();setDrag(true)}}
                  onDragLeave={() => setDrag(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                >
                  <input ref={inputRef} type="file" accept={mod.accepts} onChange={e=>loadFile(e.target.files?.[0])}/>
                  <span className="upload-icon">⬆</span>
                  <div className="upload-title">Drop medical image here</div>
                  <div className="upload-hint">{mod.hint}</div>
                </div>
              ) : (
                <div className="prev-wrap">
                  <div className="prev-img-wrap prev-corners">
                    <img src={preview} alt="scan" className="prev-img"/>
                    <div className="prev-scan"/>
                  </div>
                  <div className="prev-info">
                    <div className="prev-fname">{file.name}</div>
                    <div className="prev-size">{fmtSize(file.size)}</div>
                    <div className="field-lbl">PATIENT SYMPTOMS / HISTORY (OPTIONAL)</div>
                    <textarea
                      className="field-ta"
                      placeholder={activeId==="deepdown"
                        ? "e.g. lesion present for 6 months, itching, changing border..."
                        : "e.g. memory loss, confusion, family history of AD..."}
                      value={symptoms}
                      onChange={e=>setSymptoms(e.target.value)}
                    />
                    <div style={{marginTop:12}}>
                      <button className="btn-sm" onClick={()=>{setFile(null);setPreview(null);setResult(null)}}>
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
                  <div className="scanner-ring"/>
                  <div className="scan-txt">ANALYZING MEDICAL IMAGE...</div>
                  <div className="scan-sub">{mod.tag} · LOCAL INFERENCE</div>
                </div>
              )}

              {apiErr && <div className="err-box">⚠ {apiErr}</div>}

              {result && !result.error && (
                <div className="res-wrap">
                  <div className="res-hdr">
                    <div>
                      <div className="sec-lbl" style={{marginTop:0}}>CLASSIFICATION</div>
                      <div className="res-clf">{result.classification}</div>
                      {result.icd10Code && <span className="res-icd">{result.icd10Code}</span>}
                    </div>
                    {riskCfg && (
                      <div className={`risk-badge${riskCfg.pulse?" pulsing":""}`} style={{color:riskCfg.col}}>
                        <div className="risk-dot"/>
                        {riskCfg.label}
                      </div>
                    )}
                  </div>

                  {/* Confidence */}
                  <div className="conf-wrap">
                    <div className="conf-meta">
                      <span className="conf-lbl">MODEL CONFIDENCE</span>
                      <span className="conf-val">{result.confidence}%</span>
                    </div>
                    <div className="conf-track">
                      <div className="conf-fill" style={{width:`${result.confidence}%`,background:mod.color}}/>
                    </div>
                  </div>

                  {/* Prob bars */}
                  {allProbs && (
                    <>
                      <div className="sec-lbl">CLASS PROBABILITIES</div>
                      <div className="prob-bar-wrap">
                        {Object.entries(allProbs).map(([k,v],i) => (
                          <div key={k} className="prob-bar-row" style={{animationDelay:`${i*.1}s`}}>
                            <span className="prob-bar-lbl">{k}</span>
                            <div className="prob-bar-track">
                              <div className="prob-bar-fill" style={{
                                width:`${v}%`,
                                background:k==="Malignant"?"#f87171":k==="Benign"?"#00ffaa":"#fbbf24"
                              }}/>
                            </div>
                            <span className="prob-bar-pct">{v}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Findings */}
                  {findings.length > 0 && (
                    <>
                      <div className="sec-lbl">{activeId==="deepdown"?"DERMOSCOPY FINDINGS":"NEUROIMAGING FINDINGS"}</div>
                      <div>
                        {findings.map((f,i) => (
                          <div key={i} className="finding" style={{animationDelay:`${i*.08}s`}}>
                            <div className="finding-dot" style={{background:mod.color,boxShadow:`0 0 6px ${mod.color}`}}/>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* AlzMind extras */}
                  {activeId==="alzmind" && (
                    <>
                      {(result.cdrScore!==undefined||result.atrophyIndex) && (
                        <>
                          <div className="sec-lbl">CLINICAL SCORES</div>
                          <div className="mini-grid">
                            {result.cdrScore!==undefined && (
                              <div className="mini-card">
                                <div className="mini-k">CDR SCORE</div>
                                <div className="mini-v" style={{fontSize:26,color:"var(--bright)"}}>{result.cdrScore}</div>
                              </div>
                            )}
                            {result.atrophyIndex && (
                              <div className="mini-card">
                                <div className="mini-k">ATROPHY INDEX</div>
                                <div className="mini-v">{result.atrophyIndex}</div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {result.brainRegionsAffected?.length > 0 && (
                        <>
                          <div className="sec-lbl">AFFECTED REGIONS</div>
                          <div>{result.brainRegionsAffected.map((r,i)=><span key={i} className="tag">{r}</span>)}</div>
                        </>
                      )}
                    </>
                  )}

                  <div className="sec-lbl">CLINICAL RECOMMENDATION</div>
                  <div className="rec-box">{result.recommendation}</div>
                  {result.disclaimer && <div className="disc">⚠ {result.disclaimer}</div>}

                  <div className="actions">
                    <button className="btn-sm" onClick={()=>{setResult(null);setFile(null);setPreview(null);setSymptoms("")}}>
                      NEW SCAN
                    </button>
                    <button className="btn-sm" onClick={exportReport}>EXPORT JSON ↓</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        APEXNEURA AI · PROTOTYPE v0.3 · RESEARCH &amp; DEMO ONLY
        <br/>
        <span style={{color:"var(--border2)",marginTop:6,display:"block"}}>
          DeepDown EfficientNet-B4 (79.5%) · AlzMind ViT (99.8%) · Local Inference
        </span>
      </footer>
    </>
  );
}