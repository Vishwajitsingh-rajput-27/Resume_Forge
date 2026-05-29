import { useEffect, useState } from "react";
import { useResume } from "../context/ResumeContext";
import AppShell from "../components/layout/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ScoreRing from "../components/ui/ScoreRing";
import ProgressBar from "../components/ui/ProgressBar";
import Icon from "../components/ui/Icon";
import ToastContainer from "../components/ui/Toast";
import useToast from "../hooks/useToast";
import { calculateATSScore } from "../utils/atsCalculator";

async function askAI(prompt) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("Add VITE_GEMINI_API_KEY to .env");
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
      }),
    }
  });
  return (await res.json()).content?.[0]?.text||"";
}

export default function Analytics() {
  const { resume, setATSScore } = useResume();
  const { toasts, dismiss, success, ai: aiToast, error: toastErr } = useToast();
  const [analysis, setAnalysis] = useState(null);
  const [tips, setTips]     = useState([]);
  const [tipsLoad, setTipsLoad] = useState(false);

  useEffect(() => {
    const r = calculateATSScore(resume.data, resume.data?.personal?.title);
    setAnalysis(r);
    setATSScore(r.score);
  }, [resume.data]);

  const fetchTips = async () => {
    setTipsLoad(true);
    try {
      const text = await askAI(
        `Give 5 specific ATS resume improvement tips for a ${resume.data?.personal?.title||"job seeker"} 
         with skills: ${resume.data?.skills?.slice(0,8).join(", ")||"none"}.
         Return as a JSON array: [{"tip":"…","priority":"high|medium|low","section":"…"}]. JSON only.`
      );
      const match = text.trim().match(/\[.*\]/s);
      const parsed = JSON.parse(match?match[0]:text);
      setTips(parsed);
      aiToast("AI tips generated ✦");
    } catch(e) { toastErr("AI tips failed: "+e.message); }
    finally { setTipsLoad(false); }
  };

  const score = analysis?.score ?? 0;
  const history = [42,55,61,70,74,78,score];

  return (
    <AppShell>
      <div style={{ display:"flex",flexDirection:"column",gap:26 }}>
        <div>
          <h2 style={{ fontFamily:"var(--font-display)",fontSize:"1.4rem",fontWeight:800 }}>Resume Analytics</h2>
          <p style={{ color:"var(--text-secondary)",marginTop:4,fontSize:".9rem" }}>
            Real-time ATS compatibility score and AI improvement tips.
          </p>
        </div>

        {/* Score + breakdown */}
        <div style={{ display:"grid",gridTemplateColumns:"auto 1fr",gap:22,alignItems:"start" }}>
          <Card style={{ padding:"30px 26px",display:"flex",flexDirection:"column",alignItems:"center",gap:18,minWidth:210 }}>
            <p style={{ fontSize:".82rem",color:"var(--text-secondary)",fontWeight:600 }}>ATS Compatibility</p>
            <ScoreRing score={score} size={138}/>
            <Badge variant={score>=80?"success":score>=60?"gold":"danger"} style={{ fontSize:".78rem",padding:"3px 12px" }}>
              {analysis?.grade||"Calculating…"}
            </Badge>
            <Button variant="gold" size="sm" fullWidth onClick={()=>{
              const r=calculateATSScore(resume.data); setAnalysis(r); setATSScore(r.score); success("Score refreshed!");
            }}>Re-Analyze</Button>
          </Card>

          <Card style={{ padding:24 }}>
            <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,marginBottom:18,fontSize:"1rem" }}>Section Breakdown</h3>
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              {analysis?.breakdown?.map(b=>(
                <ProgressBar key={b.key} label={b.label} value={b.raw} max={100} showPct/>
              ))}
            </div>
          </Card>
        </div>

        {/* Suggestions */}
        {analysis?.suggestions?.length>0 && (
          <Card style={{ padding:24 }}>
            <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,marginBottom:16 }}>
              🎯 Quick Fixes ({analysis.suggestions.length})
            </h3>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {analysis.suggestions.map((s,i)=>(
                <div key={i} style={{ display:"flex",gap:12,padding:"11px 15px",background:"rgba(255,255,255,.03)",
                                      borderRadius:12,border:"1px solid rgba(255,255,255,.07)",
                                      animation:`fadeInUp .4s ${i*.06}s ease both` }}>
                  <Badge variant={s.p==="high"?"danger":s.p==="medium"?"gold":"info"} style={{ flexShrink:0,alignSelf:"flex-start",marginTop:1 }}>
                    {s.p}
                  </Badge>
                  <div>
                    <p style={{ fontSize:".78rem",color:"var(--text-muted)",fontWeight:600,marginBottom:2 }}>{s.s}</p>
                    <p style={{ fontSize:".875rem",color:"var(--text-secondary)",lineHeight:1.6 }}>{s.t}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* AI tips */}
        <Card style={{ padding:26 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:18 }}>
            <div>
              <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.05rem" }}>✦ AI Improvement Tips</h3>
              <p style={{ fontSize:".76rem",color:"var(--text-muted)",marginTop:2 }}>Claude AI gives you targeted, role-specific advice</p>
            </div>
            <Button variant="outline" size="sm" loading={tipsLoad} onClick={fetchTips} style={{ color:"var(--gold-400)" }}>
              <Icon name="sparkle" size={14}/> Generate Tips
            </Button>
          </div>
          {tips.length>0 ? (
            <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
              {tips.map((tip,i)=>(
                <div key={i} style={{ display:"flex",gap:13,padding:"13px 16px",background:"rgba(201,168,76,.05)",
                                      borderRadius:12,border:"1px solid rgba(201,168,76,.12)",
                                      animation:`fadeInUp .4s ${i*.07}s ease both` }}>
                  <div style={{ width:24,height:24,borderRadius:"50%",background:"rgba(201,168,76,.15)",
                                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                                color:"var(--gold-400)",fontFamily:"var(--font-display)",fontWeight:800,fontSize:".72rem" }}>
                    {i+1}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:".875rem",color:"var(--text-secondary)",lineHeight:1.65 }}>{tip.tip||tip}</p>
                    {tip.priority && (
                      <Badge variant={tip.priority==="high"?"danger":"gold"} style={{ marginTop:5,fontSize:".63rem" }}>
                        {tip.priority} · {tip.section}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ padding:"28px 0" }}>
              <Icon name="sparkle" size={36} color="var(--text-muted)"/>
              <p style={{ color:"var(--text-muted)",fontSize:".875rem" }}>Click "Generate Tips" for AI-powered advice</p>
            </div>
          )}
        </Card>

        {/* History chart */}
        <Card style={{ padding:26 }}>
          <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,marginBottom:20,fontSize:"1rem" }}>Score History</h3>
          <div style={{ display:"flex",alignItems:"flex-end",gap:10,height:110 }}>
            {history.map((v,i)=>{
              const col=v>=80?"var(--success)":v>=60?"var(--gold-400)":"var(--danger)";
              return (
                <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
                  <span style={{ fontSize:".62rem",fontFamily:"var(--font-display)",fontWeight:700,color:col }}>{v}%</span>
                  <div style={{ width:"100%",height:`${v}px`,background:i===6?col:`${col}44`,
                                borderRadius:"4px 4px 0 0",transition:"height 1s ease",
                                boxShadow:i===6?`0 0 12px ${col}55`:undefined }}/>
                  <span style={{ fontSize:".6rem",color:"var(--text-muted)" }}>
                    {["W1","W2","W3","W4","W5","W6","Now"][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <ToastContainer toasts={toasts} dismiss={dismiss}/>
    </AppShell>
  );
}
