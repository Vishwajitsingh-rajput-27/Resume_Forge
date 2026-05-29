import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useToast from "../hooks/useToast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ToastContainer from "../components/ui/Toast";

export default function Login() {
  const { login }     = useAuth();
  const navigate      = useNavigate();
  const { toasts, dismiss, success, error: toastErr } = useToast();
  const [form, setForm]   = useState({ email:"", password:"" });
  const [loading, setLoad]= useState(false);

  const submit = async () => {
    if (!form.email || !form.password) { toastErr("Please fill in all fields"); return; }
    setLoad(true);
    try {
      await login(form);
      success("Welcome back!");
      navigate("/dashboard");
    } catch (e) { toastErr(e.message || "Login failed"); }
    finally { setLoad(false); }
  };

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
      <div style={{ width:"100%",maxWidth:420,animation:"fadeInUp .6s ease" }}>
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ width:50,height:50,borderRadius:14,background:"linear-gradient(135deg,var(--gold-500),var(--gold-300))",
                        display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px" }}>
            <span style={{ color:"var(--navy-900)",fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.3rem" }}>R</span>
          </div>
          <h1 style={{ fontFamily:"var(--font-display)",fontSize:"1.75rem",fontWeight:800,letterSpacing:"-.02em" }}>Welcome Back</h1>
          <p style={{ color:"var(--text-secondary)",marginTop:6,fontSize:".9rem" }}>Sign in to your ResumeForge account</p>
        </div>

        <div className="glass-card" style={{ padding:"32px 28px" }}>
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <Input label="Email address" type="email" value={form.email}
              onChange={v=>setForm(p=>({...p,email:v}))} icon="mail"/>
            <Input label="Password" type="password" value={form.password}
              onChange={v=>setForm(p=>({...p,password:v}))} icon="lock"/>
            <div style={{ textAlign:"right" }}>
              <Link to="/forgot-password" style={{ fontSize:".8rem",color:"var(--gold-400)",fontWeight:500 }}>Forgot password?</Link>
            </div>
            <Button variant="gold" size="md" fullWidth loading={loading} onClick={submit}>Sign In →</Button>
            <hr className="divider"/>
            <p style={{ textAlign:"center",fontSize:".875rem",color:"var(--text-secondary)" }}>
              No account?{" "}
              <Link to="/register" style={{ color:"var(--gold-400)",fontWeight:600 }}>Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} dismiss={dismiss}/>
    </div>
  );
}
