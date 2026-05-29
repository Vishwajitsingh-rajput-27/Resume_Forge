import { useResume } from "../context/ResumeContext";
import AppShell from "../components/layout/AppShell";
import ResumePreview from "../components/resume/ResumePreview";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ToastContainer from "../components/ui/Toast";
import useToast from "../hooks/useToast";
import Icon from "../components/ui/Icon";

const TEMPLATES=[
  {id:"minimal",  name:"Minimal Pro",   desc:"Clean · Corporate · ATS-safe",     tag:"Popular"},
  {id:"dark",     name:"Dark Luxury",   desc:"Bold · Modern · High-contrast",     tag:"Premium"},
  {id:"creative", name:"Creative Wave", desc:"Vibrant · Unique · Design roles",   tag:"Creative"},
  {id:"cyber",    name:"Cyber Tech",    desc:"Futuristic · Tech · Cybersecurity", tag:"Niche"},
];

const DEMO={
  personal:{name:"Alex Johnson",title:"Senior Software Engineer",email:"alex@example.com",phone:"+1 555-123-4567",location:"San Francisco, CA",
             summary:"Results-driven engineer with 6+ years building scalable systems serving millions of users daily."},
  skills:["React","Node.js","Python","AWS","TypeScript","MongoDB","Docker"],
  education:[{id:"e1",degree:"B.S. Computer Science",institution:"Stanford University",year:"2018",gpa:"3.8"}],
  experience:[{id:"x1",role:"Senior Software Engineer",company:"Google",duration:"2021–Present",location:"CA",
               desc:"• Led infrastructure serving 500M daily users\n• Reduced latency by 38% via distributed caching"}],
  projects:[{id:"p1",name:"AI Platform",tech:"Python, FastAPI, React",desc:"Enterprise AI tool adopted by 200+ companies globally."}],
  certifications:[{id:"c1",name:"AWS Solutions Architect",issuer:"Amazon",year:"2023"}],
  achievements:[{id:"a1",text:"1st place — Google Hackathon 2022 (500+ teams)"}],
  languages:[{id:"l1",lang:"English",level:"Native"},{id:"l2",lang:"Spanish",level:"Intermediate"}],
};

export default function Templates() {
  const { resume, setTemplate } = useResume();
  const { toasts, dismiss, success } = useToast();

  const pick = (id) => {
    setTemplate(id);
    success(`Template "${TEMPLATES.find(t=>t.id===id)?.name}" applied ✓`);
  };

  return (
    <AppShell>
      <div>
        <div style={{ marginBottom:26 }}>
          <h2 style={{ fontFamily:"var(--font-display)",fontSize:"1.4rem",fontWeight:800 }}>Resume Templates</h2>
          <p style={{ color:"var(--text-secondary)",marginTop:4,fontSize:".9rem" }}>
            4 premium designs. All ATS-compatible and PDF-ready.
          </p>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:22 }}>
          {TEMPLATES.map((t,i)=>{
            const active = resume.template===t.id;
            return (
              <div key={t.id} className={`tmpl-card glass-card ${active?"selected":""}`}
                style={{ padding:0,overflow:"hidden",animation:`fadeInUp .5s ${i*.1}s ease both` }}
                onClick={()=>pick(t.id)}>

                {/* Preview thumbnail */}
                <div style={{ height:265,overflow:"hidden",position:"relative",background:"var(--navy-900)" }}>
                  <div style={{ transform:"scale(0.52)",transformOrigin:"top left",width:"192%",pointerEvents:"none" }}>
                    <ResumePreview resume={DEMO} template={t.id}/>
                  </div>
                  {active && (
                    <div style={{ position:"absolute",top:10,right:10,width:28,height:28,borderRadius:"50%",
                                  background:"var(--gold-500)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <Icon name="check" size={14} color="var(--navy-900)"/>
                    </div>
                  )}
                  <Badge variant="gold" style={{ position:"absolute",top:10,left:10,fontSize:".63rem" }}>{t.tag}</Badge>
                </div>

                {/* Info bar */}
                <div style={{ padding:"16px 18px",borderTop:"1px solid var(--glass-border)",
                              display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div>
                    <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:".93rem" }}>{t.name}</h3>
                    <p style={{ fontSize:".74rem",color:"var(--text-muted)",marginTop:2 }}>{t.desc}</p>
                  </div>
                  {active
                    ? <Badge variant="success">Active</Badge>
                    : <Button variant="outline" size="sm" onClick={()=>pick(t.id)}>Select</Button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ToastContainer toasts={toasts} dismiss={dismiss}/>
    </AppShell>
  );
}
