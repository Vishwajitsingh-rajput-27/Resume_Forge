export default function Badge({ children, variant="gold", style={} }) {
  const cls = { gold:"badge-gold", success:"badge-success", info:"badge-info", danger:"badge-danger" }[variant]||"badge-gold";
  return <span className={`badge ${cls}`} style={style}>{children}</span>;
}
