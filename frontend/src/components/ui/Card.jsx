export default function Card({ children, padding=24, style={}, onClick, className="" }) {
  return (
    <div className={`glass-card ${className}`}
      style={{ padding, cursor:onClick?"pointer":undefined, ...style }}
      onClick={onClick} role={onClick?"button":undefined} tabIndex={onClick?0:undefined}>
      {children}
    </div>
  );
}
