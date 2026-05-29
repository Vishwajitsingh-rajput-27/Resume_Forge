import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useToast from "../hooks/useToast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ToastContainer from "../components/ui/Toast";

export default function Register() {
  const { register }  = useAuth();
  const navigate      = useNavigate();
  const { toasts, dismiss, success, error: toastErr } = useToast();
  const [form, setForm]   = useState({ name:"", email:"", password:"" });
  const [loading, setLoad]= useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.password) { toastErr("All fields are required"); return; }
    if (form.password.length < 6) { toastErr("Password must be at least 6 characters"); return; }
    setLoad(true);
    try {
      await register(form);
      success("Account created! Welcome 🎉");
      navigate("/dashboard");
    } catch (e) { toastErr(e.message || "Registration failed"); }
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
          <h1 style={{ fontFamily:"var(--font-display)",fontSize:"1.75rem",fontWeight:800 }}>Create Account</h1>
          <p style={{ color:"var(--text-secondary)",marginTop:6,fontSize:".9rem" }}>Start building your perfect resume today</p>
        </div>

        <div className="glass-card" style={{ padding:"32px 28px" }}>
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <Input label="Full name"      type="text"     value={form.name}     onChange={v=>setForm(p=>({...p,name:v}))}     icon="user"/>
            <Input label="Email address"  type="email"    value={form.email}    onChange={v=>setForm(p=>({...p,email:v}))}    icon="mail"/>
            <Input label="Password (6+ chars)" type="password" value={form.password} onChange={v=>setForm(p=>({...p,password:v}))} icon="lock"/>
            <Button variant="gold" size="md" fullWidth loading={loading} onClick={submit}>Create Account →</Button>
            <p style={{ fontSize:".72rem",color:"var(--text-muted)",textAlign:"center" }}>
              By signing up you agree to our Terms & Privacy Policy.
            </p>
            <hr className="divider"/>
            <p style={{ textAlign:"center",fontSize:".875rem",color:"var(--text-secondary)" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color:"var(--gold-400)",fontWeight:600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} dismiss={dismiss}/>
    </div>
  );
}
