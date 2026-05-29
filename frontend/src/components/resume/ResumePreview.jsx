/**
 * ResumePreview.jsx
 * Renders the live resume with 4 themes.
 * The element with id="resume-print-area" is targeted by pdfExport.js
 */

const THEMES = {
  minimal:  { bg:"#ffffff",  text:"#1e293b", accent:"#c9a84c", sub:"#64748b",  border:"#e2e8f0",  headBg:"#1e293b",  headTxt:"#ffffff" },
  dark:     { bg:"#0f172a",  text:"#e2e8f0", accent:"#e0ba6a", sub:"#94a3b8",  border:"#1e293b",  headBg:"#070b18",  headTxt:"#e0ba6a" },
  creative: { bg:"#1e1b4b",  text:"#e0e7ff", accent:"#818cf8", sub:"#a5b4fc",  border:"#312e81",  headBg:"#312e81",  headTxt:"#e0e7ff" },
  cyber:    { bg:"#042f2e",  text:"#ccfbf1", accent:"#2dd4bf", sub:"#5eead4",  border:"#134e4a",  headBg:"#022c2a",  headTxt:"#2dd4bf" },
};

function SecHead({ title, accent, border }) {
  return (
    <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:"0.72em",fontWeight:800,
                 textTransform:"uppercase",letterSpacing:"0.1em",color:accent,
                 paddingBottom:4,borderBottom:`1.5px solid ${border}`,marginBottom:8,marginTop:14 }}>
      {title}
    </h3>
  );
}

