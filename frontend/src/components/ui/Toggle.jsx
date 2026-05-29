export default function Toggle({ on, onChange, label, description, disabled=false }) {
  return (
    <div className="toggle-row">
      <div>
        {label && <div style={{ fontWeight:500,fontSize:"0.9rem" }}>{label}</div>}
        {description && <div style={{ fontSize:"0.78rem",color:"var(--text-muted)",marginTop:2 }}>{description}</div>}
      </div>
      <button role="switch" aria-checked={on} onClick={()=>!disabled&&onChange?.(!on)} disabled={disabled}
        style={{ width:46,height:26,borderRadius:99,background:on?"var(--gold-500)":"rgba(255,255,255,.12)",
                 border:"none",cursor:disabled?"not-allowed":"pointer",position:"relative",
                 transition:"background .25s ease",flexShrink:0,boxShadow:on?"0 0 10px var(--gold-glow)":"none",
                 opacity:disabled?.5:1 }}>
        <div style={{ width:20,height:20,borderRadius:"50%",background:"white",position:"absolute",
                      top:3,left:on?23:3,transition:"left .25s ease",boxShadow:"0 1px 4px rgba(0,0,0,.3)" }}/>
      </button>
    </div>
  );
}
