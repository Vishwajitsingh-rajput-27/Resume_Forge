import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/layout/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toggle from "../components/ui/Toggle";
import Badge from "../components/ui/Badge";
import ToastContainer from "../components/ui/Toast";
import useToast from "../hooks/useToast";
import { userAPI } from "../utils/api";

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { toasts, dismiss, success, error: toastErr } = useToast();
  const [name,   setName]   = useState(user?.name||"");
  const [email,  setEmail]  = useState(user?.email||"");
  const [saving, setSave]   = useState(false);
  const [prefs,  setPrefs]  = useState({ emails:true, ats:false, pub:true });

  const save = async () => {
    setSave(true);
    try { const d=await userAPI.updateProfile({name,email}); updateUser(d.user); success("Profile updated!"); }
    catch(e) { toastErr(e.message||"Update failed"); }
    finally { setSave(false); }
  };

  const PLAN_FEATURES=["Unlimited Resumes","All 4 Templates","Advanced AI","PDF Export","ATS Analytics","Priority Support"];

  return (
    <AppShell>
      <div style={{ maxWidth:660,display:"flex",flexDirection:"column",gap:24 }}>

        {/* Profile */}
        <Card style={{ padding:26 }}>
          <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.05rem",marginBottom:20 }}>Profile</h3>
          <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:22 }}>
            <div style={{ width:62,height:62,borderRadius:"50%",background:"linear-gradient(135deg,var(--gold-500),var(--navy-600))",
                          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <span style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.5rem",color:"white" }}>{user?.name?.[0]}</span>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={()=>success("Connect Cloudinary for production photo uploads.")}>Change Photo</Button>
              <p style={{ fontSize:".71rem",color:"var(--text-muted)",marginTop:4 }}>JPG, PNG · Max 2MB</p>
            </div>
            <Badge variant={user?.plan==="Pro"?"gold":"info"} style={{ marginLeft:"auto" }}>{user?.plan||"Free"}</Badge>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
            <Input label="Display Name"    value={name}   onChange={setName}  icon="user"/>
            <Input label="Email Address"   type="email" value={email} onChange={setEmail} icon="mail"/>
            <Input label="Current Password" type="password" value="" onChange={()=>{}} icon="lock"/>
            <Input label="New Password"     type="password" value="" onChange={()=>{}} icon="lock"/>
          </div>
          <Button variant="gold" size="md" loading={saving} onClick={save} style={{ marginTop:18 }}>Save Changes</Button>
        </Card>

        {/* Preferences */}
        <Card style={{ padding:26 }}>
          <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.05rem",marginBottom:4 }}>Preferences</h3>
          <Toggle on={prefs.emails} onChange={v=>setPrefs(p=>({...p,emails:v}))} label="Email Notifications"  description="Resume updates and account news"/>
          <Toggle on={prefs.ats}    onChange={v=>setPrefs(p=>({...p,ats:v}))}    label="ATS Score Reminders"   description="Weekly nudge to improve your score"/>
          <Toggle on={prefs.pub}    onChange={v=>setPrefs(p=>({...p,pub:v}))}    label="Public Profile"         description="Let employers find you via shared links"/>
        </Card>

        {/* Upgrade */}
        <Card style={{ padding:26,background:"rgba(201,168,76,.04)",borderColor:"rgba(201,168,76,.25)" }}>
          <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.05rem",marginBottom:6 }}>Upgrade to Pro ✦</h3>
          <p style={{ color:"var(--text-secondary)",fontSize:".875rem",marginBottom:18 }}>
            Unlock unlimited resumes, all templates, advanced AI, and priority support.
          </p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20 }}>
            {PLAN_FEATURES.map(f=>(
              <div key={f} style={{ display:"flex",alignItems:"center",gap:7,fontSize:".82rem" }}>
                <span style={{ color:"var(--success)",fontWeight:700 }}>✓</span>{f}
              </div>
            ))}
          </div>
          <Button variant="gold" size="md" onClick={()=>success("Redirecting to billing…")}>Upgrade — $9/month →</Button>
        </Card>

        {/* Danger */}
        <Card style={{ padding:22,borderColor:"rgba(248,113,113,.2)" }}>
          <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:".95rem",color:"var(--danger)",marginBottom:8 }}>Danger Zone</h3>
          <p style={{ fontSize:".82rem",color:"var(--text-muted)",marginBottom:13 }}>Permanently delete account and all resume data.</p>
          <div style={{ display:"flex",gap:10 }}>
            <Button variant="outline" size="sm" style={{ borderColor:"rgba(248,113,113,.4)",color:"var(--danger)" }}
              onClick={()=>toastErr("Contact support@resumeforge.com to delete your account.")}>
              Delete Account
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </Card>
      </div>
      <ToastContainer toasts={toasts} dismiss={dismiss}/>
    </AppShell>
  );
}
