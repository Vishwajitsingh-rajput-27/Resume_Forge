import { useState, forwardRef } from "react";
import Icon from "./Icon";

const Input = forwardRef(function Input(
  { label, type="text", value, onChange, onBlur, error, icon, placeholder=" ",
    disabled=false, maxLength, style={}, inputStyle={}, id }, ref
) {
  const [focused, setFocused] = useState(false);
  const fid = id || label?.toLowerCase().replace(/\s+/g,"-") || "field";
  const active = focused || (value?.length>0);
  return (
    <div style={{ position:"relative", ...style }}>
      {icon && (
        <div className="field-icon" style={{ color: active?"var(--gold-500)":"var(--text-muted)" }}>
          <Icon name={icon} size={16}/>
        </div>
      )}
      <input ref={ref} id={fid} type={type} value={value} placeholder={placeholder}
        disabled={disabled} maxLength={maxLength}
        onChange={e=>onChange?.(e.target.value,e)}
        onFocus={()=>setFocused(true)}
        onBlur={e=>{ setFocused(false); onBlur?.(e); }}
        className={`field-input ${icon?"has-icon":""}`}
        aria-invalid={!!error}
        style={{ borderColor:error?"var(--danger)":undefined,
                 boxShadow:error?"0 0 0 3px rgba(248,113,113,.12)":undefined, ...inputStyle }}
      />
      {label && (
        <label htmlFor={fid} className="field-label"
          style={{ left:icon?42:14, top:active?0:"50%", transform:active?"translateY(-50%)":"translateY(-50%)",
                   fontSize:active?"0.71rem":"0.875rem", background:active?"var(--navy-800)":"transparent",
                   padding:active?"0 6px":"0", color:error?"var(--danger)":active?"var(--gold-400)":"var(--text-muted)" }}>
          {label}
        </label>
      )}
      {error && <p className="field-error">{error}</p>}
      {maxLength && value && <p style={{fontSize:"0.7rem",color:"var(--text-muted)",marginTop:3,textAlign:"right"}}>{value.length}/{maxLength}</p>}
    </div>
  );
});
export default Input;
