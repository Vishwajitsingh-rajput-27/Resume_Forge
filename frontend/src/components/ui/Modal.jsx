export default function Modal({ open, onClose, title, children, footer, width=500 }) {
  if(!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeIn .2s ease" }}
      onClick={onClose}>
      <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(6px)" }}/>
      <div className="glass-card" style={{ position:"relative",width:"100%",maxWidth:width,maxHeight:"90vh",overflow:"auto",animation:"fadeInUp .3s ease" }}
        onClick={e=>e.stopPropagation()}>
        {title && (
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"22px 26px",borderBottom:"1px solid var(--glass-border)" }}>
            <h3 style={{ fontFamily:"var(--font-display)",fontWeight:700,fontSize:"1.05rem" }}>{title}</h3>
            <button className="btn-ghost" style={{ padding:6 }} onClick={onClose}>✕</button>
          </div>
        )}
        <div style={{ padding:26 }}>{children}</div>
        {footer && <div style={{ padding:"16px 26px",borderTop:"1px solid var(--glass-border)",display:"flex",justifyContent:"flex-end",gap:10 }}>{footer}</div>}
      </div>
    </div>
  );
}
