export default function ToastContainer({ toasts, dismiss }) {
  return (
    <div style={{ position:"fixed",bottom:24,right:24,zIndex:9999,display:"flex",flexDirection:"column",gap:10 }}>
      {toasts.map(t=>(
        <div key={t.id} className={`toast toast-${t.type} ${t.exiting?"exiting":""}`} role="alert">
          <span style={{ fontSize:"1rem",flexShrink:0 }}>
            {t.type==="success"?"✓":t.type==="error"?"✕":t.type==="ai"?"✦":"ℹ"}
          </span>
          <span style={{ flex:1 }}>{t.message}</span>
          <button onClick={()=>dismiss(t.id)} style={{ background:"none",border:"none",color:"inherit",cursor:"pointer",opacity:.7 }}>✕</button>
        </div>
      ))}
    </div>
  );
}
