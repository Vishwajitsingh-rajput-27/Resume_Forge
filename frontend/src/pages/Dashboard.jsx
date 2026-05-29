import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }   from "../context/AuthContext";
import { useResume } from "../context/ResumeContext";
import useToast      from "../hooks/useToast";
import AppShell      from "../components/layout/AppShell";
import Button        from "../components/ui/Button";
import Badge         from "../components/ui/Badge";
import Card          from "../components/ui/Card";
import Icon          from "../components/ui/Icon";
import ToastContainer from "../components/ui/Toast";

export default function Dashboard() {
  const { user }   = useAuth();
  const { all, fetchAll, deleteResume, newResume, loading } = useResume();
  const navigate   = useNavigate();
  const { toasts, dismiss, success, error: toastErr, info } = useToast();
  const [delId, setDelId] = useState(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const avgATS  = all.length ? Math.round(all.reduce((s,r)=>s+(r.atsScore||0),0)/all.length) : 0;
  const bestATS = all.length ? Math.max(...all.map(r=>r.atsScore||0)) : 0;

  const handleNew = () => { newResume(); navigate("/builder"); };
  const handleEdit= (id) => navigate(`/builder/${id}`);
  const handleDel = async (id) => {
    if (!window.confirm("Delete this resume permanently?")) return;
    setDelId(id);
    try { await deleteResume(id); success("Resume deleted"); }
    catch { toastErr("Delete failed"); }
    finally { setDelId(null); }
  };

  const stats = [
    { label:"Resumes",    value:all.length,    icon:"file",    color:"var(--gold-400)",  trend:"Total created" },
    { label:"Avg ATS",    value:`${avgATS}%`,  icon:"shield",  color:"var(--success)",   trend:"Across all" },
    { label:"Best Score", value:`${bestATS}%`, icon:"star",    color:"var(--info)",      trend:"Your top resume" },
    { label:"Plan",       value:user?.plan||"Free", icon:"zap",color:"#c084fc",          trend:"Current plan" },
  ];

  const actions = [
    { emoji:"✦", label:"AI Summary",  sub:"Claude AI writes it",   fn: handleNew },
    { emoji:"🛡", label:"ATS Checker", sub:"Analyze your score",     fn: ()=>navigate("/analytics") },
    { emoji:"◈", label:"Templates",   sub:"Browse 4 designs",       fn: ()=>navigate("/templates") },
    { emoji:"⬇", label:"Export PDF",  sub:"Download instantly",     fn: handleNew },
  ];

  return (
    <AppShell>
      <div style={{ display:"flex",flexDirection:"column",gap:28 }}>

        {/* Welcome banner */}
        <div className="glass-card" style={{ padding:"26px 30px",background:"linear-gradient(135deg,rgba(201,168,76,.08),rgba(16,26,58,.7))",
                                              borderColor:"rgba(201,168,76,.28)",display:"flex",justifyContent:"space-between",
                                              alignItems:"center",flexWrap:"wrap",gap:18 }}>
          <div>
            <p style={{ color:"var(--gold-400)",fontSize:".82rem",fontWeight:600,marginBottom:4 }}>Welcome back 👋</p>
            <h2 style={{ fontFamily:"var(--font-display)",fontSize:"1.5rem",fontWeight:800 }}>
              {user?.name?.split(" ")[0]}'s Workspace
            </h2>
            <p style={{ color:"var(--text-secondary)",fontSize:".875rem",marginTop:6 }}>
              {all.length===0 ? "Create your first resume and start landing interviews." :
               <>{all.length} resume{all.length>1?"s":""} · Best score: <strong style={{color:"var(--success)"}}>{bestATS}%</strong></>}
            </p>
          </div>
          <Button variant="gold" size="md" onClick={handleNew}>
            <Icon name="plus" size={15}/> New Resume
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16 }}>
          {stats.map((s,i)=>(
            <div key={i} className="stat-card" style={{ animation:`fadeInUp .5s ${i*.08}s ease both` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
                <div style={{ width:38,height:38,borderRadius:11,background:`${s.color}18`,
                              border:`1px solid ${s.color}30`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Icon name={s.icon} size={17} color={s.color}/>
                </div>
                <span style={{ fontSize:".7rem",color:"var(--text-muted)",textAlign:"right" }}>{s.trend}</span>
              </div>
              <div style={{ fontFamily:"var(--font-display)",fontSize:"1.9rem",fontWeight:800,color:s.color }}>{s.value}</div>
              <div style={{ fontSize:".78rem",color:"var(--text-secondary)",marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Resume list */}
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.05rem" }}>Your Resumes</h3>
            <Button variant="ghost" size="sm" onClick={()=>navigate("/builder")}>View all →</Button>
          </div>
          {loading ? (
            <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
              {[1,2].map(i=><div key={i} style={{ height:74,background:"rgba(255,255,255,.04)",borderRadius:14,animation:"shimmer 1.5s infinite" }}/>)}
            </div>
          ) : all.length===0 ? (
            <div className="empty">
              <Icon name="file" size={40} color="var(--text-muted)"/>
              <p style={{ fontFamily:"var(--font-display)",fontWeight:700 }}>No resumes yet</p>
              <p style={{ color:"var(--text-secondary)",fontSize:".875rem" }}>Create your first AI-powered resume.</p>
              <Button variant="gold" size="md" onClick={handleNew}>Create First Resume</Button>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {all.slice(0,5).map((r,i)=>{
                const sc = r.atsScore||0;
                const sc_col = sc>=80?"var(--success)":sc>=60?"var(--gold-400)":"var(--danger)";
                return (
                  <div key={r._id} className="glass-card" style={{ padding:"15px 20px",display:"flex",alignItems:"center",
                                                                    gap:16,flexWrap:"wrap",animation:`fadeInUp .4s ${i*.07}s ease both` }}>
                    <div style={{ width:42,height:42,borderRadius:11,background:"linear-gradient(135deg,var(--gold-500),var(--navy-600))",
                                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <Icon name="file" size={19}/>
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontWeight:600,fontSize:".93rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.title}</div>
                      <div style={{ fontSize:".74rem",color:"var(--text-muted)",marginTop:2 }}>
                        {r.template} · {new Date(r.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.05rem",color:sc_col }}>{sc}%</div>
                        <div style={{ fontSize:".63rem",color:"var(--text-muted)" }}>ATS</div>
                      </div>
                      <Badge variant={sc>=70?"success":"gold"}>{sc>=70?"Ready":"Draft"}</Badge>
                      <div style={{ display:"flex",gap:5 }}>
                        <Button variant="ghost" size="sm" onClick={()=>handleEdit(r._id)} style={{ padding:7 }}>
                          <Icon name="edit" size={14}/>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={()=>handleDel(r._id)} loading={delId===r._id}
                          style={{ padding:7,color:"var(--danger)" }}>
                          {delId!==r._id && <Icon name="trash" size={14} color="var(--danger)"/>}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.05rem",marginBottom:14 }}>Quick Actions</h3>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12 }}>
            {actions.map((a,i)=>(
              <button key={i} className="glass-card" onClick={a.fn}
                style={{ padding:"18px 16px",textAlign:"left",border:"1px solid var(--glass-border)",
                         background:"var(--glass-bg)",width:"100%",animation:`fadeInUp .4s ${i*.07}s ease both` }}>
                <div style={{ fontSize:"1.4rem",marginBottom:10 }}>{a.emoji}</div>
                <div style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:".875rem" }}>{a.label}</div>
                <div style={{ fontSize:".72rem",color:"var(--text-muted)",marginTop:2 }}>{a.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ATS bar chart */}
        {all.length>0 && (
          <div className="glass-card" style={{ padding:26 }}>
            <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1rem",marginBottom:20 }}>ATS Score Overview</h3>
            <div style={{ display:"flex",alignItems:"flex-end",gap:12,height:100 }}>
              {all.slice(0,7).map((r,i)=>{
                const sc=r.atsScore||0;
                const col=sc>=80?"var(--success)":sc>=60?"var(--gold-400)":"var(--danger)";
                return (
                  <div key={r._id} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
                    <span style={{ fontSize:".63rem",fontFamily:"var(--font-display)",fontWeight:700,color:col }}>{sc}%</span>
                    <div style={{ width:"100%",height:`${sc}px`,background:`${col}33`,borderRadius:"4px 4px 0 0",
                                  border:`1px solid ${col}55`,transition:"height 1s ease" }}/>
                    <span style={{ fontSize:".6rem",color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",
                                   maxWidth:"100%",whiteSpace:"nowrap" }}>
                      {r.title?.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} dismiss={dismiss}/>
    </AppShell>
  );
}
