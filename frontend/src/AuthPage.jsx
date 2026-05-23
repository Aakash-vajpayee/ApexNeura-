import { useState } from "react";

const API = "http://localhost:8000";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-wrap {
    min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
    background: #050a12; font-family: 'DM Sans', sans-serif; overflow: hidden;
  }

  /* LEFT PANEL */
  .auth-left {
    position: relative; padding: 60px; display: flex;
    flex-direction: column; justify-content: space-between;
    background: #060d1a; overflow: hidden;
  }
  .auth-left::before {
    content: ''; position: absolute; top: -120px; left: -80px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, #00d48c18 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-left::after {
    content: ''; position: absolute; bottom: -100px; right: -60px;
    width: 350px; height: 350px; border-radius: 50%;
    background: radial-gradient(circle, #8b5cf618 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-logo {
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
    color: #c8dff5; letter-spacing: .12em; position: relative; z-index: 1;
  }
  .auth-logo span { color: #304a66; }

  .auth-hero { position: relative; z-index: 1; }
  .auth-hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; letter-spacing: .18em; color: #00d48c;
    font-family: 'Syne', sans-serif; margin-bottom: 24px;
    background: #00d48c12; padding: 6px 14px; border-radius: 20px;
    border: 1px solid #00d48c25;
  }
  .auth-hero-dot { width: 6px; height: 6px; border-radius: 50%; background: #00d48c; animation: pulse 2s ease infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  .auth-hero h1 {
    font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800;
    color: #c8dff5; line-height: 1.05; margin-bottom: 20px;
  }
  .auth-hero h1 em { font-style: normal; color: #00d48c; }
  .auth-hero p { font-size: 15px; color: #3a5878; line-height: 1.75; max-width: 340px; }

  .auth-modules { display: flex; gap: 12px; position: relative; z-index: 1; }
  .auth-mod {
    flex: 1; padding: 16px 18px; border-radius: 10px;
    border: 1px solid #0f2844; background: #06142a;
  }
  .auth-mod-dot { width: 8px; height: 8px; border-radius: 50%; margin-bottom: 10px; }
  .auth-mod-name { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #c8dff5; margin-bottom: 2px; }
  .auth-mod-sub { font-size: 11px; color: #304a66; }

  /* RIGHT PANEL */
  .auth-right {
    display: flex; align-items: center; justify-content: center;
    padding: 60px 48px; background: #050a12; position: relative;
  }
  .auth-right::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 70% 30%, #8b5cf608 0%, transparent 60%);
    pointer-events: none;
  }

  .auth-form-wrap { width: 100%; max-width: 400px; position: relative; z-index: 1; }
  .auth-form-title {
    font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800;
    color: #c8dff5; margin-bottom: 6px;
  }
  .auth-form-sub { font-size: 14px; color: #3a5878; margin-bottom: 36px; }

  /* TABS */
  .auth-tabs {
    display: flex; gap: 0; margin-bottom: 32px;
    border-bottom: 1px solid #0f2844;
  }
  .auth-tab {
    flex: 1; padding: 12px; font-family: 'Syne', sans-serif; font-size: 13px;
    font-weight: 600; letter-spacing: .08em; cursor: pointer; background: none;
    border: none; color: #304a66; border-bottom: 2px solid transparent;
    margin-bottom: -1px; transition: all .2s;
  }
  .auth-tab.active { color: #c8dff5; border-bottom-color: #00d48c; }

  /* FIELDS */
  .auth-field { margin-bottom: 18px; }
  .auth-field label {
    display: block; font-size: 11px; letter-spacing: .14em;
    color: #304a66; font-family: 'Syne', sans-serif; margin-bottom: 8px;
  }
  .auth-field input {
    width: 100%; background: #06142a; border: 1px solid #0f2844;
    border-radius: 8px; padding: 13px 16px; color: #c8dff5;
    font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
    transition: border-color .2s;
  }
  .auth-field input:focus { border-color: #00d48c40; }
  .auth-field input::placeholder { color: #1a3a5a; }

  /* BUTTON */
  .auth-btn {
    width: 100%; padding: 15px; margin-top: 8px;
    background: #00d48c; color: #020c18; border: none; border-radius: 8px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
    letter-spacing: .1em; cursor: pointer; transition: all .2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .auth-btn:hover { background: #00e89a; transform: translateY(-1px); }
  .auth-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  /* ERROR / SUCCESS */
  .auth-err {
    margin-top: 14px; padding: 12px 16px; background: #ef444412;
    border: 1px solid #ef444430; border-radius: 8px;
    color: #ef4444; font-size: 13px;
  }
  .auth-ok {
    margin-top: 14px; padding: 12px 16px; background: #00d48c12;
    border: 1px solid #00d48c30; border-radius: 8px;
    color: #00d48c; font-size: 13px;
  }

  .auth-spin {
    width: 16px; height: 16px; border: 2px solid #02201466;
    border-top-color: #020c18; border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .auth-divider {
    text-align: center; margin: 20px 0;
    color: #1a3a5a; font-size: 12px; letter-spacing: .1em;
    position: relative;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; position: absolute; top: 50%;
    width: 35%; height: 1px; background: #0f2844;
  }
  .auth-divider::before { left: 0; }
  .auth-divider::after { right: 0; }

  @media (max-width: 768px) {
    .auth-wrap { grid-template-columns: 1fr; }
    .auth-left { display: none; }
    .auth-right { padding: 40px 24px; }
  }

  /* FADE IN */
  .auth-form-wrap { animation: fadeUp .4s ease; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
`;

export default function AuthPage({ onLogin }) {
  const [tab,      setTab]      = useState("login");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const switchTab = (t) => {
    setTab(t); setError(""); setSuccess("");
    setName(""); setEmail(""); setPassword("");
  };

  const handleSubmit = async () => {
    if (!email || !password) { setError("Email aur password zaroori hai"); return; }
    if (tab === "register" && !name) { setError("Naam zaroori hai"); return; }

    setLoading(true); setError(""); setSuccess("");

    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const body     = tab === "login"
        ? { email, password }
        : { name, email, password };

      const res  = await fetch(`${API}${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Kuch galat hua");

      // Save token
      localStorage.setItem("apexneura_token", data.access_token);
      localStorage.setItem("apexneura_user",  JSON.stringify(data.user));

      setSuccess(tab === "login" ? "Login successful!" : "Account ban gaya!");
      setTimeout(() => onLogin(data.user, data.access_token), 800);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <>
      <style>{CSS}</style>
      <div className="auth-wrap">

        {/* Left Panel */}
        <div className="auth-left">
          <div className="auth-logo">APEXNEURA<span>_AI</span></div>

          <div className="auth-hero">
            <div className="auth-hero-tag">
              <div className="auth-hero-dot" />
              AI MEDICAL PLATFORM
            </div>
            <h1>Diagnose.<br /><em>Detect.</em><br />Decide.</h1>
            <p>
              Multimodal AI platform for Alzheimer's detection
              and skin lesion analysis — powered by locally trained models.
            </p>
          </div>

          <div className="auth-modules">
            <div className="auth-mod">
              <div className="auth-mod-dot" style={{ background: "#00d48c" }} />
              <div className="auth-mod-name">DeepDown</div>
              <div className="auth-mod-sub">Skin · EfficientNet-B4</div>
            </div>
            <div className="auth-mod">
              <div className="auth-mod-dot" style={{ background: "#8b5cf6" }} />
              <div className="auth-mod-name">AlzMind</div>
              <div className="auth-mod-sub">MRI · ViT Model</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-form-title">
              {tab === "login" ? "Welcome back" : "Create account"}
            </div>
            <div className="auth-form-sub">
              {tab === "login"
                ? "ApexNeura mein login karein"
                : "Apna free account banayein"}
            </div>

            {/* Tabs */}
            <div className="auth-tabs">
              <button className={`auth-tab${tab === "login"    ? " active" : ""}`} onClick={() => switchTab("login")}>LOGIN</button>
              <button className={`auth-tab${tab === "register" ? " active" : ""}`} onClick={() => switchTab("register")}>REGISTER</button>
            </div>

            {/* Name (register only) */}
            {tab === "register" && (
              <div className="auth-field">
                <label>FULL NAME</label>
                <input
                  type="text" placeholder="Aakash Vajpayee"
                  value={name} onChange={e => setName(e.target.value)}
                  onKeyDown={handleKey}
                />
              </div>
            )}

            {/* Email */}
            <div className="auth-field">
              <label>EMAIL ADDRESS</label>
              <input
                type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label>PASSWORD</label>
              <input
                type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            {/* Submit */}
            <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><div className="auth-spin" /> Processing...</>
                : tab === "login" ? "LOGIN →" : "CREATE ACCOUNT →"
              }
            </button>

            {error   && <div className="auth-err">⚠ {error}</div>}
            {success && <div className="auth-ok">✓ {success}</div>}

            <div className="auth-divider">OR</div>

            <div style={{ textAlign: "center", fontSize: 13, color: "#304a66" }}>
              {tab === "login" ? "Account nahi hai? " : "Pehle se account hai? "}
              <span
                style={{ color: "#00d48c", cursor: "pointer" }}
                onClick={() => switchTab(tab === "login" ? "register" : "login")}
              >
                {tab === "login" ? "Register karein" : "Login karein"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}