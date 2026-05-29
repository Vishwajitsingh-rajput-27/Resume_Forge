import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useResume } from "../context/ResumeContext";
import AppShell from "../components/layout/AppShell";
import ResumePreview from "../components/resume/ResumePreview";
import Button from "../components/ui/Button";
import Input  from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Icon   from "../components/ui/Icon";
import Badge  from "../components/ui/Badge";
import ToastContainer from "../components/ui/Toast";
import useToast from "../hooks/useToast";
import { exportToPDF, printResume } from "../utils/pdfExport";

const TABS = [
  { key:"personal",       label:"Personal",       icon:"user" },
  { key:"experience",     label:"Experience",     icon:"briefcase" },
  { key:"education",      label:"Education",      icon:"book" },
  { key:"skills",         label:"Skills",         icon:"code" },
  { key:"projects",       label:"Projects",       icon:"globe" },
  { key:"certifications", label:"Certifications", icon:"award" },
  { key:"achievements",   label:"Achievements",   icon:"star" },
  { key:"languages",      label:"Languages",      icon:"globe" },
];

const LEVELS = ["Native","Fluent","Advanced","Intermediate","Basic"];

/* ── AI helper (calls Anthropic directly from browser) ────── */
async function askAI(prompt) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("Add VITE_GEMINI_API_KEY to frontend/.env — free key at aistudio.google.com");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
      }),
    }
  );
  const d = await res.json();
  if (d.error) throw new Error(d.error.message || "Gemini error");
  return d.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/* ── Entry card shell ─────────────────────────────────────── */
function EntryCard({ onRemove, children }) {
  return (
    <div style={{ position:"relative",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",
                  borderRadius:"var(--radius-md)",padding:18,paddingRight:44 }}>
      <button onClick={onRemove} title="Remove"
        style={{ position:"absolute",top:12,right:12,background:"none",border:"none",
                 color:"var(--danger)",cursor:"pointer",opacity:.7,padding:4 }}>
        <Icon name="trash" size={14} color="var(--danger)"/>
      </button>
      {children}
    </div>
  );
}

