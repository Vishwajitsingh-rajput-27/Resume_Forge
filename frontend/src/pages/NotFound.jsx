import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",
                  justifyContent:"center",textAlign:"center",padding:24,gap:22 }}>
      <div style={{ fontFamily:"var(--font-display)",fontSize:"6rem",fontWeight:800,lineHeight:1,
                    background:"linear-gradient(135deg,var(--gold-300),var(--gold-500))",
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>404</div>
      <h2 style={{ fontFamily:"var(--font-display)",fontSize:"1.5rem",fontWeight:700 }}>Page Not Found</h2>
      <p style={{ color:"var(--text-secondary)",fontSize:".9rem" }}>The page you're looking for doesn't exist.</p>
      <div style={{ display:"flex",gap:12 }}>
        <Button variant="gold" onClick={()=>navigate("/dashboard")}>Go to Dashboard</Button>
        <Button variant="outline" onClick={()=>navigate(-1)}>← Go Back</Button>
      </div>
    </div>
  );
}
