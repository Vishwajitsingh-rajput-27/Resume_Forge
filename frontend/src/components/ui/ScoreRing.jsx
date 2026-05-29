import { scoreColor } from "../../utils/atsCalculator";
export default function ScoreRing({ score=0, size=130, strokeWidth=10 }) {
  const r   = (size-strokeWidth)/2;
  const c   = 2*Math.PI*r;
  const col = scoreColor(score);
  return (
    <div className="score-ring" style={{ width:size,height:size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={strokeWidth}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${(score/100)*c} ${c}`}
          style={{ transition:"stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)" }}/>
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
        <span style={{ fontFamily:"var(--font-display)",fontSize:size*.18,fontWeight:800,color:col,lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:size*.09,color:"var(--text-muted)",marginTop:2 }}>/100</span>
      </div>
    </div>
  );
}
