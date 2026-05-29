import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../utils/api";
import useToast from "../hooks/useToast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ToastContainer from "../components/ui/Toast";

export default function ForgotPassword() {
  const { toasts, dismiss, success, error: toastErr } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);
  const [load, setLoad]   = useState(false);

  const submit = async () => {
    if (!email.trim()) { toastErr("Enter your email address"); return; }
    setLoad(true);
    try { await authAPI.forgotPassword(email); setSent(true); success("Reset link sent! Check your inbox."); }
    catch { toastErr("Failed to send reset email"); }
    finally { setLoad(false); }
  };

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
      <div style={{ width:"100%",maxWidth:400,animation:"fadeInUp .6s ease" }}>
        <div style={{ textAlign:"center",marginBottom:30 }}>
          <div style={{ width:50,height:50,borderRadius:14,background:"linear-gradient(135deg,var(--gold-500),var(--gold-300))",
                        display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px" }}>
            <span style={{ color:"var(--navy-900)",fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.3rem" }}>R</span>
          </div>
          <h1 style={{ fontFamily:"var(--font-display)",fontSize:"1.7rem",fontWeight:800 }}>Reset Password</h1>
          <p style={{ color:"var(--text-secondary)",marginTop:6,fontSize:".875rem" }}>We'll email you a reset link</p>
        </div>
        <div className="glass-card" style={{ padding:"30px 26px" }}>
          {sent ? (
            <div style={{ textAlign:"center",padding:"14px 0" }}>
              <div style={{ fontSize:"2.5rem",marginBottom:14 }}>📧</div>
              <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,marginBottom:8 }}>Check Your Email</h3>
              <p style={{ color:"var(--text-secondary)",fontSize:".875rem",marginBottom:22 }}>
                We sent a link to <strong style={{ color:"var(--gold-400)" }}>{email}</strong>
              </p>
              <Link to="/login"><Button variant="outline" size="md">← Back to Sign In</Button></Link>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
              <Input label="Email address" type="email" value={email} onChange={setEmail} icon="mail"/>
              <Button variant="gold" size="md" fullWidth loading={load} onClick={submit}>Send Reset Link</Button>
              <Link to="/login" style={{ textAlign:"center" }}>
                <Button variant="ghost" size="sm" style={{ width:"100%",color:"var(--text-secondary)" }}>← Back to Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} dismiss={dismiss}/>
    </div>
  );
}
