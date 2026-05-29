export function Dots() {
  return <span className="dots"><span/><span/><span/></span>;
}

export default function Button({
  variant="gold", size="md", loading=false, disabled=false,
  fullWidth=false, onClick, children, style={}, type="button", icon, iconRight,
}) {
  const cls = { gold:"btn-gold", outline:"btn-outline", ghost:"btn-ghost" }[variant]||"btn-gold";
  const pad = { sm:"7px 15px", md:"10px 22px", lg:"14px 32px" }[size];
  const fs  = { sm:"0.78rem", md:"0.875rem", lg:"1rem" }[size];
  return (
    <button type={type} className={cls}
      style={{ padding:pad, fontSize:fs, width:fullWidth?"100%":undefined,
               opacity:disabled||loading?.6:1, pointerEvents:disabled||loading?"none":"auto", ...style }}
      onClick={onClick} disabled={disabled||loading} aria-busy={loading}>
      {loading ? <Dots/> : <>{icon&&!iconRight&&icon}{children}{icon&&iconRight&&icon}</>}
    </button>
  );
}