export default function Builder() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { resume, activeTab, preview, saving,
          updatePersonal, addEntry, removeEntry, updateEntry, setSkills,
          setActiveTab, setPreview, saveResume, loadResume } = useResume();
  const { toasts, dismiss, success, error: toastErr, ai, info } = useToast();

  const [aiLoad, setAiLoad] = useState({});
  const [skillIn, setSkillIn] = useState("");
  const [pdfProgress, setPdfProgress] = useState(0);
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef();

  useEffect(() => { if (id) loadResume(id).catch(()=>toastErr("Could not load resume")); }, [id]);

  /* ── AI actions ── */
  const runAI = async (key, prompt, cb) => {
    setAiLoad(l=>({...l,[key]:true}));
    try { const r = await askAI(prompt); cb(r); ai("AI content applied ✦"); }
    catch(e) { toastErr(e.message||"AI unavailable"); }
    finally { setAiLoad(l=>({...l,[key]:false})); }
  };

  const genSummary = () => runAI("summary",
    `Write a 3-sentence professional resume summary for ${resume.data.personal.name||"a candidate"}, 
     who is a ${resume.data.personal.title||"professional"} with skills: ${resume.data.skills.slice(0,8).join(", ")||"various"}. 
     Make it ATS-optimized, first-person, impactful. Return only the summary text.`,
    t => updatePersonal("summary", t)
  );

  const suggestSkills = () => runAI("skills",
    `List 10 top 2025 in-demand skills for a ${resume.data.personal.title||"Software Engineer"}. 
     Return ONLY a JSON array of strings like: ["React","Python"]. No explanation.`,
    t => {
      try {
        const raw   = t.trim();
        const match = raw.match(/\[.*\]/s);
        const list  = JSON.parse(match ? match[0] : raw);
        const merged= [...new Set([...resume.data.skills, ...list])].slice(0,20);
        setSkills(merged);
      } catch { toastErr("Could not parse AI skills"); }
    }
  );

  const improveDesc = (section, entryId, current) => {
    if (!current?.trim()) { info("Add a description first, then improve it."); return; }
    runAI(`desc_${entryId}`,
      `Improve this resume bullet point for maximum ATS impact and quantifiable results. Return only the improved text:\n"${current}"`,
      t => updateEntry(section, entryId, "desc", t)
    );
  };

  /* ── PDF export ── */
  const handleExport = async () => {
    setExporting(true);
    await exportToPDF("resume-print-area", resume.title||"resume", {
      onStart:    ()=>setPdfProgress(5),
      onProgress: p=>setPdfProgress(p),
      onSuccess:  ()=>{ success("PDF downloaded! 🎉"); setExporting(false); setPdfProgress(0); },
      onError:    e=>{ toastErr("PDF export failed: "+e); setExporting(false); setPdfProgress(0); },
    });
  };

  const handlePrint = () => { printResume("resume-print-area"); info("Print dialog opened"); };

  const handleSave = async () => {
    const ok = await saveResume();
    if (ok) success("Resume saved ✓"); else toastErr("Save failed");
  };

  /* ── Skill helpers ── */
  const addSkill = () => {
    if (!skillIn.trim()) return;
    const merged = [...new Set([...resume.data.skills, skillIn.trim()])];
    setSkills(merged); setSkillIn("");
  };

  /* ── Section form ── */
  const p   = resume.data.personal;
  const sec = resume.data;

  return (
    <AppShell>
      {/* Top toolbar */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:22 }}>
        <div style={{ display:"flex",gap:9,flexWrap:"wrap" }}>
          <Button variant="gold" size="sm" onClick={handleExport} loading={exporting}
            style={{ minWidth:130, animation: exporting ? undefined : "none" }}>
            <Icon name="download" size={15}/>
            {exporting ? `Exporting ${pdfProgress}%…` : "Export PDF"}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Icon name="printer" size={15}/> Print
          </Button>
          <Button variant="outline" size="sm" onClick={()=>setPreview(!preview)}>
            <Icon name="eye" size={15}/> {preview ? "Edit" : "Preview"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave} loading={saving}>
            {!saving && "💾"} Save
          </Button>
        </div>
        <Badge variant="gold" style={{ fontSize:".7rem" }}>
          Template: {resume.template?.charAt(0).toUpperCase()+resume.template?.slice(1)}
        </Badge>
      </div>

      {/* PDF progress bar */}
      {exporting && (
        <div style={{ height:3,background:"rgba(255,255,255,.08)",borderRadius:99,marginBottom:16,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${pdfProgress}%`,background:"linear-gradient(90deg,var(--gold-500),var(--gold-300))",
                        borderRadius:99,transition:"width .4s ease" }}/>
        </div>
      )}

      {preview ? (
        /* PREVIEW */
        <div style={{ animation:"fadeIn .35s ease" }}>
          <ResumePreview resume={resume.data} template={resume.template}/>
        </div>
      ) : (
        /* EDITOR */
        <div style={{ display:"grid",gridTemplateColumns:"1fr minmax(0,310px)",gap:22,alignItems:"start" }}>
          {/* Left: form */}
          <div style={{ minWidth:0 }}>
            {/* Tab pills */}
            <div style={{ display:"flex",gap:7,overflowX:"auto",paddingBottom:10,marginBottom:22 }}>
              {TABS.map(t=>(
                <button key={t.key} className={`tab-pill ${activeTab===t.key?"active":""}`} onClick={()=>setActiveTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="glass-card" style={{ padding:26 }}>
              {/* PERSONAL */}
              {activeTab==="personal" && (
                <div>
                  <div className="sec-hdr">
                    <div className="sec-icon"><Icon name="user" size={18} color="var(--gold-400)"/></div>
                    <div><h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem" }}>Personal Information</h3></div>
                  </div>
                  {/* Avatar */}
                  <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:22 }}>
                    <div style={{ width:66,height:66,borderRadius:"50%",background:"linear-gradient(135deg,var(--gold-500),var(--navy-600))",
                                  display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid var(--glass-border)",
                                  cursor:"pointer",flexShrink:0 }} onClick={()=>fileRef.current?.click()}>
                      {p.avatar
                        ? <img src={p.avatar} alt="avatar" style={{ width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover" }}/>
                        : <Icon name="image" size={24} color="rgba(255,255,255,.4)"/>}
                    </div>
                    <div>
                      <Button variant="outline" size="sm" onClick={()=>fileRef.current?.click()}>Upload Photo</Button>
                      <p style={{ fontSize:".72rem",color:"var(--text-muted)",marginTop:4 }}>JPG, PNG · Max 2MB</p>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
                      onChange={e=>{
                        const f=e.target.files?.[0]; if(!f) return;
                        const r=new FileReader(); r.onload=ev=>updatePersonal("avatar",ev.target.result); r.readAsDataURL(f);
                      }}/>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                    {[["name","Full Name","user",2],["title","Job Title / Role","briefcase",2],
                      ["email","Email","mail",1],["phone","Phone","phone",1],
                      ["location","Location","globe",1],["website","Portfolio URL","link",1],
                      ["linkedin","LinkedIn URL","link",1],["github","GitHub URL","code",1]
                    ].map(([k,lbl,ic,span])=>(
                      <div key={k} style={{ gridColumn:`span ${span}` }}>
                        <Input label={lbl} value={p[k]||""} onChange={v=>updatePersonal(k,v)} icon={ic}/>
                      </div>
                    ))}
                  </div>
                  <hr className="divider"/>
                  <div>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                      <label style={{ fontSize:".83rem",fontWeight:600,color:"var(--text-secondary)" }}>Professional Summary</label>
                      <Button variant="outline" size="sm" loading={aiLoad.summary} onClick={genSummary}
                        style={{ fontSize:".76rem",color:"var(--gold-400)",padding:"5px 13px" }}>
                        <Icon name="sparkle" size={13}/> AI Generate
                      </Button>
                    </div>
                    <Textarea value={p.summary||""} onChange={v=>updatePersonal("summary",v)}
                      placeholder="A results-driven professional with…" rows={4} maxLength={800}/>
                  </div>
                </div>
              )}

              {/* EXPERIENCE */}
              {activeTab==="experience" && (
                <div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                    <div className="sec-hdr" style={{ marginBottom:0 }}>
                      <div className="sec-icon"><Icon name="briefcase" size={17} color="var(--gold-400)"/></div>
                      <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem" }}>Work Experience</h3>
                    </div>
                    <Button variant="gold" size="sm" onClick={()=>addEntry("experience")} style={{ fontSize:".8rem" }}>
                      <Icon name="plus" size={13}/> Add
                    </Button>
                  </div>
                  {sec.experience.length===0 ? (
                    <div className="empty" style={{ padding:"28px 0" }}>
                      <p style={{ color:"var(--text-muted)",fontSize:".875rem" }}>No experience entries yet.</p>
                    </div>
                  ) : (
                    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                      {sec.experience.map(e=>(
                        <EntryCard key={e.id} onRemove={()=>removeEntry("experience",e.id)}>
                          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                            <Input label="Job Title" value={e.role}     onChange={v=>updateEntry("experience",e.id,"role",v)}     icon="briefcase"/>
                            <Input label="Company"   value={e.company}  onChange={v=>updateEntry("experience",e.id,"company",v)}  icon="globe"/>
                            <Input label="Duration"  value={e.duration} onChange={v=>updateEntry("experience",e.id,"duration",v)} icon="star"/>
                            <Input label="Location"  value={e.location} onChange={v=>updateEntry("experience",e.id,"location",v)} icon="globe"/>
                          </div>
                          <div style={{ marginTop:12 }}>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                              <label style={{ fontSize:".8rem",color:"var(--text-secondary)",fontWeight:500 }}>Bullet Points / Description</label>
                              <Button variant="ghost" size="sm" loading={aiLoad[`desc_${e.id}`]}
                                onClick={()=>improveDesc("experience",e.id,e.desc)}
                                style={{ fontSize:".74rem",color:"var(--gold-400)",padding:"4px 10px" }}>
                                <Icon name="sparkle" size={12}/> AI Improve
                              </Button>
                            </div>
                            <Textarea value={e.desc} onChange={v=>updateEntry("experience",e.id,"desc",v)}
                              placeholder={"• Led development of scalable APIs\n• Reduced latency by 35%"} rows={4}/>
                          </div>
                        </EntryCard>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* EDUCATION */}
              {activeTab==="education" && (
                <div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                    <div className="sec-hdr" style={{ marginBottom:0 }}>
                      <div className="sec-icon"><Icon name="book" size={17} color="var(--gold-400)"/></div>
                      <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem" }}>Education</h3>
                    </div>
                    <Button variant="gold" size="sm" onClick={()=>addEntry("education")}><Icon name="plus" size={13}/> Add</Button>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                    {sec.education.map(e=>(
                      <EntryCard key={e.id} onRemove={()=>removeEntry("education",e.id)}>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                          <div style={{ gridColumn:"span 2" }}>
                            <Input label="Degree / Certificate" value={e.degree} onChange={v=>updateEntry("education",e.id,"degree",v)} icon="book"/>
                          </div>
                          <Input label="Institution" value={e.institution} onChange={v=>updateEntry("education",e.id,"institution",v)} icon="globe"/>
                          <Input label="Year (e.g. 2020–2024)" value={e.year} onChange={v=>updateEntry("education",e.id,"year",v)} icon="star"/>
                          <Input label="GPA (optional)" value={e.gpa} onChange={v=>updateEntry("education",e.id,"gpa",v)} icon="award"/>
                          <Input label="Field of Study" value={e.desc} onChange={v=>updateEntry("education",e.id,"desc",v)} icon="code"/>
                        </div>
                      </EntryCard>
                    ))}
                  </div>
                </div>
              )}

              {/* SKILLS */}
              {activeTab==="skills" && (
                <div>
                  <div className="sec-hdr">
                    <div className="sec-icon"><Icon name="code" size={17} color="var(--gold-400)"/></div>
                    <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem" }}>Skills</h3>
                  </div>
                  <div style={{ display:"flex",gap:9,marginBottom:18 }}>
                    <input value={skillIn} onChange={e=>setSkillIn(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&addSkill()}
                      placeholder="Type a skill and press Enter…"
                      className="field-input" style={{ flex:1,padding:"11px 13px" }}/>
                    <Button variant="gold" size="sm" onClick={addSkill}>Add</Button>
                    <Button variant="outline" size="sm" loading={aiLoad.skills} onClick={suggestSkills}
                      style={{ color:"var(--gold-400)",fontSize:".78rem" }}>
                      <Icon name="sparkle" size={13}/> AI Suggest
                    </Button>
                  </div>
                  {sec.skills.length===0 ? (
                    <div className="empty" style={{ padding:"24px 0" }}>
                      <p style={{ color:"var(--text-muted)",fontSize:".875rem" }}>Add skills or let AI suggest them.</p>
                    </div>
                  ) : (
                    <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                      {sec.skills.map(s=>(
                        <span key={s} className="skill-tag">
                          {s}
                          <button className="skill-tag-remove" onClick={()=>setSkills(sec.skills.filter(x=>x!==s))}>✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROJECTS */}
              {activeTab==="projects" && (
                <div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                    <div className="sec-hdr" style={{ marginBottom:0 }}>
                      <div className="sec-icon"><Icon name="globe" size={17} color="var(--gold-400)"/></div>
                      <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem" }}>Projects</h3>
                    </div>
                    <Button variant="gold" size="sm" onClick={()=>addEntry("projects")}><Icon name="plus" size={13}/> Add</Button>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                    {sec.projects.map(e=>(
                      <EntryCard key={e.id} onRemove={()=>removeEntry("projects",e.id)}>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                          <Input label="Project Name" value={e.name} onChange={v=>updateEntry("projects",e.id,"name",v)} icon="code"/>
                          <Input label="Tech Stack"   value={e.tech} onChange={v=>updateEntry("projects",e.id,"tech",v)} icon="sparkle"/>
                          <div style={{ gridColumn:"span 2" }}>
                            <Input label="Project URL / GitHub" value={e.url} onChange={v=>updateEntry("projects",e.id,"url",v)} icon="link"/>
                          </div>
                        </div>
                        <div style={{ marginTop:12 }}>
                          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                            <label style={{ fontSize:".8rem",color:"var(--text-secondary)",fontWeight:500 }}>Description</label>
                            <Button variant="ghost" size="sm" loading={aiLoad[`desc_${e.id}`]}
                              onClick={()=>improveDesc("projects",e.id,e.desc)}
                              style={{ fontSize:".74rem",color:"var(--gold-400)",padding:"4px 10px" }}>
                              <Icon name="sparkle" size={12}/> AI Enhance
                            </Button>
                          </div>
                          <Textarea value={e.desc} onChange={v=>updateEntry("projects",e.id,"desc",v)}
                            placeholder="Describe the project, its impact, and technologies used…" rows={3}/>
                        </div>
                      </EntryCard>
                    ))}
                  </div>
                </div>
              )}

              {/* CERTIFICATIONS */}
              {activeTab==="certifications" && (
                <div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                    <div className="sec-hdr" style={{ marginBottom:0 }}>
                      <div className="sec-icon"><Icon name="award" size={17} color="var(--gold-400)"/></div>
                      <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem" }}>Certifications</h3>
                    </div>
                    <Button variant="gold" size="sm" onClick={()=>addEntry("certifications")}><Icon name="plus" size={13}/> Add</Button>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                    {sec.certifications.map(e=>(
                      <EntryCard key={e.id} onRemove={()=>removeEntry("certifications",e.id)}>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                          <div style={{ gridColumn:"span 2" }}>
                            <Input label="Certification Name" value={e.name} onChange={v=>updateEntry("certifications",e.id,"name",v)} icon="award"/>
                          </div>
                          <Input label="Issuing Organization" value={e.issuer} onChange={v=>updateEntry("certifications",e.id,"issuer",v)} icon="globe"/>
                          <Input label="Year" value={e.year} onChange={v=>updateEntry("certifications",e.id,"year",v)} icon="star"/>
                        </div>
                      </EntryCard>
                    ))}
                  </div>
                </div>
              )}

              {/* ACHIEVEMENTS */}
              {activeTab==="achievements" && (
                <div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                    <div className="sec-hdr" style={{ marginBottom:0 }}>
                      <div className="sec-icon"><Icon name="star" size={17} color="var(--gold-400)"/></div>
                      <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem" }}>Achievements</h3>
                    </div>
                    <Button variant="gold" size="sm" onClick={()=>addEntry("achievements")}><Icon name="plus" size={13}/> Add</Button>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                    {sec.achievements.map(e=>(
                      <EntryCard key={e.id} onRemove={()=>removeEntry("achievements",e.id)}>
                        <Textarea value={e.text} onChange={v=>updateEntry("achievements",e.id,"text",v)}
                          placeholder="e.g. Won 1st place at XYZ Hackathon among 500+ teams…" rows={2}/>
                      </EntryCard>
                    ))}
                  </div>
                </div>
              )}

              {/* LANGUAGES */}
              {activeTab==="languages" && (
                <div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                    <div className="sec-hdr" style={{ marginBottom:0 }}>
                      <div className="sec-icon"><Icon name="globe" size={17} color="var(--gold-400)"/></div>
                      <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem" }}>Languages</h3>
                    </div>
                    <Button variant="gold" size="sm" onClick={()=>addEntry("languages")}><Icon name="plus" size={13}/> Add</Button>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                    {sec.languages.map(e=>(
                      <EntryCard key={e.id} onRemove={()=>removeEntry("languages",e.id)}>
                        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                          <Input label="Language" value={e.lang} onChange={v=>updateEntry("languages",e.id,"lang",v)} icon="globe"/>
                          <select value={e.level} onChange={ev=>updateEntry("languages",e.id,"level",ev.target.value)}
                            className="field-input" style={{ padding:"13px 14px" }}>
                            {LEVELS.map(l=><option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                      </EntryCard>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: mini preview */}
          <div style={{ position:"sticky",top:90 }}>
            <p style={{ fontSize:".73rem",color:"var(--text-muted)",marginBottom:8,textAlign:"center" }}>Live Preview</p>
            <div style={{ transform:"scale(0.54)",transformOrigin:"top center",pointerEvents:"none",height:380,overflow:"hidden" }}>
              <ResumePreview resume={resume.data} template={resume.template} mini/>
            </div>
            <div style={{ marginTop:12,display:"flex",gap:8,justifyContent:"center" }}>
              <Button variant="gold" size="sm" onClick={handleExport} loading={exporting} style={{ fontSize:".76rem" }}>
                <Icon name="download" size={13}/> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={()=>navigate("/templates")} style={{ fontSize:".76rem" }}>
                Templates
              </Button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} dismiss={dismiss}/>
    </AppShell>
  );
}
