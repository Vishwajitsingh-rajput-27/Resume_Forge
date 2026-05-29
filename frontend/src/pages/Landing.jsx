import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const PHRASES = ["AI-Powered Resume Builder","Beat ATS Systems Instantly","Land More Interviews","4 Premium Templates"];

export default function Landing() {
  const navigate = useNavigate();
  const [typed, setTyped]     = useState("");
  const [idx,   setIdx]       = useState(0);
  const [ci,    setCi]        = useState(0);
  const [del,   setDel]       = useState(false);

  useEffect(() => {
    const phrase = PHRASES[idx];
    const timer  = setTimeout(() => {
      if (!del) {
        setTyped(phrase.slice(0, ci + 1));
        if (ci + 1 === phrase.length) setTimeout(() => setDel(true), 1800);
        else setCi(c => c + 1);
      } else {
        setTyped(phrase.slice(0, ci - 1));
        if (ci - 1 === 0) { setDel(false); setCi(0); setIdx(i => (i + 1) % PHRASES.length); }
        else setCi(c => c - 1);
      }
    }, del ? 45 : 90);
    return () => clearTimeout(timer);
  }, [typed, ci, del, idx]);

  const features = [
    { icon:"sparkle", title:"AI-Generated Content",   desc:"Claude AI writes your summary, improves bullet points, and suggests role-specific skills." },
    { icon:"shield",  title:"Real-Time ATS Scoring",  desc:"Instant ATS compatibility score with section-by-section breakdown and fix suggestions." },
    { icon:"template",title:"4 Premium Templates",    desc:"Minimal, Dark, Creative, and Cyber — all ATS-safe and print-ready." },
    { icon:"download",title:"One-Click PDF Export",   desc:"Export pixel-perfect A4 PDFs with jsPDF + html2canvas — no server required." },
    { icon:"chart",   title:"Resume Analytics",       desc:"Track your ATS score history and monitor resume performance over time." },
    { icon:"zap",     title:"Drag & Drop Sections",   desc:"Reorder every resume section with smooth drag-and-drop powered by dnd-kit." },
  ];

  const stats = [["50K+","Resumes Built"],["94%","Interview Rate"],["4.9★","User Rating"],["4","Templates"]];

  return (
    <div style={{ minHeight:"100vh" }}>
      {/* NAV */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,height:68,
                    display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",
                    background:"rgba(3,4,10,.88)",backdropFilter:"blur(20px)",
                    borderBottom:"1px solid var(--glass-border)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,var(--gold-500),var(--gold-300))",
                        display:"flex",alignItems:"center",justifyContent:"center" }}>
            <span style={{ color:"var(--navy-900)",fontFamily:"var(--font-display)",fontWeight:800 }}>R</span>
          </div>
          <span className="logo-txt"><span className="gold-text">Resume</span>Forge</span>
        </div>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
          <Button variant="gold"  size="sm" onClick={() => navigate("/register")}>Get Started Free</Button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",
                        justifyContent:"center",padding:"120px 24px 80px",textAlign:"center",
                        position:"relative",overflow:"hidden" }}>
        <div className="grid-lines"/>
        <div style={{ position:"relative",maxWidth:780,animation:"fadeInUp .8s ease" }}>
          <Badge variant="gold" style={{ marginBottom:22,padding:"6px 18px",fontSize:".8rem" }}>✦ Powered by Claude AI</Badge>
          <h1 style={{ fontFamily:"var(--font-display)",fontSize:"clamp(2.2rem,6vw,4rem)",fontWeight:800,
                       lineHeight:1.1,letterSpacing:"-.03em",marginBottom:16 }}>
            Build Resumes That<br/>
            <span className="gold-text typing-cursor">{typed||" "}</span>
          </h1>
          <p style={{ fontSize:"clamp(.95rem,2vw,1.1rem)",color:"var(--text-secondary)",
                      maxWidth:520,margin:"0 auto 36px",lineHeight:1.7 }}>
            AI-powered resume builder with real-time ATS scoring, premium templates, and pixel-perfect PDF export. Land interviews faster.
          </p>
          <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" }}>
            <Button variant="gold" size="lg" onClick={() => navigate("/register")} style={{ animation:"pulseGold 3s infinite" }}>
              Start Building Free →
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/login")}>View Demo</Button>
          </div>
          <p style={{ marginTop:18,fontSize:".76rem",color:"var(--text-muted)" }}>No credit card · Free forever plan</p>
        </div>

        {/* Stats */}
        <div style={{ display:"flex",gap:18,flexWrap:"wrap",justifyContent:"center",marginTop:64,animation:"fadeInUp .8s .3s ease both" }}>
          {stats.map(([v,l])=>(
            <div key={l} className="glass-card" style={{ padding:"16px 26px",textAlign:"center",minWidth:110 }}>
              <div style={{ fontFamily:"var(--font-display)",fontSize:"1.5rem",fontWeight:800,color:"var(--gold-400)" }}>{v}</div>
              <div style={{ fontSize:".73rem",color:"var(--text-muted)",marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"70px 24px",maxWidth:1100,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:52 }}>
          <h2 style={{ fontFamily:"var(--font-display)",fontSize:"clamp(1.7rem,4vw,2.5rem)",fontWeight:800,letterSpacing:"-.02em" }}>
            Everything to <span className="gold-text">Win the Job</span>
          </h2>
          <p style={{ color:"var(--text-secondary)",marginTop:10,fontSize:"1rem" }}>Built for modern job seekers who want an unfair advantage.</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:22 }}>
          {features.map((f,i)=>(
            <Card key={i} style={{ padding:26,animation:`fadeInUp .6s ${i*.1}s ease both` }}>
              <div style={{ width:46,height:46,borderRadius:13,background:"rgba(201,168,76,.12)",
                            border:"1px solid rgba(201,168,76,.25)",display:"flex",alignItems:"center",
                            justifyContent:"center",marginBottom:16 }}>
                <Icon name={f.icon} size={22} color="var(--gold-400)"/>
              </div>
              <h3 style={{ fontFamily:"var(--font-display)",fontSize:"1rem",fontWeight:700,marginBottom:9 }}>{f.title}</h3>
              <p style={{ fontSize:".875rem",color:"var(--text-secondary)",lineHeight:1.65 }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"56px 24px 90px",textAlign:"center" }}>
        <Card style={{ maxWidth:580,margin:"0 auto",padding:"46px 38px",background:"rgba(201,168,76,.04)",borderColor:"rgba(201,168,76,.25)" }}>
          <h2 style={{ fontFamily:"var(--font-display)",fontSize:"1.9rem",fontWeight:800,marginBottom:12 }}>
            Ready to <span className="gold-text">Get Hired?</span>
          </h2>
          <p style={{ color:"var(--text-secondary)",marginBottom:26,fontSize:".9rem" }}>Join thousands of professionals who landed their dream jobs.</p>
          <Button variant="gold" size="lg" onClick={() => navigate("/register")} style={{ animation:"pulseGold 3s infinite" }}>
            Create Your Resume Now ✦
          </Button>
        </Card>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid var(--glass-border)",padding:"22px 32px",
                       display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
        <span className="logo-txt" style={{ fontSize:"1rem" }}><span className="gold-text">Resume</span>Forge</span>
        <span style={{ fontSize:".75rem",color:"var(--text-muted)" }}>© 2025 ResumeForge · Built with Claude AI</span>
      </footer>
    </div>
  );
}
