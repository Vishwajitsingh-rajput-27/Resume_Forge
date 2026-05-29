import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWindowSize } from "../../hooks";
import Icon from "../ui/Icon";
import Badge from "../ui/Badge";
import ToastContainer from "../ui/Toast";
import useToast from "../../hooks/useToast";

const NAV = [
  { path:"/dashboard", label:"Dashboard",      icon:"home" },
  { path:"/builder",   label:"Resume Builder", icon:"file" },
  { path:"/templates", label:"Templates",      icon:"template" },
  { path:"/analytics", label:"Analytics",      icon:"chart" },
  { path:"/settings",  label:"Settings",       icon:"settings" },
];

function Sidebar({ onNav, toasts, dismiss }) {
  const { user, logout }   = useAuth();
  const { pathname }       = useLocation();
  const navigate           = useNavigate();
  const [dark, setDark]    = useState(true);

  const go = (path) => { navigate(path); onNav?.(); };
  const handleLogout = async () => { await logout(); navigate("/"); };

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",padding:"24px 14px" }}>
      {/* Logo */}
      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:30,paddingLeft:4 }}>
        <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,var(--gold-500),var(--gold-300))",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <span style={{ color:"var(--navy-900)",fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1rem" }}>R</span>
        </div>
        <span className="logo-txt"><span className="gold-text">Resume</span>Forge</span>
      </div>

      {/* User card */}
      <div style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 13px",background:"rgba(255,255,255,.04)",border:"1px solid var(--glass-border)",borderRadius:"var(--radius-md)",marginBottom:24 }}>
        <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,var(--gold-500),var(--navy-600))",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <span style={{ fontFamily:"var(--font-display)",fontWeight:800,color:"white",fontSize:".9rem" }}>{user?.name?.[0]||"U"}</span>
        </div>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:".85rem",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.name}</div>
          <Badge variant={user?.plan==="Pro"?"gold":"info"} style={{ fontSize:".63rem",padding:"1px 7px",marginTop:2 }}>{user?.plan||"Free"}</Badge>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex:1 }}>
        <p style={{ fontSize:".65rem",fontWeight:700,color:"var(--text-muted)",letterSpacing:".1em",textTransform:"uppercase",padding:"0 8px",marginBottom:7 }}>Menu</p>
        <div style={{ display:"flex",flexDirection:"column",gap:3 }}>
          {NAV.map(n=>{
            const active = pathname===n.path||(n.path==="/builder"&&pathname.startsWith("/builder"));
            return (
              <button key={n.path} className={`nav-link ${active?"active":""}`} onClick={()=>go(n.path)}
                aria-current={active?"page":undefined}>
                <Icon name={n.icon} size={18} color={active?"var(--gold-400)":"var(--text-secondary)"}/>
                {n.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div style={{ paddingTop:16,borderTop:"1px solid var(--glass-border)",display:"flex",flexDirection:"column",gap:3 }}>
        <button className="nav-link" onClick={()=>setDark(d=>!d)}>
          <Icon name={dark?"sun":"moon"} size={17} color="var(--text-secondary)"/>
          {dark?"Light Mode":"Dark Mode"}
        </button>
        <button className="nav-link" onClick={handleLogout} style={{ color:"var(--danger)" }}>
          <Icon name="logout" size={17} color="var(--danger)"/>
          Sign Out
        </button>
      </div>

      {/* Toasts anchored to sidebar bottom-right on desktop */}
      <ToastContainer toasts={toasts} dismiss={dismiss}/>
    </div>
  );
}

function TopBar({ setSidebarOpen }) {
  const { user }     = useAuth();
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const label = NAV.find(n=>pathname.startsWith(n.path))?.label || "ResumeForge";

  return (
    <header style={{ height:"var(--topbar-height)",position:"sticky",top:0,zIndex:100,
                     background:"rgba(7,11,24,.88)",backdropFilter:"blur(20px)",
                     borderBottom:"1px solid var(--glass-border)",
                     display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px" }}>
      <div style={{ display:"flex",alignItems:"center",gap:14 }}>
        <button className="btn-ghost show-mobile" style={{ padding:8 }}
          onClick={()=>setSidebarOpen(true)} aria-label="Open menu">
          <Icon name="menu" size={22}/>
        </button>
        <h1 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.05rem" }}>{label}</h1>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <button className="btn-ghost" style={{ padding:8 }} aria-label="Notifications">
          <Icon name="bell" size={19} color="var(--text-secondary)"/>
        </button>
        <button onClick={()=>navigate("/settings")}
          style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,var(--gold-500),var(--navy-600))",
                   display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer" }}
          aria-label="Settings">
          <span style={{ fontFamily:"var(--font-display)",fontWeight:800,color:"white",fontSize:".875rem" }}>{user?.name?.[0]||"U"}</span>
        </button>
      </div>
    </header>
  );
}

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const { isMobile }    = useWindowSize();
  const { pathname }    = useLocation();
  const { toasts, dismiss } = useToast();

  useEffect(()=>{ setOpen(false); },[pathname]);

  return (
    <div style={{ display:"flex",minHeight:"100vh" }}>
      {/* Desktop sidebar */}
      <aside className="hide-mobile"
        style={{ width:"var(--sidebar-width)",minHeight:"100vh",position:"fixed",left:0,top:0,bottom:0,
                 zIndex:200,background:"rgba(7,11,24,.97)",borderRight:"1px solid var(--glass-border)",
                 backdropFilter:"blur(24px)",overflowY:"auto" }}>
        <Sidebar toasts={toasts} dismiss={dismiss}/>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div style={{ position:"fixed",inset:0,zIndex:300 }} onClick={()=>setOpen(false)}>
          <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,.65)",backdropFilter:"blur(4px)" }}/>
          <aside style={{ position:"absolute",left:0,top:0,bottom:0,width:260,
                          background:"var(--navy-900)",borderRight:"1px solid var(--glass-border)",
                          animation:"slideInLeft .28s ease",overflowY:"auto" }}
            onClick={e=>e.stopPropagation()}>
            <Sidebar onNav={()=>setOpen(false)} toasts={toasts} dismiss={dismiss}/>
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex:1,marginLeft:isMobile?0:"var(--sidebar-width)",display:"flex",flexDirection:"column",minHeight:"100vh" }}>
        <TopBar setSidebarOpen={setOpen}/>
        <main style={{ flex:1,padding:isMobile?"18px 14px":"30px 34px",maxWidth:1400,width:"100%",animation:"fadeIn .35s ease" }}>
          {children}
        </main>
        <footer style={{ padding:"12px 28px",borderTop:"1px solid var(--glass-border)",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
          <span style={{ fontSize:".72rem",color:"var(--text-muted)" }}>© 2025 ResumeForge</span>
          <span style={{ fontSize:".72rem",color:"var(--text-muted)" }}>Built with ✦ Claude AI</span>
        </footer>
      </div>

      {/* Mobile toasts */}
      {isMobile && <ToastContainer toasts={toasts} dismiss={dismiss}/>}
    </div>
  );
}
