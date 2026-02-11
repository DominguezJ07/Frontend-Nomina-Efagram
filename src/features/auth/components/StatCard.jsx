export default function StatCard({ title, value, change }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      {change ? <div className="stat-change">{change}</div> : null}
    </div>
  );
}
