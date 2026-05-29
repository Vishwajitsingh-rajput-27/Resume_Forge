/* ── ATS Score Engine ─────────────────────────────────────────
   Weights total 100. Each section returns raw (0-100) + weighted. */

const WEIGHTS = {
  personal:14, summary:18, experience:22, education:12,
  skills:18, projects:8, certifications:5, extras:3,
};

const ROLE_KW = {
  "software engineer":["javascript","typescript","react","node","python","aws","docker","git","sql","mongodb","rest api","ci/cd","microservices"],
  "data scientist":["python","machine learning","tensorflow","pandas","sql","statistics","deep learning","nlp","r","visualization"],
  "product manager":["roadmap","agile","kpi","user research","stakeholder","strategy","jira","analytics","prioritization","scrum"],
  "designer":["figma","ux","ui","prototyping","wireframe","design system","accessibility","sketch","adobe","user research"],
  "devops":["docker","kubernetes","terraform","aws","ci/cd","linux","jenkins","ansible","prometheus","grafana"],
};

function scorePersonal(p={}) {
  let s=0;
  if(p.name?.trim())     s+=20;
  if(p.title?.trim())    s+=20;
  if(p.email?.trim())    s+=20;
  if(p.phone?.trim())    s+=15;
  if(p.location?.trim()) s+=15;
  if(p.linkedin?.trim()) s+=5;
  if(p.website?.trim())  s+=5;
  return Math.min(100,s);
}
function scoreSummary(summary="") {
  if(!summary?.trim()) return 0;
  let s=30;
  const words=summary.trim().split(/\s+/).length;
  if(words>=40) s+=30; else if(words>=20) s+=15;
  const action=["led","built","developed","improved","increased","reduced","launched","achieved","delivered","managed"];
  const found=action.filter(w=>summary.toLowerCase().includes(w)).length;
  s+=Math.min(25,found*6);
  if(summary.length>150) s+=15;
  return Math.min(100,s);
}
function scoreExperience(exp=[]) {
  const filled=exp.filter(e=>e.role?.trim()&&e.company?.trim());
  if(!filled.length) return 0;
  let s=20;
  s+=Math.min(20,filled.length*10);
  const withDesc=filled.filter(e=>e.desc?.trim().length>60);
  s+=(withDesc.length/filled.length)*25;
  const withNums=filled.filter(e=>/\d+/.test(e.desc||""));
  s+=(withNums.length/filled.length)*20;
  const withBullets=filled.filter(e=>(e.desc||"").includes("•")||(e.desc||"").includes("-"));
  s+=(withBullets.length/filled.length)*15;
  return Math.min(100,s);
}
function scoreEducation(edu=[]) {
  const filled=edu.filter(e=>e.degree?.trim()||e.institution?.trim());
  if(!filled.length) return 0;
  let s=55;
  if(filled[0]?.degree)      s+=15;
  if(filled[0]?.institution) s+=15;
  if(filled[0]?.year)        s+=10;
  if(filled[0]?.gpa)         s+=5;
  return Math.min(100,s);
}
function scoreSkills(skills=[],title="") {
  if(!skills.length) return 0;
  let s=0;
  if(skills.length>=10) s=40; else if(skills.length>=6) s=30; else if(skills.length>=3) s=20; else s=10;
  const roleKey=Object.keys(ROLE_KW).find(r=>title?.toLowerCase().includes(r))||null;
  const kws=roleKey?ROLE_KW[roleKey]:[];
  if(kws.length){
    const hits=skills.filter(sk=>kws.some(k=>sk.toLowerCase().includes(k)||k.includes(sk.toLowerCase()))).length;
    s+=Math.min(60,(hits/Math.max(5,kws.length))*60);
  } else { s+=Math.min(60,skills.length*4); }
  return Math.min(100,s);
}
function scoreProjects(proj=[]) {
  const filled=proj.filter(p=>p.name?.trim());
  if(!filled.length) return 0;
  let s=30+Math.min(30,filled.length*15);
  const withDesc=filled.filter(p=>p.desc?.trim().length>40);
  s+=(withDesc.length/filled.length)*25;
  const withTech=filled.filter(p=>p.tech?.trim());
  s+=(withTech.length/filled.length)*15;
  return Math.min(100,s);
}
function scoreCerts(certs=[]) {
  const filled=certs.filter(c=>c.name?.trim());
  return filled.length?Math.min(100,50+filled.length*20):0;
}
function scoreExtras(ach=[],lang=[]) {
  const a=ach.filter(x=>x.text?.trim()).length;
  const l=lang.filter(x=>x.lang?.trim()).length;
  let s=0; if(a>0) s+=50; if(l>0) s+=50;
  return s;
}

export function calculateATSScore(data={}, title="") {
  const { personal={},experience=[],education=[],skills=[],
          projects=[],certifications=[],achievements=[],languages=[] } = data;
  const sections = {
    personal:       scorePersonal(personal),
    summary:        scoreSummary(personal.summary),
    experience:     scoreExperience(experience),
    education:      scoreEducation(education),
    skills:         scoreSkills(skills, title||personal.title),
    projects:       scoreProjects(projects),
    certifications: scoreCerts(certifications),
    extras:         scoreExtras(achievements,languages),
  };
  const total = Math.round(
    Object.entries(sections).reduce((sum,[k,v])=>sum+(v/100)*WEIGHTS[k],0)
  );
  const grade = total>=90?"Excellent":total>=80?"Very Good":total>=70?"Good":total>=55?"Fair":"Needs Work";
  const breakdown = Object.entries(sections).map(([key,raw])=>({
    key, label:key.charAt(0).toUpperCase()+key.slice(1),
    raw:Math.round(raw), weight:WEIGHTS[key],
  }));
  const suggestions = generateSuggestions(sections,data,title);
  return { score:total, grade, breakdown, suggestions };
}

function generateSuggestions(sections,data,title) {
  const tips=[];
  if(!data.personal?.title) tips.push({p:"high",s:"Personal",t:"Add a professional job title — ATS systems use it to match job listings."});
  if(!data.personal?.linkedin) tips.push({p:"medium",s:"Personal",t:"Add your LinkedIn URL. Recruiters expect it for verification."});
  if(sections.summary<30) tips.push({p:"high",s:"Summary",t:"Write a professional summary (50–120 words). It's one of the first things ATS scans."});
  if(sections.experience<50) tips.push({p:"high",s:"Experience",t:"Add detailed work experience with 3–5 achievement-focused bullet points per role."});
  else if(!data.experience?.some(e=>/\d/.test(e.desc||""))) tips.push({p:"medium",s:"Experience",t:"Quantify achievements (e.g. 'increased revenue by 40%'). Numbers boost ATS rankings."});
  if((data.skills||[]).length<6) tips.push({p:"high",s:"Skills",t:`Add more skills — aim for 10–15 keywords matching your target job description.`});
  if(sections.education<50) tips.push({p:"medium",s:"Education",t:"Complete the education section with your degree, institution, and graduation year."});
  if(sections.projects<20) tips.push({p:"low",s:"Projects",t:"Add 2–3 projects with tech stack and impact descriptions."});
  if(sections.certifications===0) tips.push({p:"low",s:"Certifications",t:"Industry certifications (AWS, Google, Microsoft) can differentiate your resume."});
  const order={high:0,medium:1,low:2};
  return tips.sort((a,b)=>order[a.p]-order[b.p]);
}

export const scoreColor = (s) =>
  s>=80?"var(--success)":s>=65?"var(--gold-400)":s>=50?"#f97316":"var(--danger)";
