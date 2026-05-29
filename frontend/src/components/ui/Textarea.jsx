export default function Textarea({ label, value, onChange, rows=4, maxLength, placeholder, error, style={} }) {
  return (
    <div style={style}>
      {label && <label style={{display:"block",fontSize:"0.82rem",fontWeight:600,color:"var(--text-secondary)",marginBottom:7}}>{label}</label>}
      <textarea value={value} rows={rows} maxLength={maxLength}
        placeholder={placeholder||`Enter ${label?.toLowerCase()||"text"}...`}
        onChange={e=>onChange?.(e.target.value)}
        className="field-input"
        style={{ padding:14, resize:"vertical", fontFamily:"var(--font-body)", lineHeight:1.65,
                 borderColor:error?"var(--danger)":undefined }}/>
      {error && <p className="field-error">{error}</p>}
      {maxLength && value && <p style={{fontSize:"0.7rem",color:"var(--text-muted)",marginTop:3,textAlign:"right"}}>{value.length}/{maxLength}</p>}
    </div>
  );
}