export default function ResumePreview({ resume={}, template="minimal", mini=false }) {
  const c  = THEMES[template] || THEMES.minimal;
  const p  = resume?.personal || {};
  const exp   = (resume?.experience    || []).filter(e=>e.role||e.company);
  const edu   = (resume?.education     || []).filter(e=>e.degree||e.institution);
  const skills= resume?.skills          || [];
  const proj  = (resume?.projects      || []).filter(e=>e.name);
  const certs = (resume?.certifications|| []).filter(e=>e.name);
  const ach   = (resume?.achievements  || []).filter(e=>e.text);
  const lang  = (resume?.languages     || []).filter(e=>e.lang);

  const fs = mini ? "0.67rem" : "0.8rem";
  const h1s = mini ? "1.05rem" : "1.6rem";

  return (
    <div id="resume-print-area"
      style={{ background:c.bg, color:c.text, fontFamily:"'DM Sans',sans-serif",
               fontSize:fs, lineHeight:1.55, borderRadius:mini?6:12, overflow:"hidden",
               minHeight:mini?380:600, boxShadow:"0 20px 60px rgba(0,0,0,.55)",position:"relative" }}>

      {/* HEADER */}
      <div style={{ background:c.headBg, padding:mini?"14px 16px":"26px 30px", borderBottom:`2px solid ${c.accent}` }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:h1s,fontWeight:800,color:c.accent,marginBottom:3,letterSpacing:"-.02em" }}>
          {p.name || "Your Full Name"}
        </h1>
        <p style={{ fontWeight:600,fontSize:".88em",color:c.headTxt,marginBottom:7,opacity:.9 }}>
          {p.title || "Professional Title"}
        </p>
        <div style={{ display:"flex",flexWrap:"wrap",gap:"3px 14px",fontSize:".72em",color:c.sub }}>
          {p.email    && <span>✉ {p.email}</span>}
          {p.phone    && <span>☎ {p.phone}</span>}
          {p.location && <span>⊙ {p.location}</span>}
          {p.website  && <span>⊕ Portfolio</span>}
          {p.linkedin && <span>⊞ LinkedIn</span>}
          {p.github   && <span>⊟ GitHub</span>}
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding:mini?"10px 16px":"22px 30px" }}>

        {p.summary && (
          <>
            <SecHead title="Summary" accent={c.accent} border={c.border}/>
            <p style={{ color:c.sub,lineHeight:1.7,fontSize:".93em" }}>{p.summary}</p>
          </>
        )}

        {skills.length>0 && (
          <>
            <SecHead title="Skills" accent={c.accent} border={c.border}/>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
              {skills.map(s=>(
                <span key={s} style={{ padding:"2px 9px",background:`${c.accent}22`,border:`1px solid ${c.accent}44`,
                                       borderRadius:99,fontSize:".83em",color:c.accent,fontWeight:500 }}>{s}</span>
              ))}
            </div>
          </>
        )}

        {exp.length>0 && (
          <>
            <SecHead title="Experience" accent={c.accent} border={c.border}/>
            {exp.map(e=>(
              <div key={e.id} style={{ marginBottom:12 }}>
                <div style={{ display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:4 }}>
                  <strong style={{ color:c.text,fontSize:".93em" }}>{e.role}</strong>
                  <span style={{ color:c.sub,fontSize:".8em" }}>{e.duration}</span>
                </div>
                <div style={{ color:c.accent,fontSize:".83em",fontWeight:600,marginBottom:3 }}>
                  {e.company}{e.location?` · ${e.location}`:""}
                </div>
                {e.desc && <p style={{ color:c.sub,fontSize:".87em",whiteSpace:"pre-line",lineHeight:1.6 }}>{e.desc}</p>}
              </div>
            ))}
          </>
        )}

        {edu.length>0 && (
          <>
            <SecHead title="Education" accent={c.accent} border={c.border}/>
            {edu.map(e=>(
              <div key={e.id} style={{ marginBottom:10 }}>
                <div style={{ display:"flex",justifyContent:"space-between",flexWrap:"wrap" }}>
                  <strong style={{ color:c.text,fontSize:".93em" }}>{e.degree}</strong>
                  <span style={{ color:c.sub,fontSize:".8em" }}>{e.year}</span>
                </div>
                <div style={{ color:c.accent,fontSize:".83em",fontWeight:600 }}>
                  {e.institution}{e.gpa?` · GPA: ${e.gpa}`:""}
                </div>
              </div>
            ))}
          </>
        )}

        {proj.length>0 && (
          <>
            <SecHead title="Projects" accent={c.accent} border={c.border}/>
            {proj.map(e=>(
              <div key={e.id} style={{ marginBottom:11 }}>
                <div style={{ display:"flex",justifyContent:"space-between",flexWrap:"wrap" }}>
                  <strong style={{ color:c.text,fontSize:".93em" }}>{e.name}</strong>
                  {e.url && <span style={{ color:c.accent,fontSize:".78em" }}>↗ Link</span>}
                </div>
                {e.tech && <div style={{ color:c.sub,fontSize:".8em",fontStyle:"italic",marginBottom:2 }}>{e.tech}</div>}
                {e.desc && <p style={{ color:c.sub,fontSize:".86em" }}>{e.desc}</p>}
              </div>
            ))}
          </>
        )}

        {(certs.length>0||lang.length>0||ach.length>0) && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:4 }}>
            <div>
              {certs.length>0 && (
                <>
                  <SecHead title="Certifications" accent={c.accent} border={c.border}/>
                  {certs.map(e=>(
                    <div key={e.id} style={{ marginBottom:7 }}>
                      <div style={{ fontWeight:600,fontSize:".87em",color:c.text }}>{e.name}</div>
                      <div style={{ color:c.sub,fontSize:".78em" }}>{e.issuer}{e.year?` · ${e.year}`:""}</div>
                    </div>
                  ))}
                </>
              )}
              {ach.length>0 && (
                <>
                  <SecHead title="Achievements" accent={c.accent} border={c.border}/>
                  {ach.map(e=>(
                    <div key={e.id} style={{ color:c.sub,fontSize:".84em",marginBottom:4 }}>• {e.text}</div>
                  ))}
                </>
              )}
            </div>
            <div>
              {lang.length>0 && (
                <>
                  <SecHead title="Languages" accent={c.accent} border={c.border}/>
                  {lang.map(e=>(
                    <div key={e.id} style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                      <span style={{ fontSize:".87em",color:c.text }}>{e.lang}</span>
                      <span style={{ fontSize:".78em",color:c.sub }}>{e.level}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {!p.name && skills.length===0 && exp.length===0 && (
          <div style={{ textAlign:"center",padding:"40px 20px",color:c.sub,opacity:.45 }}>
            <div style={{ fontSize:"2rem",marginBottom:8 }}>📄</div>
            <p style={{ fontSize:".85em" }}>Fill in the form to see your resume here.</p>
          </div>
        )}
      </div>

      <div style={{ position:"absolute",bottom:8,right:12,fontSize:".58em",color:c.sub,opacity:.3,fontFamily:"'Syne',sans-serif",letterSpacing:".06em" }}>
        ResumeForge
      </div>
    </div>
  );
}
