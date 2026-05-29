export default function ProgressBar({ value=0, max=100, label, showPct=true, style={} }) {
  const pct = Math.round((value/max)*100);
  const color = pct>=80?"var(--success)":pct>=60?"var(--gold-400)":pct>=40?"#f97316":"var(--danger)";
  return (
    <div style={style}>
      {(label||showPct) && (
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
          {label && <span style={{ fontSize:"0.82rem",color:"var(--text-secondary)" }}>{label}</span>}
          {showPct && <span style={{ fontSize:"0.82rem",fontFamily:"var(--font-display)",fontWeight:700,color }}>{pct}%</span>}
        </div>
      )}
      <div className="prog-track">
        <div className="prog-fill" style={{ width:`${pct}%`,background:`linear-gradient(90deg,${color},${color}cc)` }}/>
      </div>
    </div>
  );
}
